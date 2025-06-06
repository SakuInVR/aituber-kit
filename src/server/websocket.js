const WebSocket = require('ws');
const { createServer } = require('http');

// WebSocketサーバーの設定
const PORT = process.env.WS_PORT || 3001;
const server = createServer();
const wss = new WebSocket.Server({ server });

// 接続管理
const clients = new Set();

// WebSocketサーバーの起動
wss.on('connection', (ws) => {
  console.log('新しいクライアントが接続しました');
  clients.add(ws);

  // メッセージ受信時の処理
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('受信したデータ:', data);

      // 感情パラメータの処理
      if (data.emotion) {
        console.log('感情パラメータ:', data.emotion);
        // TODO: 感情パラメータをAIキャラクターに反映する処理を実装
      }

      // メッセージの処理
      if (data.text) {
        console.log('テキストメッセージ:', data.text);
        // TODO: メッセージをAIキャラクターに送信する処理を実装
      }
    } catch (error) {
      console.error('メッセージの処理中にエラーが発生しました:', error);
    }
  });

  // 接続切断時の処理
  ws.on('close', () => {
    console.log('クライアントが切断しました');
    clients.delete(ws);
  });
});

// サーバーの起動
server.listen(PORT, () => {
  console.log(`WebSocketサーバーが起動しました - ポート: ${PORT}`);
});

module.exports = { wss, server }; 