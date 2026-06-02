import { defineEventHandler, readBody } from 'h3'
import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const db = getDb()

  const { date, book, chapter_start, chapter_end, verse_start, verse_end, note } = body

  if (!date || !book || !chapter_start) {
    throw createError({ statusCode: 400, statusMessage: '请填写日期、书卷和起始章' })
  }

  const result = db.prepare(`
    INSERT INTO check_ins (user_id, date, book, chapter_start, chapter_end, verse_start, verse_end, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    date,
    book,
    chapter_start,
    chapter_end || null,
    verse_start || null,
    verse_end || null,
    note || ''
  )

  const checkIn = db.prepare('SELECT * FROM check_ins WHERE id = ?').get(result.lastInsertRowid)
  return { checkIn }
})
