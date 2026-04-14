import api from "./axios"
export const privateChatHandler = async ( message ) => {
  const res = await api.post('/private-chat/private', message)
  return res.data
}