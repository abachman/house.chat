export type Message = {
  type?: string
  content: string
  from: string
  mid: string

  // idk, stuff?
  [key: string]: any
}
