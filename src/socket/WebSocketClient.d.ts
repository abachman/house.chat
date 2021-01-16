import { WsMessage } from './WebSocketClient'

declare interface WebSocketClient {
  on(event: 'open', listener: (clientId: string) => void): this
  on(event: 'connect', listener: (otherClientId: string) => void): this
  on(event: 'disconnect', listener: (otherClientId: string) => void): this
  on(
    event: 'data',
    listener: (message: WsMessage, otherClientId: string) => void
  ): this
  on(
    event: 'dataString',
    listener: (message: string, otherClientId: string) => void
  ): this
}
