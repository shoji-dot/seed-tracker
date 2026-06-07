import pool from './db.js'

export async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // ユーザーテーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        username    TEXT UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        display_name TEXT NOT NULL DEFAULT '',
        role        TEXT NOT NULL DEFAULT 'member',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // タグテーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id         SERIAL PRIMARY KEY,
        name       TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 人物テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS persons (
        id           SERIAL PRIMARY KEY,
        name         TEXT NOT NULL,
        role         TEXT DEFAULT '',
        affiliation  TEXT DEFAULT '',
        contact      TEXT DEFAULT '',
        specialty    TEXT DEFAULT '',
        memo         TEXT DEFAULT '',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 企業テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id           SERIAL PRIMARY KEY,
        name         TEXT NOT NULL,
        industry     TEXT DEFAULT '',
        location     TEXT DEFAULT '',
        contact      TEXT DEFAULT '',
        url          TEXT DEFAULT '',
        memo         TEXT DEFAULT '',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // シードテーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS seeds (
        id            SERIAL PRIMARY KEY,
        title         TEXT NOT NULL,
        status        TEXT NOT NULL DEFAULT 'kadai',
        description   TEXT DEFAULT '',
        source        TEXT DEFAULT '',
        source_date   DATE,
        priority      INTEGER DEFAULT 2,
        tags          TEXT[] DEFAULT '{}',
        person_ids    INTEGER[] DEFAULT '{}',
        company_ids   INTEGER[] DEFAULT '{}',
        or_records    JSONB DEFAULT '[]',
        photos        JSONB DEFAULT '[]',
        created_by    INTEGER REFERENCES users(id),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 活動記録テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id          SERIAL PRIMARY KEY,
        type        TEXT NOT NULL CHECK (type IN ('surgery','meeting','event','other')),
        date        DATE,
        location    TEXT DEFAULT '',
        summary     TEXT DEFAULT '',
        detail      JSONB DEFAULT '{}',
        created_by  INTEGER REFERENCES users(id),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // updated_at 自動更新トリガー
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    for (const table of ['seeds', 'persons', 'companies']) {
      await client.query(`
        DROP TRIGGER IF EXISTS trg_updated_at_${table} ON ${table};
        CREATE TRIGGER trg_updated_at_${table}
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      `)
    }

    await client.query('COMMIT')
    console.log('[migrate] All tables ready')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[migrate] Migration failed:', err)
    throw err
  } finally {
    client.release()
  }
}
