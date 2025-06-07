import { Message, MessageContent } from '@/features/messages/messages'

/**
 * AIサービスとモデルに応じてメッセージを修正する
 */
export function modifyMessages(
  aiService: string,
  model: string,
  messages: Message[]
): Message[] {
  if (
    aiService === 'anthropic' ||
    aiService === 'perplexity' ||
    (aiService === 'deepseek' && model === 'deepseek-reasoner')
  ) {
    return modifyAnthropicMessages(messages)
  }
  return messages
}

/**
 * Anthropicのメッセージフォーマットに合わせて修正する
 */
function modifyAnthropicMessages(messages: Message[]): Message[] {
  const systemMessage: Message | undefined = messages.find(
    (message) => message.role === 'system'
  )
  let userMessages = messages
    .filter((message) => message.role !== 'system')
    .filter((message) => message.content !== '')

  userMessages = consolidateMessages(userMessages)

  while (userMessages.length > 0 && userMessages[0].role !== 'user') {
    userMessages.shift()
  }

  const result: Message[] = systemMessage
    ? [systemMessage, ...userMessages]
    : userMessages
  return result
}

/**
 * 同じroleのメッセージを結合する
 */
export function consolidateMessages(messages: Message[]) {
  const consolidated: Message[] = []
  let lastRole: string | null = null
  let combinedContent: string | MessageContent[]

  messages.forEach((message, index) => {
    if (message.role === lastRole) {
      if (typeof combinedContent === 'string') {
        combinedContent +=
          '\n' +
          (Array.isArray(message.content)
            ? message.content[0].text
            : message.content)
      } else {
        combinedContent[0].text +=
          '\n' +
          (Array.isArray(message.content)
            ? message.content[0].text
            : message.content)
      }
    } else {
      if (lastRole !== null) {
        consolidated.push({
          role: lastRole as import('@/features/messages/messages').Message['role'],
          content: combinedContent,
        })
      }
      lastRole = message.role
      combinedContent = message.content || ''
      if (Array.isArray(combinedContent)) {
        combinedContent = combinedContent.map((c) => {
          if (c.type === 'image' && !('text' in c)) {
            return { ...(c as any), text: '' }
          }
          return c
        })
      }
    }

    if (index === messages.length - 1) {
      consolidated.push({
        role: lastRole as import('@/features/messages/messages').Message['role'],
        content: combinedContent,
      })
    }
  })

  return consolidated
}
