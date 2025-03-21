import { useEffect, useState } from 'react';
import { initDuckDB } from './utils/duckdb';
import Table from './components/Table';

function App() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [columns, setColumns] = useState([]);
  const [stats, setStats] = useState({});
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const db = await initDuckDB();
        const conn = await db.connect();

        // Fetch dataset names
        const datasetsResult = await conn.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'main';
        `);
        setDatasets(datasetsResult.toArray().map((row) => row.table_name));
        setSelectedDataset(datasetsResult.toArray()[0]?.table_name || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedDataset) return;

    (async () => {
      try {
        const db = await initDuckDB();
        const conn = await db.connect();

        // Get column types
        const columnInfo = await conn.query(`
          PRAGMA table_info(${selectedDataset});
        `);
        setColumns(columnInfo.toArray());

        // Get statistics
        const statsResult = await conn.query(`
          SELECT
            COUNT(*) AS row_count,
            MIN(column1) AS min_value,
            MAX(column1) AS max_value,
            AVG(column1) AS avg_value
          FROM ${selectedDataset};
        `);
        setStats(statsResult.toArray()[0]);

        // Fetch table data
        const data = await conn.query(`
          SELECT * FROM ${selectedDataset} LIMIT 100;
        `);
        setTableData(data.toArray());
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [selectedDataset]);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">DuckDB UI</h1>

      {/* Dataset Selector */}
      <div className="mb-6">
        <label htmlFor="dataset" className="block text-sm font-medium text-gray-700">
          Select Dataset
        </label>
        <select
          id="dataset"
          value={selectedDataset}
          onChange={(e) => setSelectedDataset(e.target.value)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {datasets.map((dataset) => (
            <option key={dataset} value={dataset}>
              {dataset}
            </option>
          ))}
        </select>
      </div>

      {/* Display Table and Statistics */}
      {selectedDataset && (
        <Table columns={columns} tableData={tableData} stats={stats} />
      )}
    </div>
  );
}

export default App;