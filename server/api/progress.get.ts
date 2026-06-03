import { defineEventHandler } from 'h3'
import { getDb } from '../db/index'
import { BIBLE_DATA, getAllBooks, getTotalChapters } from '../db/bible-data'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDb()

  const allBooks = getAllBooks()

  // 获取所有打卡记录
  const rows = await db.prepare(`
    SELECT book, chapter_start, chapter_end FROM check_ins
    WHERE user_id = ?
  `).all(user.id) as { book: string; chapter_start: number; chapter_end: number | null }[]

  // 计算每卷书的已读章节
  const readChapters = new Map<string, Set<number>>()

  for (const row of rows) {
    if (!readChapters.has(row.book)) {
      readChapters.set(row.book, new Set())
    }
    const chapters = readChapters.get(row.book)!
    const end = row.chapter_end ?? row.chapter_start
    for (let ch = row.chapter_start; ch <= end; ch++) {
      chapters.add(ch)
    }
  }

  // 构建每卷书的进度
  const testamentProgress = BIBLE_DATA.map(t => ({
    name: t.name,
    books: t.books.map(b => {
      const read = readChapters.get(b.name)
      const readCount = read ? read.size : 0
      const percentage = Math.round((readCount / b.chapters) * 100)
      return {
        id: b.id,
        name: b.name,
        totalChapters: b.chapters,
        readChapters: readCount,
        percentage,
        done: readCount >= b.chapters
      }
    })
  }))

  // 总进度
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

  return {
    total: { read: totalRead, total: totalChapters, percentage: totalPercentage },
    testaments: testamentProgress
  }
})
