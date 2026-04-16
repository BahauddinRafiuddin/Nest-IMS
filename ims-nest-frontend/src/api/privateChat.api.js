import api from "./axios"
export const privateChatHandler = async ( message ) => {
  const res = await api.post('/chatbot/private', message)
  return res.data
}