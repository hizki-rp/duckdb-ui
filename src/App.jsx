import React, { useEffect, useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

function App() {
	const [housePrices, setHousePrices] = useState([]);
	const [weather, setWeather] = useState([]);
	const [flights, setFlights] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			try {
				setLoading(true);

				// Initialize DuckDB-WASM
				const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
				const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
				const worker = new Worker("/duckdb-browser-eh.worker.js"); // Use local worker
				const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
				await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

				// Connect to the database
				const conn = await db.connect();

				// Load house prices data
				await conn.query(
					`CREATE TABLE house_prices AS SELECT * FROM parquet_scan('https://www.tablab.app/sample-datasets/house-price.parquet')`
				);
				const housePricesResult = await conn.query(
					"SELECT * FROM house_prices LIMIT 10"
				);
				setHousePrices(housePricesResult.toArray());

				// Load weather data
				await conn.query(
					`CREATE TABLE weather AS SELECT * FROM parquet_scan('https://www.tablab.app/sample-datasets/weather.parquet')`
				);
				const weatherResult = await conn.query(
					"SELECT * FROM weather LIMIT 10"
				);
				setWeather(weatherResult.toArray());

				// Load flights data
				await conn.query(
					`CREATE TABLE flights AS SELECT * FROM parquet_scan('https://www.tablab.app/sample-datasets/flights-1m.parquet')`
				);
				const flightsResult = await conn.query(
					"SELECT * FROM flights LIMIT 10"
				);
				setFlights(flightsResult.toArray());
			} catch (error) {
				console.error("Error loading data:", error);
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, []);

	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* House Prices Table */}
				<div className="bg-white shadow-lg rounded-lg p-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-4">
						House Prices
					</h2>
					<DataTable data={housePrices} />
				</div>

				{/* Weather Table */}
				<div className="bg-white shadow-lg rounded-lg p-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-4">Weather</h2>
					<DataTable data={weather} />
				</div>

				{/* Flights Table */}
				<div className="bg-white shadow-lg rounded-lg p-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-4">Flights</h2>
					<DataTable data={flights} />
				</div>
			</div>
		</div>
	);
}

// Reusable DataTable Component
function DataTable({ data }) {
	return (
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
	);
}

export default App;
