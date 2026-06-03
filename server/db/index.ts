import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import type Database from 'better-sqlite3'

// ====== 统一数据库接口 ======
export interface DbResult {
  rows: Record<string, any>[]
  lastInsertRowid?: number
}

export interface DbAdapter {
  query(sql: string, params?: any[]): Promise<DbResult>
  execute(sql: string, params?: any[]): Promise<DbResult>
  exec(sql: string): Promise<void>
}

// ====== 本地适配器（better-sqlite3）======
let sqliteDb: Database.Database | null = null

async function getLocalAdapter(): Promise<DbAdapter> {
  const betterSqlite3 = (await import('better-sqlite3')).default
  const path = await import('path')
  const fs = await import('fs')

  if (!sqliteDb) {
    const dbDir = path.resolve(process.cwd(), '.data')
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
    sqliteDb = new betterSqlite3(path.join(dbDir, 'bible.db'))
    sqliteDb.pragma('journal_mode = WAL')
  }
  const db = sqliteDb
  return {
    query(sql: string, params?: any[]) {
      const stmt = db.prepare(sql)
      const rows = params ? stmt.all(...params) : stmt.all()
      return Promise.resolve({ rows: rows as any[] })
    },
    execute(sql: string, params?: any[]) {
      const stmt = db.prepare(sql)
      const info = params ? stmt.run(...params) : stmt.run()
      return Promise.resolve({ rows: [], lastInsertRowid: info.lastInsertRowid as number })
    },
    exec(sql: string) {
      db.exec(sql)
      return Promise.resolve()
    }
  }
}

// ====== Turso HTTP 适配器（纯 fetch，无 native 依赖）======
function getTursoAdapter(): DbAdapter {
  const url = process.env.TURSO_DB_URL!
  const token = process.env.TURSO_DB_TOKEN!

  // 把 ? 参数转为 Turso 的命名参数 $1 $2 ...
  function sqlWithParams(sql: string, params?: any[]): { sql: string; args: { type: string; value: any }[] } {
    if (!params || params.length === 0) return { sql, args: [] }
    // 把 ? 替换为 ?N
    let idx = 0
    const converted = sql.replace(/\?/g, () => `?${++idx}`)
    return {
      sql: converted,
      args: params.map(v => ({ type: typeof v === 'number' ? 'integer' : 'text', value: v ?? null }))
    }
  }

  return {
    async query(sql: string, params?: any[]) {
      const { sql: convertedSql, args } = sqlWithParams(sql, params)
      const res = await fetch(`${url}/v2/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [{ type: 'execute', stmt: { sql: convertedSql, args } }]
        })
      })
      const data: any = await res.json()
      const result = data?.results?.[0]?.response?.result
      if (!result) {
        // 检查错误
        const err = data?.results?.[0]?.response?.error
        throw new Error(err?.message || JSON.stringify(data))
      }
      return {
        rows: result.cols ? parseColsToRows(result.cols, result.rows) : [],
        lastInsertRowid: result.last_insert_rowid
      }
    },
    async execute(sql: string, params?: any[]) {
      return this.query(sql, params)
    },
    async exec(sql: string) {
      await this.query(sql)
    }
  }
}

function parseColsToRows(cols: { name: string }[], rows: any[][]): Record<string, any>[] {
  return rows.map(row => {
    const obj: Record<string, any> = {}
    cols.forEach((col, i) => { obj[col.name] = row[i]?.value ?? null })
    return obj
  })
}

// ====== 选择适配器 ======
const useTurso = !!process.env.TURSO_DB_URL && !!process.env.TURSO_DB_TOKEN

let adapterPromise: Promise<DbAdapter> | null = null

export async function getDb(): Promise<DbAdapter> {
  if (!adapterPromise) {
    adapterPromise = initDb().then(a => {
      console.log(`[DB] ${useTurso ? 'Turso remote' : 'SQLite local'} initialized`)
      return a
    })
  }
  return adapterPromise
}

async function initDb(): Promise<DbAdapter> {
  const adapter = useTurso ? getTursoAdapter() : await getLocalAdapter()

  await adapter.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))`)
  await adapter.exec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), created_at TEXT NOT NULL DEFAULT (datetime('now')))`)
  await adapter.exec(`CREATE TABLE IF NOT EXISTS check_ins (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), date TEXT NOT NULL, book TEXT NOT NULL, chapter_start INTEGER NOT NULL, chapter_end INTEGER, verse_start INTEGER, verse_end INTEGER, note TEXT DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')))`)
  await adapter.exec(`CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, date)`)
  await adapter.exec(`CREATE INDEX IF NOT EXISTS idx_check_ins_user_book ON check_ins(user_id, book)`)

  return adapter
}

export default defineNitroPlugin(() => {})
