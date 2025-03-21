import { useEffect, useState } from 'react';
import { initDuckDB } from './utils/duckdb';
import Table from './components/Table';

function App() {
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

        // Create sample table
        await conn.query(`
          CREATE TABLE sample_table AS
          SELECT * FROM (VALUES
            (1, 'Alice', 25.5, TRUE),
            (2, 'Bob', 30.0, FALSE),
            (3, 'Charlie', 35.2, TRUE)
          ) AS t(id, name, age, is_active);
        `);

        // Get column types
        const columnInfo = await conn.query('PRAGMA table_info(sample_table);');
        setColumns(columnInfo.toArray());

        // Get statistics
        const statsResult = await conn.query(`
          SELECT
            COUNT(*) AS row_count,
            MIN(age) AS min_age,
            MAX(age) AS max_age,
            AVG(age) AS avg_age,
            COUNT(DISTINCT name) AS distinct_names
          FROM sample_table;
        `);
        setStats(statsResult.toArray()[0]);

        // Fetch table data
        const data = await conn.query('SELECT * FROM sample_table;');
        setTableData(data.toArray());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <Table columns={columns} tableData={tableData} stats={stats} />
    </div>
  );
}

export default App;