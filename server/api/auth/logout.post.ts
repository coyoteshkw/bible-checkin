import { defineEventHandler, getCookie, deleteCookie } from 'h3'
import { deleteSession } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'session_token')
  if (token) {
    deleteSession(token)
  }
  deleteCookie(event, 'session_token')
  return { success: true }
})
