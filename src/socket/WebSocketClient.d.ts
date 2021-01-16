declare interface WebSocketClient<T> {
  // on(event: 'open', listener: (evt: WebSocketEventMap['open']) => void): this
  // on(event: 'close', listener: (evt: WebSocketEventMap['close']) => void): this
  // on(event: 'message', listener: (data: object | string) => void): this
  // on(event: string, listener: Function): this

  on(event: 'open', listener: (clientId: string) => void): this
  on(event: 'connect', listener: (otherClientId: string) => void): this
  on(event: 'disconnect', listener: (otherClientId: string) => void): this
  on(event: 'data', listener: (message: T, otherClientId: string) => void): this
  on(
    event: 'dataString',
    listener: (message: string, otherClientId: string) => void
  ): this
}
