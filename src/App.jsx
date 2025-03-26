import React, { useEffect, useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

function App() {
    // State variables for data, column types, and statistics
    const [housePrices, setHousePrices] = useState([]);
    const [weather, setWeather] = useState([]);
    const [flights, setFlights] = useState([]);
    const [housePricesTypes, setHousePricesTypes] = useState([]);
    const [weatherTypes, setWeatherTypes] = useState([]);
    const [flightsTypes, setFlightsTypes] = useState([]);
    const [housePricesStats, setHousePricesStats] = useState([]);
    const [weatherStats, setWeatherStats] = useState([]);
    const [flightsStats, setFlightsStats] = useState([]);
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

                // Load datasets in parallel
                await Promise.all([
                    conn.query(
                        `CREATE TABLE house_prices AS SELECT * FROM parquet_scan('https://www.tablab.app/sample-datasets/house-price.parquet')`
                    ),
                    conn.query(
                        `CREATE TABLE weather AS SELECT * FROM parquet_scan('https://www.tablab.app/sample-datasets/weather.parquet')`
                    ),
                    conn.query(
                        `CREATE TABLE flights AS SELECT * FROM parquet_scan('https://www.tablab.app/sample-datasets/flights-1m.parquet')`
                    ),
                ]);

                // Fetch data samples
                const [housePricesResult, weatherResult, flightsResult] = await Promise.all([
                    conn.query("SELECT * FROM house_prices LIMIT 10"),
                    conn.query("SELECT * FROM weather LIMIT 10"),
                    conn.query("SELECT * FROM flights LIMIT 10"),
                ]);

                setHousePrices(housePricesResult.toArray());
                setWeather(weatherResult.toArray());
                setFlights(flightsResult.toArray());

                // Fetch column types
                const [housePricesTypes, weatherTypes, flightsTypes] = await Promise.all([
                    conn.query("PRAGMA table_info(house_prices)"),
                    conn.query("PRAGMA table_info(weather)"),
                    conn.query("PRAGMA table_info(flights)"),
                ]);

                setHousePricesTypes(housePricesTypes.toArray());
                setWeatherTypes(weatherTypes.toArray());
                setFlightsTypes(flightsTypes.toArray());

                // Fetch statistics
                const [housePricesStats, weatherStats, flightsStats] = await Promise.all([
                    conn.query("SELECT * FROM SUMMARIZE(SELECT * FROM house_prices)"),
                    conn.query("SELECT * FROM SUMMARIZE(SELECT * FROM weather)"),
                    conn.query("SELECT * FROM SUMMARIZE(SELECT * FROM flights)"),
                ]);

                setHousePricesStats(housePricesStats.toArray());
                setWeatherStats(weatherStats.toArray());
                setFlightsStats(flightsStats.toArray());
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* House Prices Section */}
                <Section
                    title="House Prices"
                    data={housePrices}
                    types={housePricesTypes}
                    stats={housePricesStats}
                />

                {/* Weather Section */}
                <Section title="Weather" data={weather} types={weatherTypes} stats={weatherStats} />

                {/* Flights Section */}
                <Section title="Flights" data={flights} types={flightsTypes} stats={flightsStats} />
            </div>
        </div>
    );
}

// Reusable Section Component
function Section({ title, data, types, stats }) {
    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>

            {/* Column Types */}
            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Column Types</h3>
            <ColumnTypesTable data={types} />

            {/* Data Preview */}
            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Data Preview</h3>
            <DataTable data={data} />

            {/* Column Statistics */}
            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Column Statistics</h3>
            <StatsTable data={stats} />
        </div>
    );
}

// Reusable DataTable Component
function DataTable({ data }) {
    if (data.length === 0) return <p className="text-gray-500">No data available</p>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {Object.keys(data[0]).map((key) => (
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

// Reusable ColumnTypesTable Component
function ColumnTypesTable({ data }) {
    if (data.length === 0) return <p className="text-gray-500">No column types available</p>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Column Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data Type
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                {row.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                {row.type}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Reusable StatsTable Component
function StatsTable({ data }) {
    if (data.length === 0) return <p className="text-gray-500">No statistics available</p>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Column
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Min
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Max
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                {row.column_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                {row.count}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                {row.min}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                {row.max}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                {row.avg}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
