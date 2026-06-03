import { createClient } from '@libsql/client'
import { defineNitroPlugin } from 'nitropack/runtime/plugin'

// ====== Wrapper 让 libsql 提供类似 better-sqlite3 的 API ======
class DbWrapper {
  private client: ReturnType<typeof createClient>

  constructor(client: ReturnType<typeof createClient>) {
    this.client = client
  }

  prepare(sql: string) {
    return {
      all: (params?: (string | number | bigint | null)[]) =>
        this.client.execute({ sql, args: params as any[] }).then(r => r.rows),
      get: (params?: (string | number | bigint | null)[]) =>
        this.client.execute({ sql, args: params as any[] }).then(r => r.rows[0]),
      run: (params?: (string | number | bigint | null)[]) =>
        this.client.execute({ sql, args: params as any[] }).then(r => ({
          lastInsertRowid: r.lastInsertRowid // 保持 bigint，调用处用 Number() 转
        }))
    }
  }

  exec(sql: string) {
    return this.client.execute(sql).then(() => {})
  }
}

// ====== 懒初始化 ======
let initPromise: Promise<void> | null = null
let db: DbWrapper | null = null

export async function getDb(): Promise<DbWrapper> {
  if (!db) {
    if (!initPromise) initPromise = initDb()
    await initPromise
  }
  return db!
}

async function initDb() {
  const url = process.env.TURSO_DB_URL || ':memory:'
  const config: any = { url }
  if (process.env.TURSO_DB_TOKEN) config.authToken = process.env.TURSO_DB_TOKEN
  const client = createClient(config)

  db = new DbWrapper(client)

  // 建表 — 每条语句单独执行（libsql 客户端不支持多语句）
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS check_ins (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), date TEXT NOT NULL, book TEXT NOT NULL, chapter_start INTEGER NOT NULL, chapter_end INTEGER, verse_start INTEGER, verse_end INTEGER, note TEXT DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, date)`,
    `CREATE INDEX IF NOT EXISTS idx_check_ins_user_book ON check_ins(user_id, book)`
  ]
  for (const sql of statements) {
    await db.exec(sql)
  }

  console.log(`[DB] Turso initialized (${process.env.TURSO_DB_URL ? 'remote' : 'in-memory'})`)
}

// 插件只在本地开发时打印信息，不阻塞建表
export default defineNitroPlugin(() => {
  console.log('[DB] Plugin loaded — lazy init on first query')
})


