import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = getDb()

  // 确认记录存在且属于当前用户
  const existing = db.prepare('SELECT * FROM check_ins WHERE id = ? AND user_id = ?').get(id, user.id) as any
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: '记录不存在' })
  }

  const { date, book, chapter_start, chapter_end, verse_start, verse_end, note } = body

  if (!date) {
    throw createError({ statusCode: 400, statusMessage: '请选择日期' })
  }

  // 章节验证
  const errors = validateCheckIn({ book, chapter_start, chapter_end, verse_start, verse_end })
  if (errors.length > 0) {
    throw createError({ statusCode: 400, statusMessage: errors[0].message })
  }

  db.prepare(`
    UPDATE check_ins
    SET date = ?, book = ?, chapter_start = ?, chapter_end = ?,
        verse_start = ?, verse_end = ?, note = ?
    WHERE id = ? AND user_id = ?
  `).run(
    date,
    book,
    chapter_start,
    chapter_end || null,
    verse_start || null,
    verse_end || null,
    note || '',
    id,
    user.id
  )

  const updated = db.prepare('SELECT * FROM check_ins WHERE id = ?').get(id)
  return { checkIn: updated }
})
