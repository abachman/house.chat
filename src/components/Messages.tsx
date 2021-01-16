import React from 'react'
import style from '../styles/messages.module.css'
import { Message } from '../models/Message'

type MessagesProps = {
  messages: Message[]
}

export const Messages = (props: MessagesProps) => {
  return (
    <div className={style.messages}>
      {props.messages.map((message) => {
        return (
          <div
            key={message.mid}
            className="message"
            id={`message-${message.mid}`}
          >
            <strong>{message.from}</strong>
            <span className="content">{message.content}</span>
          </div>
        )
      })}
    </div>
  )
}
