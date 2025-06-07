import type { NextApiRequest, NextApiResponse } from 'next'

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const liveId = req.query.liveId || process.env.NEXT_PUBLIC_YOUTUBE_LIVE_ID
  const apiKey = req.query.apiKey || YOUTUBE_API_KEY
  const pageToken = req.query.pageToken || ''

  if (!apiKey || !liveId) {
    res.status(400).json({ error: 'APIキーまたはライブIDが未設定です' })
    return
  }

  const url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveId}&part=snippet,authorDetails&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`

  try {
    const infoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${liveId}&key=${apiKey}`
    const infoRes = await fetch(infoUrl)
    const infoData = await infoRes.json()
    const liveChatId =
      infoData.items?.[0]?.liveStreamingDetails?.activeLiveChatId
    if (!liveChatId) {
      res.status(400).json({ error: 'ライブチャットIDが取得できませんでした' })
      return
    }
    const chatUrl = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`
    const chatRes = await fetch(chatUrl)
    const chatData = await chatRes.json()
    const comments = (chatData.items || []).map((item: any) => ({
      id: item.id,
      author: item.authorDetails?.displayName,
      message: item.snippet?.displayMessage,
      publishedAt: item.snippet?.publishedAt,
    }))
    res.status(200).json({ comments, nextPageToken: chatData.nextPageToken })
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'YouTubeコメント取得失敗', detail: e.message })
  }
}
