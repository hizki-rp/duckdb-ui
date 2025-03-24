import React, { useEffect, useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

function App() {
  const [housePrices, setHousePrices] = useState([]);
  const [weather, setWeather] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Initialize DuckDB-WASM
        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
        const worker = new Worker("/duckdb-browser-eh.worker.js");
        const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

        // Fetch and register remote files
        async function fetchAndRegisterFile(url, filename) {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
            }
            
            const buffer = await response.arrayBuffer();
            console.log(`Fetched ${filename}: ${buffer.byteLength} bytes`);
            
            // Register file without validation
            await db.registerFileBuffer(filename, new Uint8Array(buffer));
            return true;
          } catch (error) {
            console.error(`Error fetching ${filename}:`, error);
            throw error;
          }
        }

        // Connect to the database
        const conn = await db.connect();

        // Load data with better error handling
        const loadTableData = async (filename, tableName, setData) => {
          try {
            await fetchAndRegisterFile(
              `https://www.tablab.app/sample-datasets/${filename}`,
              filename
            );
            
            await conn.query(
              `CREATE TABLE ${tableName} AS SELECT * FROM parquet_scan('${filename}')`
            );
            
            const result = await conn.query(`SELECT * FROM ${tableName} LIMIT 10`);
            setData(result.toArray());
          } catch (error) {
            console.error(`Error loading ${tableName}:`, error);
            throw new Error(`Failed to load ${tableName}: ${error.message}`);
          }
        };

        // Load all datasets
        await Promise.all([
          loadTableData('house-price.parquet', 'house_prices', setHousePrices),
          loadTableData('weather.parquet', 'weather', setWeather),
          loadTableData('flights-1m.parquet', 'flights', setFlights)
        ]);

      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

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

function DataTable({ data }) {
  if (!data.length) {
    return <div className="text-gray-500">No data available</div>;
  }

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
                  {value?.toString()}
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