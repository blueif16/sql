import React from 'react';

const DataTable = ({ data, title }) => {
  if (!data || data.length === 0) return (
    <div className="text-center text-gray-500 py-4 text-xs">No data returned</div>
  );

  const columns = Object.keys(data[0]);
  
  return (
    <div>
      {title && <div className="font-medium mb-2 text-xs">{title}</div>}
      <div className="overflow-auto max-h-40">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {columns.map(col => (
                <th key={col} className="border border-gray-300 p-1 text-left font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map(col => (
                  <td key={col} className="border border-gray-300 p-1">{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
