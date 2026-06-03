import { defineEventHandler, getQuery } from 'h3'
import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const db = await getDb()

  // 按日期查：?date=2025-01-20
  if (query.date) {
    const rows = await db.prepare(`
      SELECT * FROM check_ins
      WHERE user_id = ? AND date = ?
      ORDER BY created_at DESC
    `).all(user.id, query.date)

    return { checkIns: rows }
  }

  // 按月份查（日历高亮用）：?month=2025-01
  if (query.month) {
    const startDate = `${query.month}-01`
    const rows = await db.prepare(`
      SELECT DISTINCT date FROM check_ins
      WHERE user_id = ? AND date >= ? AND date < date(?, '+1 month')
      ORDER BY date
    `).all(user.id, startDate, startDate)

    return { dates: rows.map((r: any) => r.date) }
  }

  // 按日期分页查询（时间线用）：?before=2026-05-26&limit=7
  const before = query.before as string | undefined
  const limit = parseInt((query.limit as string) || '7', 10)

  if (before) {
    const rows = await db.prepare(`
      SELECT * FROM check_ins
      WHERE user_id = ? AND date < ?
      ORDER BY date DESC, created_at DESC
      LIMIT ?
    `).all(user.id, before, limit)

    return { checkIns: rows }
  }

  // 默认返回最近 N 天（按时间范围，不是按条数）
  const days = parseInt((query.days as string) || '7', 10)
  const rows = await db.prepare(`
    SELECT * FROM check_ins
    WHERE user_id = ? AND date >= date('now', ?)
    ORDER BY date DESC, created_at DESC
  `).all(user.id, `-${days} days`)

  return { checkIns: rows }
})
