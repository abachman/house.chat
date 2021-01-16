import React, { useCallback } from 'react'
import { useRef } from 'react'
import form from '../styles/form.module.css'

type FormProps = {
  onSubmit: (value: string) => void
}

export const Form = (props: FormProps) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const submit = useCallback(() => {
    if (inputRef.current) {
      props.onSubmit(inputRef.current.value)
      inputRef.current.value = ''
    }
  }, [props])

  return (
    <form
      className={form.form}
      onKeyPress={(evt) => {
        if (evt.key === 'Enter' && !evt.shiftKey) {
          evt.preventDefault()
          submit()
        }
      }}
      onSubmit={(evt) => {
        evt.preventDefault()
        submit()
      }}
    >
      <textarea name="text" ref={inputRef} placeholder="message..." rows={2} />
      <input type="submit" value="SEND" />
    </form>
  )
}
