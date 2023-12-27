export type MessageFunc = (res: unknown) => void

export interface WebSocketExp extends WebSocket {
  onMessageCallback: MessageFunc; // 保存使用者的回调方法
  timer?: NodeJS.Timeout | null;
  serverTimer?: NodeJS.Timeout | null
  debounceTimer?: NodeJS.Timeout | null
}

interface WSReturn {
  ws: WebSocketExp | undefined
}

export interface WsProps {
  url: string
  onMessageCallback: MessageFunc; // 保存使用者的回调方法
}

export type WsConstructor = (props: WsProps) => WSReturn;