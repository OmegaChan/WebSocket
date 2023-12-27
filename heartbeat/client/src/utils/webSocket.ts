/* eslint-disable @typescript-eslint/no-unused-vars */
import { timeOut, timeOutServer, reconnectTimeout } from './constant';
import { WsConstructor, WebSocketExp, WsProps, MessageFunc } from './type';

/**
 * 初始化websocket
 */
function initWebSocket (ws: WebSocketExp, onMessageCallback: MessageFunc) {
  ws.onMessageCallback = onMessageCallback;
  ws.onmessage = function (this: WebSocket, ev: MessageEvent): void {
    // 传递 onMessageCallback
		onMessage.call(this, ev, onMessageCallback);
	};
  ws.onopen = onOpen;
  ws.onclose = onClose;
  ws.onerror = onError;
}

/**
 * 清除定时器
 */
function clearTimeout(ws: WebSocketExp): void {
  ws.timer && window.clearTimeout(ws.timer);
  ws.serverTimer && window.clearTimeout(ws.serverTimer);
  ws.debounceTimer && window.clearTimeout(ws.debounceTimer);
}

/**
 * 心跳机制函数
 */
function heartCheck (ws: WebSocketExp): void {
  ws.timer = setTimeout(() => {
    // 定时发送心跳信息
     // 和后端约定，心跳发送标识为: HeartBeat
    ws.send(JSON.stringify({ type: 'systemInfo', data: 'HeartBeat' }));
    ws.serverTimer = setTimeout(function () {
      // 发起了心跳检查， timeOutServer 时间后还是没有返回(没有调用reset清除定时器)，那就直接关闭
      ws.close();
    }, timeOutServer);
  }, timeOut);
}

/**
 * 重置心跳检查
 */
function reset(ws: WebSocketExp): void {
  clearTimeout(ws);
  heartCheck(ws);
}

/**
 * 重连操作
 */
function reconnect(ws: WebSocketExp): void {
  // 节流
  clearTimeout(ws); // 如果发起重连，则关闭心跳等定时器
  const callNow = !ws.debounceTimer;
  ws.debounceTimer = setTimeout(() => {
    ws.debounceTimer = null;
    reconnect(ws); // 已进行过重连的，下一次必须经过 reconnectTimeout 之后才能再次发起重连
  }, reconnectTimeout);
  if (callNow) {
    console.warn(`[心跳：WS RECONNECT](${ws.url})`);
    wsConstructor({
      url: ws.url,
      onMessageCallback: ws.onMessageCallback,
    });
  }
}

/**
 * 收到服务器数据后的回调函数
 */
function onMessage(
	this: WebSocket,
	ev: MessageEvent,
	onMessageCallback: MessageFunc
): void {
  // 与后端约定，心跳反馈标识为: alive，得到 alive 标识链接正常, 清除定时器
  if (ev.data === 'alive') {
    console.log('心跳信息');
    reset(this as WebSocketExp);
    return;
  }
  onMessageCallback(ev.data );
}

/**
 * 报错时的回调函数
 */
function onError (this: WebSocket, ev: Event) {
	console.error(`[WS ERROR](${this.url}) 异常`, { ev });
	this.close();
}

/**
 * 连接关闭后的回调函数
 */
function onClose (this: WebSocket, ev: CloseEvent) {
	console.warn(`[WS CLOSED](${this.url}) ${ev.code}: ${ev.reason}`);
  reconnect(this as WebSocketExp);
}

/**
 * 连接成功后的回调函数
 */
function onOpen (this: WebSocket, ev: Event) {
  // this指向new的实例
	console.log(`ws: ${this.url} connection succeeded, 链接事件：${ev}`);
  heartCheck(this as WebSocketExp);
}

export const wsConstructor: WsConstructor = (props: WsProps) => {
  const { url, onMessageCallback } = props;
  if (!WebSocket) {
    console.log('当前浏览器不支持websocket');
    return {
      ws: undefined
    };
  }
  const ws: WebSocketExp = (new WebSocket(url)) as WebSocketExp;
  initWebSocket(ws, onMessageCallback);
  return {
    ws,
  }
}