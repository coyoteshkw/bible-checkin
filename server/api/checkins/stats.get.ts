import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = await getDb()

  const thisMonth = (await db.query("SELECT COUNT(DISTINCT date) as count FROM check_ins WHERE user_id = ? AND date >= date('now', 'start of month')", [user.id])).rows[0] as any

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const found = (await db.query('SELECT id FROM check_ins WHERE user_id = ? AND date = ? LIMIT 1', [user.id, dateStr])).rows[0]
    if (found) streak++
    else break
  }

  return { thisMonth: thisMonth?.count || 0, streak }
})
