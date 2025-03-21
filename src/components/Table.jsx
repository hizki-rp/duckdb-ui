export default function Table({ columns, tableData, stats }) {
  return (
    <div>
      {/* Column Types */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Column Types</h2>
        <ul>
          {columns.map((col) => (
            <li key={col.name} className="text-sm text-gray-700">
              <strong>{col.name}</strong>: {col.type}
            </li>
          ))}
        </ul>
      </div>

      {/* Statistics */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Statistics</h2>
        <ul>
          <li>Row Count: {stats.row_count}</li>
          <li>Min Value: {stats.min_value}</li>
          <li>Max Value: {stats.max_value}</li>
          <li>Avg Value: {stats.avg_value}</li>
        </ul>
      </div>

      {/* Table Data */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Table Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((col) => (
                  <th key={col.name} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.name} className="px-4 py-2 text-sm text-gray-700 border-b">
                      {row[col.name]}
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