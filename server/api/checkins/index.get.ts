import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const db = await getDb()

  if (query.date) {
    const rows = (await db.query('SELECT * FROM check_ins WHERE user_id = ? AND date = ? ORDER BY created_at DESC', [user.id, query.date])).rows
    return { checkIns: rows }
  }

  if (query.month) {
    const startDate = `${query.month}-01`
    const rows = (await db.query("SELECT DISTINCT date FROM check_ins WHERE user_id = ? AND date >= ? AND date < date(?, '+1 month') ORDER BY date", [user.id, startDate, startDate])).rows
    return { dates: rows.map((r: any) => r.date) }
  }

  const before = query.before as string | undefined
  const limit = parseInt((query.limit as string) || '7', 10)

  if (before) {
    const rows = (await db.query('SELECT * FROM check_ins WHERE user_id = ? AND date < ? ORDER BY date DESC, created_at DESC LIMIT ?', [user.id, before, limit])).rows
    return { checkIns: rows }
  }

  const days = parseInt((query.days as string) || '7', 10)
  const rows = (await db.query("SELECT * FROM check_ins WHERE user_id = ? AND date >= date('now', ?) ORDER BY date DESC, created_at DESC", [user.id, `-${days} days`])).rows
  return { checkIns: rows }
})
