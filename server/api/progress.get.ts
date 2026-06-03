import { getDb } from '../db/index'
import { BIBLE_DATA, getAllBooks, getTotalChapters } from '../db/bible-data'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = await getDb()
  const allBooks = getAllBooks()

  const rows = (await db.query('SELECT book, chapter_start, chapter_end FROM check_ins WHERE user_id = ?', [user.id])).rows as any[]

  const readChapters = new Map<string, Set<number>>()
  for (const row of rows) {
    if (!readChapters.has(row.book)) readChapters.set(row.book, new Set())
    const chapters = readChapters.get(row.book)!
    const end = row.chapter_end ?? row.chapter_start
    for (let ch = row.chapter_start; ch <= end; ch++) chapters.add(ch)
  }

  const testamentProgress = BIBLE_DATA.map(t => ({
    name: t.name,
    books: t.books.map(b => {
      const read = readChapters.get(b.name)
      const readCount = read ? read.size : 0
      const percentage = Math.round((readCount / b.chapters) * 100)
      return { id: b.id, name: b.name, totalChapters: b.chapters, readChapters: readCount, percentage, done: readCount >= b.chapters }
    })
  }))

  let totalRead = 0
  for (const [bookName, chapters] of readChapters) {
    const book = allBooks.find(b => b.name === bookName)
    if (book) {
      const validChapters = new Set([...chapters].filter(ch => ch >= 1 && ch <= book.chapters))
      totalRead += validChapters.size
    }
  }
  const totalChapters = getTotalChapters()
  const totalPercentage = Math.round((totalRead / totalChapters) * 100)

  return { total: { read: totalRead, total: totalChapters, percentage: totalPercentage }, testaments: testamentProgress }
})
