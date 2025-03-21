import * as duckdb from '@duckdb/duckdb-wasm';

const DUCKDB_BUNDLES = {
  mvp: {
    mainModule: '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm',
    mainWorker: '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js',
  },
  eh: {
    mainModule: '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-eh.wasm',
    mainWorker: '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js',
  },
};

export async function initDuckDB() {
  const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);
  const logger = new duckdb.ConsoleLogger();
  const worker = new Worker(bundle.mainWorker);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  // Load sample datasets
  const conn = await db.connect();
  await conn.query(`
    CREATE TABLE house_prices AS
    SELECT * FROM read_parquet('https://www.tablab.app/sample-datasets/house-price.parquet');
  `);
  await conn.query(`
    CREATE TABLE weather AS
    SELECT * FROM read_parquet('https://www.tablab.app/sample-datasets/weather.parquet');
  `);
  await conn.query(`
    CREATE TABLE flights AS
    SELECT * FROM read_parquet('https://www.tablab.app/sample-datasets/flights-1m.parquet');
  `);

  return db;
}