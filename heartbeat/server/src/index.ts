import express, { Request, Response } from 'express';
import expressWs, { Application } from 'express-ws';
import * as ws from "ws";

const app: Application = express() as unknown as Application;
expressWs(app) // 将 WebSocket 服务混入 app，相当于为 app 添加 .ws 方法

app.get('/', function (req: Request, res: Response) {
  res.send('Hello World!')
});

app.ws('/websocket', function (ws: ws, req: Request) {
  
  // 使用 ws 的 send 方法向连接另一端的客户端发送数据
  ws.send('connect to express server with WebSocket success')

  // 使用 on 方法监听事件
  //   message 事件表示从另一段（服务端）传入的数据
  ws.on('message', function (msg: any) {
    // console.log(`receive message ${msg}`);
    if (JSON.parse(msg).type === 'systemInfo' && JSON.parse(msg).data === 'HeartBeat') {
      ws.send('alive');
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      if (randomNumber > 9) {
        ws.terminate();
        console.log('断开连接');
      } else {
        console.log('保持心跳连接');
      }
    } else {
      ws.send('default response', msg);
    }
  })


  // close 事件表示客户端断开连接时执行的回调函数
  ws.on('close', function (e: any) {
    console.log('close connection', e)
  })
})


const port = 3000
app.listen(port, () => {console.log(`express server listen at http://localhost:${port}`)})