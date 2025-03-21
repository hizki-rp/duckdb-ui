import * as duckdb from "@duckdb/duckdb-wasm";

const DUCKDB_BUNDLES = {
	mvp: {
		mainModule: "/duckdb-mvp.wasm",
		mainWorker: "/duckdb-browser-mvp.worker.js",
	},
	eh: {
		mainModule: "/duckdb-eh.wasm",
		mainWorker: "/duckdb-browser-eh.worker.js",
	},
};

export async function initDuckDB() {
	// Select the appropriate bundle
	const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);

	// Create a logger
	const logger = new duckdb.ConsoleLogger();

	// Initialize the worker
	const worker = new Worker(bundle.mainWorker);

	// Initialize DuckDB
	const db = new duckdb.AsyncDuckDB(logger, worker);
	await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

	return db;
}
