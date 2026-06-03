import { defineEventHandler } from 'h3'
import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDb()

  // 本月打卡天数
  const monthStart = `date('now', 'start of month')`
  const thisMonth = await db.prepare(`
    SELECT COUNT(DISTINCT date) as count
    FROM check_ins
    WHERE user_id = ? AND date >= ${monthStart}
  `).get(user.id) as { count: number }

  // 连续打卡天数
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    const found = await db.prepare('SELECT id FROM check_ins WHERE user_id = ? AND date = ? LIMIT 1').get(user.id, dateStr)
    if (found) {
      streak++
    } else {
      break
    }
  }

  return { thisMonth: thisMonth.count, streak }
})
