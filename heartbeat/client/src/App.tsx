import { useEffect, useState, ChangeEventHandler } from 'react';
import * as React from 'react';
import { wsConstructor } from './utils/index';
import './App.css'

function App() {
  const [message, setMessage] = useState<string>('');

  const [ws, setWs] = useState<WebSocket>();

  useEffect(() => {
    const { ws } = wsConstructor({
      url: 'ws://localhost:3000/websocket',
      onMessageCallback: (res) => {
        console.log('接收到服务器应答：', res);
      }
    });
    if (ws) {
      setWs(ws);
    }
  }, []);

  const sendMessage = () => {
    console.log('发送信息', message);
    message && ws?.send(message);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setMessage(event?.target.value);
  }


  return (
    <>
      <input
        type="text"
        id="message"
        name="message"
        onChange={handleChange}
        value={message}
      />
      <div className='brHeight' />
      <button onClick={() => sendMessage()}>
        发送信息
      </button>
    </>
  )
}

export default App
