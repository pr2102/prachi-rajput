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

async function readExistingFallback() {
  try {
    return JSON.parse(await readFile(outputPath, 'utf8'))
  } catch {
    return fallback
  }
}

function normalizeMedia(item) {
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
  }
}

async function requestJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${response.status} ${response.statusText}: ${body.replaceAll(process.env.INSTAGRAM_ACCESS_TOKEN || '__NO_BASIC_TOKEN__', '[redacted]').replaceAll(process.env.META_ACCESS_TOKEN || '__NO_META_TOKEN__', '[redacted]').slice(0, 360)}`)
  }
  return response.json()
}

async function fetchBusinessGraphFeed() {
  const token = process.env.META_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_BUSINESS_USER_ID
  if (!token || !userId) return null

  const fields = [
    'username',
    'followers_count',
    'media_count',
    'profile_picture_url',
    'media.limit(12){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count}',
  ].join(',')
  const url = `https://graph.facebook.com/v20.0/${userId}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`
  const data = await requestJson(url)

  return {
    source: 'instagram-business-graph',
    username: data.username || fallback.username,
    profileUrl,
    profilePictureUrl: data.profile_picture_url || '',
    mediaCount: data.media_count ?? null,
    followersCount: data.followers_count ?? null,
    items: (data.media?.data || []).map(normalizeMedia).filter((item) => item.mediaUrl),
    fetchedAt: new Date().toISOString(),
  }
}

async function fetchBasicDisplayFeed() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return null

  const profile = await requestJson(
    `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${encodeURIComponent(token)}`,
  )
  const media = await requestJson(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12&access_token=${encodeURIComponent(token)}`,
  )

  return {
    source: 'instagram-basic-display',
    username: profile.username || fallback.username,
    profileUrl,
    mediaCount: profile.media_count ?? null,
    followersCount: null,
    items: (media.data || []).map(normalizeMedia).filter((item) => item.mediaUrl),
    fetchedAt: new Date().toISOString(),
  }
}

async function main() {
  await mkdir(path.dirname(outputPath), { recursive: true })

  try {
    const feed = (await fetchBusinessGraphFeed()) || (await fetchBasicDisplayFeed())
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
