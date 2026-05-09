import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const outputPath = path.resolve('public', 'instagram-feed.json')
const profileUrl = 'https://www.instagram.com/prachi.rajput.011/'
const fallback = {
  source: 'fallback',
  username: 'prachi.rajput.011',
  profileUrl,
  mediaCount: null,
  followersCount: null,
  items: [],
}

function cleanToken(value) {
  return (value || '')
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/^["']|["']$/g, '')
    .trim()
}

async function readExistingFallback() {
  try {
    return JSON.parse(await readFile(outputPath, 'utf8'))
  } catch {
    return fallback
  }
}

function normalizeInsights(response) {
  return (response?.data || []).reduce((acc, metric) => {
    acc[metric.name] = metric.values?.[0]?.value ?? null
    return acc
  }, {})
}

async function fetchMediaInsights(item, token, authOptions) {
  const metricSets = [
    'views,reach,likes,comments,saved,shares,total_interactions',
    'plays,reach,likes,comments,saved,shares,total_interactions',
    'views',
  ]

  for (const metrics of metricSets) {
    try {
      return normalizeInsights(
        await requestFirstJson([
          {
            label: `insights-header-${item.id}-${metrics}`,
            url: `https://graph.instagram.com/v25.0/${item.id}/insights?metric=${encodeURIComponent(metrics)}`,
            options: authOptions,
          },
          {
            label: `insights-query-${item.id}-${metrics}`,
            url: `https://graph.instagram.com/v25.0/${item.id}/insights?metric=${encodeURIComponent(metrics)}&access_token=${encodeURIComponent(token)}`,
          },
        ]),
      )
    } catch {
      // Some media types/tokens do not expose every insight metric. Try the next set.
    }
  }

  return {}
}

async function enrichMediaWithInsights(items, token, authOptions) {
  return Promise.all(
    items.map(async (item) => {
      if (item.media_type !== 'VIDEO' && item.media_type !== 'REELS') return { item, insights: {} }
      return { item, insights: await fetchMediaInsights(item, token, authOptions) }
    }),
  )
}

function normalizeMedia(item, insights = {}) {
  return {
    id: item.id,
    caption: item.caption || '',
    mediaType: item.media_type || 'IMAGE',
    mediaUrl: item.media_url || item.thumbnail_url || '',
    thumbnailUrl: item.thumbnail_url || item.media_url || '',
    permalink: item.permalink || profileUrl,
    timestamp: item.timestamp || '',
    likeCount: item.like_count ?? null,
    commentsCount: item.comments_count ?? null,
    viewCount: insights.views ?? insights.plays ?? null,
    reachCount: insights.reach ?? null,
    sharesCount: insights.shares ?? null,
    savedCount: insights.saved ?? null,
    totalInteractions: insights.total_interactions ?? null,
  }
}

function redactSecret(text) {
  return text
    .replaceAll(cleanToken(process.env.INSTAGRAM_ACCESS_TOKEN) || '__NO_BASIC_TOKEN__', '[redacted]')
    .replaceAll(cleanToken(process.env.META_ACCESS_TOKEN) || '__NO_META_TOKEN__', '[redacted]')
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${response.status} ${response.statusText}: ${redactSecret(body).slice(0, 500)}`)
  }
  return response.json()
}

async function requestFirstJson(requests) {
  const errors = []

  for (const request of requests) {
    try {
      return await requestJson(request.url, request.options)
    } catch (error) {
      errors.push(`${request.label}: ${error.message}`)
    }
  }

  throw new Error(errors.join(' | '))
}

async function resolveInstagramBusinessAccount(token) {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const pageFields = 'id,name,access_token,instagram_business_account,connected_instagram_account'

  if (process.env.INSTAGRAM_BUSINESS_USER_ID) {
    return {
      instagramUserId: process.env.INSTAGRAM_BUSINESS_USER_ID,
      pageAccessToken: token,
    }
  }

  const pages = await requestJson(
    `https://graph.facebook.com/v25.0/me/accounts?fields=${encodeURIComponent(pageFields)}&access_token=${encodeURIComponent(token)}`,
  )

  const page = (pages.data || []).find((item) => {
    if (pageId && item.id !== pageId) return false
    return item.instagram_business_account?.id || item.connected_instagram_account?.id
  })

  if (!page) {
    throw new Error(
      'No connected Instagram professional account found from /me/accounts. Link the Instagram Creator/Business account to a Facebook Page, or set INSTAGRAM_BUSINESS_USER_ID manually.',
    )
  }

  return {
    instagramUserId: page.instagram_business_account?.id || page.connected_instagram_account?.id,
    pageAccessToken: page.access_token || token,
    pageName: page.name,
  }
}

