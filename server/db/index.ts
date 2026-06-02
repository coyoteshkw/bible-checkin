import Database from 'better-sqlite3'
import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized')
  return db
}

export default defineNitroPlugin(() => {
  const dbDir = process.env.NUXT_DB_PATH
    ? path.dirname(process.env.NUXT_DB_PATH)
    : path.resolve(process.cwd(), '.data')

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  const dbPath = process.env.NUXT_DB_PATH || path.join(dbDir, 'bible.db')
  db = new Database(dbPath)

  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id         TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

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
    );

    CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_check_ins_user_book ON check_ins(user_id, book);
  `)

  console.log(`[DB] SQLite initialized at ${dbPath}`)
})
