import { createClient } from '@libsql/client'
import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import path from 'path'
import fs from 'fs'
import type { Row } from '@libsql/client'

// ====== Wrapper 让 libsql 提供类似 better-sqlite3 的 API ======
class DbWrapper {
  private client: Awaited<ReturnType<typeof createClient>>

  constructor(client: Awaited<ReturnType<typeof createClient>>) {
    this.client = client
  }

  prepare(sql: string) {
    return {
      all: async (params?: (string | number | null)[]): Promise<Row[]> => {
        const rs = await this.client.execute({ sql, args: params as any[] })
        return rs.rows
      },
      get: async (params?: (string | number | null)[]): Promise<Row | undefined> => {
        const rs = await this.client.execute({ sql, args: params as any[] })
        return rs.rows[0]
      },
      run: async (params?: (string | number | null)[]): Promise<{ lastInsertRowid: number | undefined }> => {
        const rs = await this.client.execute({ sql, args: params as any[] })
        return { lastInsertRowid: rs.lastInsertRowid as number | undefined }
      }
    }
  }

  exec(sql: string): Promise<void> {
    return this.client.execute(sql).then(() => {})
  }
}

let db: DbWrapper | null = null

export function getDb(): DbWrapper {
  if (!db) throw new Error('Database not initialized')
  return db
}

export default defineNitroPlugin(async () => {
  // 优先使用 Turso 远程（生产环境），否则用本地文件（开发环境）
  const useRemote = !!process.env.TURSO_DB_URL && !!process.env.TURSO_DB_TOKEN

  const client = useRemote
    ? createClient({
        url: process.env.TURSO_DB_URL!,
        authToken: process.env.TURSO_DB_TOKEN
      })
    : createClient({
        url: `file:${getLocalDbPath()}`
      })

  db = new DbWrapper(client)

  // 建表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id         TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      date          TEXT NOT NULL,
      book          TEXT NOT NULL,
      chapter_start INTEGER NOT NULL,
      chapter_end   INTEGER,
      verse_start   INTEGER,
      verse_end     INTEGER,
      note          TEXT DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, date)`)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_check_ins_user_book ON check_ins(user_id, book)`)

  console.log(`[DB] Turso initialized (${useRemote ? 'remote' : 'local file'})`)
})

function getLocalDbPath(): string {
  const dbDir = process.env.NUXT_DB_PATH
    ? path.dirname(process.env.NUXT_DB_PATH)
    : path.resolve(process.cwd(), '.data')
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
  return process.env.NUXT_DB_PATH || path.join(dbDir, 'bible.db')
}
