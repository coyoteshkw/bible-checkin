import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = await getDb()

  await db.execute('DELETE FROM check_ins WHERE user_id = ?', [user.id])
  return { success: true }
})
