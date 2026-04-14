import api from "./axios"

export const publicChatHandler = async (message) => {
  const res = await api.post('/public-chat', message)
  return res.data
}