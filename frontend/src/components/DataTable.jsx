import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

const DataTable = ({ data, columns, title }) => { // 只支持新格式: columns数组 + data对象数组
  const { t } = useLanguage();
  
  // 日志：接收到的数据
  console.log('[DataTable] 接收到的data:', data);
  console.log('[DataTable] 接收到的columns:', columns);
  console.log('[DataTable] title:', title);
  
  if (!data || data.length === 0) {
    console.log('[DataTable] 数据为空或长度为0');
    return <div className="text-center text-gray-500 py-4 text-xs">{t('dataTable').noData}</div>;
  }

  const cols = columns || Object.keys(data[0]); // 优先使用传入的columns，否则从data提取
  console.log('[DataTable] 最终使用的columns:', cols);
  
  return (
    <div>
      {title && <div className="font-medium mb-2 text-xs text-gray-700">{title}</div>}
      <div className="overflow-auto max-h-60 rounded border border-gray-300">
        <table className="min-w-full text-xs border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {cols.map((col, idx) => (
                <th key={idx} className="border-b border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700 last:border-r-0">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {cols.map((col, colIdx) => (
                  <td key={colIdx} className="border-b border-r border-gray-300 px-3 py-2 text-gray-800 last:border-r-0">{row[col]}</td>
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