async function fetchBusinessGraphFeed() {
  const token = cleanToken(process.env.META_ACCESS_TOKEN)
  if (!token) return null

  const { instagramUserId, pageAccessToken, pageName } = await resolveInstagramBusinessAccount(token)

  const fields = [
    'username',
    'followers_count',
    'media_count',
    'profile_picture_url',
    'media.limit(12){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count}',
  ].join(',')
  const url = `https://graph.facebook.com/v25.0/${instagramUserId}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(pageAccessToken)}`
  const data = await requestJson(url)

  return {
    source: 'instagram-business-graph',
    username: data.username || fallback.username,
    profileUrl,
    profilePictureUrl: data.profile_picture_url || '',
    pageName: pageName || '',
    mediaCount: data.media_count ?? null,
    followersCount: data.followers_count ?? null,
    items: (data.media?.data || []).map(normalizeMedia).filter((item) => item.mediaUrl),
    fetchedAt: new Date().toISOString(),
  }
}

async function fetchBasicDisplayFeed() {
  const token = cleanToken(process.env.INSTAGRAM_ACCESS_TOKEN)
  if (!token) return null

  const authOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const profileFields = 'id,username,name,account_type,media_count,profile_picture_url,followers_count'
  const profile = await requestFirstJson([
    {
      label: 'instagram-login-profile-header',
      url: `https://graph.instagram.com/v25.0/me?fields=${encodeURIComponent(profileFields)}`,
      options: authOptions,
    },
    {
      label: 'instagram-login-profile-query',
      url: `https://graph.instagram.com/v25.0/me?fields=${encodeURIComponent(profileFields)}&access_token=${encodeURIComponent(token)}`,
    },
    {
      label: 'basic-display-profile-query',
      url: `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${encodeURIComponent(token)}`,
    },
  ])

  const mediaFields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
  const media = await requestFirstJson([
    {
      label: 'instagram-login-media-by-id-header',
      url: `https://graph.instagram.com/v25.0/${profile.id}/media?fields=${encodeURIComponent(mediaFields)}&limit=12`,
      options: authOptions,
    },
    {
      label: 'instagram-login-media-me-header',
      url: `https://graph.instagram.com/v25.0/me/media?fields=${encodeURIComponent(mediaFields)}&limit=12`,
      options: authOptions,
    },
    {
      label: 'basic-display-media-query',
      url: `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12&access_token=${encodeURIComponent(token)}`,
    },
  ])

  const itemsWithInsights = await enrichMediaWithInsights(media.data || [], token, authOptions)

  return {
    source: 'instagram-access-token',
    username: profile.username || fallback.username,
    profileUrl,
    profilePictureUrl: profile.profile_picture_url || '',
    mediaCount: profile.media_count ?? null,
    followersCount: profile.followers_count ?? null,
    items: itemsWithInsights.map(({ item, insights }) => normalizeMedia(item, insights)).filter((item) => item.mediaUrl),
    fetchedAt: new Date().toISOString(),
  }
}

async function main() {
  await mkdir(path.dirname(outputPath), { recursive: true })

  try {
    const feed = (await fetchBasicDisplayFeed()) || (await fetchBusinessGraphFeed())
    if (!feed) {
      const existing = await readExistingFallback()
      await writeFile(outputPath, `${JSON.stringify({ ...fallback, ...existing }, null, 2)}\n`)
      console.log('Instagram token not configured. Using fallback feed.')
      return
    }

    await writeFile(outputPath, `${JSON.stringify(feed, null, 2)}\n`)
    console.log(`Instagram feed saved with ${feed.items.length} media item(s).`)
  } catch (error) {
    const existing = await readExistingFallback()
    await writeFile(
      outputPath,
      `${JSON.stringify(
        {
          ...fallback,
          ...existing,
          source: 'fallback-error',
          error: error.message,
          fetchedAt: new Date().toISOString(),
        },
        null,
        2,
      )}\n`,
    )
    console.warn(`Instagram feed unavailable. Using fallback feed. ${error.message}`)
  }
}

main()
