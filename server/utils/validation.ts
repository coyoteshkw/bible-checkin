import { getBookByName } from '../db/bible-data'

export interface ValidationError {
  field: string
  message: string
}

export function validateCheckIn(body: {
  book: string
  chapter_start: number
  chapter_end?: number | null
  verse_start?: number | null
  verse_end?: number | null
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (!body.book) {
    errors.push({ field: 'book', message: '请选择书卷' })
    return errors
  }

  const bookInfo = getBookByName(body.book)
  if (!bookInfo) {
    errors.push({ field: 'book', message: `未知的书卷: ${body.book}` })
    return errors
  }

  // --- 验证章范围 ---

  // 起始章
  if (body.chapter_start == null || body.chapter_start < 1) {
    errors.push({ field: 'chapter_start', message: '起始章必须 ≥ 1' })
  } else if (body.chapter_start > bookInfo.chapters) {
    errors.push({ field: 'chapter_start', message: `${body.book} 只有 ${bookInfo.chapters} 章，不能选第 ${body.chapter_start} 章` })
  }

  // 结束章（如果填了）
  if (body.chapter_end != null) {
    if (body.chapter_end < 1) {
      errors.push({ field: 'chapter_end', message: '结束章必须 ≥ 1' })
    } else if (body.chapter_end > bookInfo.chapters) {
      errors.push({ field: 'chapter_end', message: `${body.book} 只有 ${bookInfo.chapters} 章，不能选第 ${body.chapter_end} 章` })
    } else if (body.chapter_start != null && body.chapter_end < body.chapter_start) {
      errors.push({ field: 'chapter_end', message: `结束章 ${body.chapter_end} 不能小于起始章 ${body.chapter_start}` })
    }
  }

  // --- 验证节范围（如果有）---

  if (body.verse_start != null && body.verse_start < 1) {
    errors.push({ field: 'verse_start', message: '起始节必须 ≥ 1' })
  }

  if (body.verse_end != null) {
    if (body.verse_end < 1) {
      errors.push({ field: 'verse_end', message: '结束节必须 ≥ 1' })
    } else if (body.verse_start != null && body.verse_end < body.verse_start) {
      errors.push({ field: 'verse_end', message: `结束节 ${body.verse_end} 不能小于起始节 ${body.verse_start}` })
    }
  }

  return errors
}
