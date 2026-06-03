import { defineEventHandler, getCookie, deleteCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'session_token')
  if (token) {
    await deleteSession(token)
  }
  deleteCookie(event, 'session_token')
  return { success: true }
})
