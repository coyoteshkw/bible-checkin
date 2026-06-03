import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const db = await getDb()

  const { date, book, chapter_start, chapter_end, verse_start, verse_end, note } = body

  if (!date) {
    throw createError({ statusCode: 400, statusMessage: '请选择日期' })
  }

  const errors = validateCheckIn({ book, chapter_start, chapter_end, verse_start, verse_end })
  if (errors.length > 0) {
    throw createError({ statusCode: 400, statusMessage: errors[0].message })
  }

  const result = await db.execute(
    'INSERT INTO check_ins (user_id, date, book, chapter_start, chapter_end, verse_start, verse_end, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [user.id, date, book, chapter_start, chapter_end || null, verse_start || null, verse_end || null, note || '']
  )

  const checkIn = (await db.query('SELECT * FROM check_ins WHERE id = ?', [result.lastInsertRowid])).rows[0]
  return { checkIn }
})
