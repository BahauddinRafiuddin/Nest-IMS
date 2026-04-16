import api from "./axios"

export const publicChatHandler = async (data) => {
  const res = await api.post('/chatbot/public', data)
  return res.data
}