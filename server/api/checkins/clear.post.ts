import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDb()

  await db.prepare('DELETE FROM check_ins WHERE user_id = ?').run(user.id)

  return { success: true }
})
