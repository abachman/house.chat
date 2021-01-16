import React, { useCallback, useEffect, useState } from 'react'
import { Form } from './components/Form'
import './App.css'
import { WebSocketClient, WsMessage } from './socket/WebSocketClient'
import { v4 as uuid } from 'uuid'
import { Message } from './models/Message'
import { Messages } from './components/Messages'

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [socket, setSocket] = useState<WebSocketClient>()

  useEffect(() => {
    const socket = new WebSocketClient(
      'wss://chat.reasonable.systems/house.chat'
    )

    socket.on('data', (msg: WsMessage, id) => {
      console.log('message from', id)
      setMessages((prev) => [
        ...prev,
        { content: msg.content, from: id, mid: uuid() },
      ])
    })

    socket.open()

    setSocket(socket)
  }, [])

  const send = useCallback(
    (text: string) => {
      if (socket) {
        socket.send({ content: text })
      }
    },
    [socket]
  )

  return (
    <div className="App">
      <header className="App-header">
        <h1>house.chat</h1>
      </header>

      <main className="App-main">
        <Form onSubmit={(value: string) => send(value)} />
        <Messages messages={messages} />
      </main>
    </div>
  )
}

export default App
