import { useEffect, useState } from 'react'

const fallbackFeed = {
  source: 'fallback',
  username: 'prachi.rajput.011',
  profileUrl: 'https://www.instagram.com/prachi.rajput.011/',
  mediaCount: null,
  followersCount: null,
  items: [],
}

export function useInstagramFeed() {
  const [feed, setFeed] = useState(fallbackFeed)

  useEffect(() => {
    let active = true

    fetch(`${import.meta.env.BASE_URL}instagram-feed.json`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : fallbackFeed))
      .then((data) => {
        if (active) setFeed({ ...fallbackFeed, ...data })
      })
      .catch(() => {
        if (active) setFeed(fallbackFeed)
      })

    return () => {
      active = false
    }
  }, [])

  return feed
}
