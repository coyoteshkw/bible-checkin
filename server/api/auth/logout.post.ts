import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const token = getCookie(event, 'session_token')
  if (token) {
    const db = await getDb()
    await db.execute('DELETE FROM sessions WHERE id = ?', [token])
  }
  deleteCookie(event, 'session_token')
  return { success: true }
})
