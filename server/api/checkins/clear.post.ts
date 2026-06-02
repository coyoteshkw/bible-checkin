import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const db = getDb()

  db.prepare('DELETE FROM check_ins WHERE user_id = ?').run(user.id)

  return { success: true }
})
