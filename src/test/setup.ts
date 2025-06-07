import '@testing-library/jest-dom'
import 'web-streams-polyfill'

// fetchのモック
global.fetch = jest.fn()

// タイマーのモック
jest.useFakeTimers()

// Requestのモック
global.Request = jest.fn().mockImplementation((input, init) => ({
  ...input,
  ...init,
  json: () => Promise.resolve(JSON.parse(init?.body || '{}')),
}))

// テスト終了時にモックをクリア
afterEach(() => {
  jest.clearAllMocks()
})
