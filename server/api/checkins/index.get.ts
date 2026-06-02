import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const db = getDb()

  // 按日期查：?date=2025-01-20
  if (query.date) {
    const rows = db.prepare(`
      SELECT * FROM check_ins
      WHERE user_id = ? AND date = ?
      ORDER BY created_at DESC
    `).all(user.id, query.date)

    return { checkIns: rows }
  }

  // 按月份查（日历高亮用）：?month=2025-01
  if (query.month) {
    const startDate = `${query.month}-01`
    const rows = db.prepare(`
      SELECT DISTINCT date FROM check_ins
      WHERE user_id = ? AND date >= ? AND date < date(?, '+1 month')
      ORDER BY date
    `).all(user.id, startDate, startDate)

    return { dates: rows.map((r: any) => r.date) }
  }

  // 默认返回最近 7 天
  const rows = db.prepare(`
    SELECT * FROM check_ins
    WHERE user_id = ? AND date >= date('now', '-7 days')
    ORDER BY date DESC, created_at DESC
  `).all(user.id)

  return { checkIns: rows }
})
