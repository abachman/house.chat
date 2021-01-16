//
// The internal WebSocket wrapping interface. Does reconnection and JSON parsing
// automatically.
//
import EventEmitter3 from 'eventemitter3'

declare global {
  interface Window {
    WS_DEBUG: boolean
  }
}

type PayloadMessage = {
  [key: string]: any
}

export type WsMessage = {
  type: string
  [key: string]: any
}

export declare interface WebSocketClient {
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

export class WebSocketClient extends EventEmitter3 {
  reconnect_interval: number
  url: string
  instance?: WebSocket

  constructor(url: string) {
    super()
    this.url = url
    this.reconnect_interval = 1500
  }

  tryParse(jsonString: string): WsMessage | string {
    try {
      const data = JSON.parse(jsonString)
      return data as WsMessage
    } catch (ex) {
      if (window.WS_DEBUG) {
        console.error(
          '[WebSocketClient error] failed to parse data blob as JSON:',
          jsonString
        )
      }
      return jsonString
    }
  }

  open() {
    this.instance = new WebSocket(this.url)

    const self = this

    this.instance.onopen = function (evt: WebSocketEventMap['open']) {
      if (window.WS_DEBUG) console.log('[WebSocketClient on open]')
      // self.emit('open', evt)
    }

    this.instance.onclose = function (evt) {
      if (window.WS_DEBUG) console.log('[WebSocketClient on close]')
      switch (evt.code) {
        case 1000: // CLOSE_NORMAL
          if (window.WS_DEBUG) console.log('WebSocketClient: closed')
          break
        default:
          // Abnormal closure
          self.reconnect(evt)
          break
      }
      // self.emit('close', evt)
    }

    this.instance.onerror = function (evt: WebSocketEventMap['error']) {
      if (window.WS_DEBUG) console.log('[WebSocketClient on error]')
      console.error('[WebSocketClient] error', evt)
      self.reconnect(evt)
    }

    this.instance.onmessage = function (evt) {
      if (window.WS_DEBUG) console.log('[WebSocketClient on message]')
      self.handleMessage(evt.data)
    }

    if (window.WS_DEBUG) console.log('[WebSocketClient open] completed')
  }

  handleMessage(data: WebSocketEventMap['message']['data']) {
    const message = this.tryParse(data)

    if (typeof message === 'string') {
      console.error(
        '[WebSocketClient error] failed to unpack message data from',
        message
      )
      return
    }

    if (message.type) {
      switch (message.type) {
        case 'onopen':
          this.emit('open', message.id)
          break
        case 'connect':
          this.emit('connect', message.id)
          break
        case 'disconnect':
          this.emit('disconnect', message.id)
          break
        case 'data':
          if (window.WS_DEBUG) {
            console.log('[WebSocketClient] receiving data.data', message)
          }

          // try parsing data in case it's double-wrapped JSON
          const payload = this.tryParse(message.data)

          if (typeof payload === 'string') {
            this.emit('dataString', payload, message.id)
          } else {
            this.emit('data', payload as WsMessage, message.id)
          }
          break
      }
    } else {
      this.emit('dataString', message, message.id)
    }
  }

  reset() {
    if (this.instance) {
      this.instance.onopen = null
      this.instance.onclose = null
      this.instance.onerror = null
      this.instance.onmessage = null
    }
  }

  reconnect(evt: any) {
    if (window.WS_DEBUG)
      console.log(
        'WebSocketClient: retry in',
        this.reconnect_interval,
        'ms',
        evt
      )
    this.reset()

    const self = this
    setTimeout(function () {
      if (window.WS_DEBUG) console.log('WebSocketClient: reconnecting...')
      self.open()
    }, this.reconnect_interval)
  }

  send(message: PayloadMessage) {
    if (this.instance) {
      if (typeof message === 'string') {
        this.instance.send(message)
      } else {
        this.instance.send(JSON.stringify({ type: 'data', ...message }))
      }
    }
  }

  // detach event listeners and close the socket
  close() {
    if (this.instance) {
      if (this.instance.readyState !== WebSocket.CLOSED) {
        this.instance.close()
      }
    }
  }
}

// export const startWebsocket = (url) => {
//   const socketEvents = new EventEmitter3()
//   const sock = new WebSocketClient()
//
//   sock.open(url)
//
//   function send(message) {
//     sock.send(message)
//   }
//
//   function close() {
//     try {
//       sock.close()
//     } catch (ex) {
//       if (window.WS_DEBUG) {
//         console.error('close failed', ex.message)
//       }
//     }
//   }
//
//   socketEvents.on('close', close)
//
//   sock.onopen = function () {
//     if (window.WS_DEBUG) console.log('socket connected')
//
//     // external client-to-library API "methods"
//     socketEvents.on('send', send)
//   }
//
//   sock.onclose = function () {
//     if (window.WS_DEBUG) console.log('socket closed')
//     socketEvents.removeListener('send', send)
//     socketEvents.removeListener('close', close)
//     socketEvents.emit('onclose')
//   }
//   sock.onerror = sock.onclose
//
//   function handleDataString(data) {
//     const message = JSON.parse(data)
//
//     if (message.type) {
//       switch (message.type) {
//         case 'onopen':
//           socketEvents.emit('onopen', message.id)
//           break
//         case 'connect':
//           socketEvents.emit('connect', message.id)
//           break
//         case 'disconnect':
//           socketEvents.emit('disconnect', message.id)
//           break
//         case 'data':
//           if (window.WS_DEBUG) {
//             console.log('[p5.websocket] receiving data', message)
//           }
//           // try parsing data in case it's double-wrapped JSON
//           let data = tryParse(message.data)
//           socketEvents.emit('data', data, message.id)
//           break
//       }
//     } else {
//       socketEvents.emit('data', message, message.id)
//     }
//   }
//
//   sock.onmessage = function (data) {
//     if (data instanceof Blob) {
//       const reader = new FileReader()
//       reader.onload = function () {
//         handleDataString(reader.result)
//       }
//       reader.readAsText(data)
//     } else if (typeof data == 'string') {
//       handleDataString(data)
//     }
//   }
//
//   return socketEvents
// }
