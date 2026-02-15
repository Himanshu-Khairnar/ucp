// Always use Turso database (both local and production)

let db: any = null;

export async function getDb() {
  if (!db) {
    // Check if Turso credentials are available
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error(
        'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables. ' +
        'Please add them to .env.local for local development or Vercel settings for production.'
      );
    }

    console.log('Using Turso database (cloud)');
    const { createClient } = await import('@libsql/client');
    const tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Wrap Turso client to provide sqlite-compatible API
    db = {
      async all(sql: string, ...params: any[]) {
        const result = await tursoClient.execute({ sql, args: params });
        return result.rows.map(row => {
          const obj: any = {};
          result.columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      },
      async get(sql: string, ...params: any[]) {
        const result = await tursoClient.execute({ sql, args: params });
        if (result.rows.length === 0) return undefined;
        const obj: any = {};
        result.columns.forEach((col, i) => {
          obj[col] = result.rows[0][i];
        });
        return obj;
      },
      async run(sql: string, ...params: any[]) {
        const result = await tursoClient.execute({ sql, args: params });
        return { lastID: result.lastInsertRowid, changes: result.rowsAffected };
      },
      async exec(sql: string) {
        await tursoClient.execute(sql);
      },
      // Expose raw client for advanced usage
      _tursoClient: tursoClient
    };
  }
  return db;
}

export function isTursoDatabase() {
  return true; // Always Turso now
}
