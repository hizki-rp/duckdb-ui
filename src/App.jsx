import React, { useEffect, useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

function App() {
	const [data, setData] = useState([]);

	useEffect(() => {
		async function loadData() {
			try {
				// Initialize DuckDB-WASM
				const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
				const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

				const worker = new Worker("/duckdb-browser-eh.worker.js");

				const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
				await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

				// Connect to the database
				const conn = await db.connect();

				// Load the Parquet file from the remote URL
				await conn.query(
					`CREATE TABLE house_prices AS SELECT * FROM parquet_scan('https://www.tablab.app/sample-datasets/house-price.parquet')`
				);

				// Query the data
				const result = await conn.query("SELECT * FROM house_prices LIMIT 10");
				setData(result.toArray());

				// Clean up
				await conn.close();
			} catch (error) {
				console.error("Error loading data:", error);
			}
		}

		loadData();
	}, []);

	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
				<h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
					House Price Data Analysis
				</h1>
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200">
						<thead className="bg-gray-50">
							<tr>
								{data.length > 0 &&
									Object.keys(data[0]).map((key) => (
										<th
											key={key}
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											{key}
										</th>
									))}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{data.map((row, index) => (
								<tr key={index} className="hover:bg-gray-50 transition-colors">
									{Object.values(row).map((value, i) => (
										<td
											key={i}
											className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
										>
											{value}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default App;
