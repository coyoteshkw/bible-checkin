import { getDb } from '../../db/index'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = await getDb()

  const existing = (await db.query('SELECT * FROM check_ins WHERE id = ? AND user_id = ?', [id, user.id])).rows[0]
  if (!existing) throw createError({ statusCode: 404, statusMessage: '记录不存在' })

  const { date, book, chapter_start, chapter_end, verse_start, verse_end, note } = body
  if (!date) throw createError({ statusCode: 400, statusMessage: '请选择日期' })

  const errors = validateCheckIn({ book, chapter_start, chapter_end, verse_start, verse_end })
  if (errors.length > 0) throw createError({ statusCode: 400, statusMessage: errors[0].message })

  await db.execute(
    'UPDATE check_ins SET date = ?, book = ?, chapter_start = ?, chapter_end = ?, verse_start = ?, verse_end = ?, note = ? WHERE id = ? AND user_id = ?',
    [date, book, chapter_start, chapter_end || null, verse_start || null, verse_end || null, note || '', id, user.id]
  )

  const updated = (await db.query('SELECT * FROM check_ins WHERE id = ?', [id])).rows[0]
  return { checkIn: updated }
})
