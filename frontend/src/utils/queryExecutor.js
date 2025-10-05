import { themes } from '../data/themes';

export const executeValidQuery = (query, tableData, expectedTableName) => {
  const cleanQuery = query.trim().replace(/;+$/, '');
  const normalizedQuery = cleanQuery.toLowerCase();
  
  if (!normalizedQuery.includes('select') || !normalizedQuery.includes('from')) {
    return null;
  }
  
  try {
    let currentData = [...tableData];
    
    const selectMatch = normalizedQuery.match(/select\s+(.*?)\s+from/);
    if (!selectMatch) return null;
    
    const selectClause = selectMatch[1].trim();
    
    const fromMatch = normalizedQuery.match(/from\s+(\w+)/);
    if (!fromMatch) return null;
    
    const tableName = fromMatch[1];
    if (tableName !== expectedTableName.toLowerCase()) {
      return null;
    }
    
    if (selectClause !== '*') {
      if (selectClause.includes('distinct')) {
        const distinctMatch = selectClause.match(/distinct\s+(.*)/);
        if (distinctMatch) {
          const columns = distinctMatch[1].split(',').map(col => col.trim());
          if (!columns.every(col => col && currentData.length > 0 && currentData[0].hasOwnProperty(col))) {
            return null;
          }
          currentData = currentData.map(row => {
            const newRow = {};
            columns.forEach(col => {
              if (row.hasOwnProperty(col)) {
                newRow[col] = row[col];
              }
            });
            return newRow;
          });
          const seen = new Set();
          currentData = currentData.filter(row => {
            const key = columns.map(col => row[col]).join('|');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }
      } else {
        const columns = selectClause.split(',').map(col => col.trim());
        if (!columns.every(col => col && currentData.length > 0 && currentData[0].hasOwnProperty(col))) {
          return null;
        }
        currentData = currentData.map(row => {
          const newRow = {};
          columns.forEach(col => {
            if (row.hasOwnProperty(col)) {
              newRow[col] = row[col];
            }
          });
          return newRow;
        });
      }
    }
    
    if (normalizedQuery.includes('where')) {
      const whereStartIndex = normalizedQuery.indexOf('where') + 5;
      const orderByIndex = normalizedQuery.indexOf('order by');
      const whereEndIndex = orderByIndex !== -1 ? orderByIndex : normalizedQuery.length;
      const whereClause = normalizedQuery.substring(whereStartIndex, whereEndIndex).trim();
      
      if (whereClause.includes('=')) {
        const equalIndex = whereClause.indexOf('=');
        const column = whereClause.substring(0, equalIndex).trim();
        let value = whereClause.substring(equalIndex + 1).trim();
        
        value = value.replace(/^['"`]+|['"`]+$/g, '');
        
        currentData = currentData.filter(row => {
          return row[column] && row[column].toString().toLowerCase() === value.toLowerCase();
        });
      }
    }
    
    if (normalizedQuery.includes('order by')) {
      const orderMatch = normalizedQuery.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/);
      if (orderMatch) {
        const column = orderMatch[1];
        const direction = orderMatch[2] || 'asc';
        
        if (!currentData.length || !currentData[0].hasOwnProperty(column)) {
          return null;
        }
        
        currentData = [...currentData].sort((a, b) => {
          if (direction === 'desc') {
            return b[column] && a[column] ? b[column].toString().localeCompare(a[column].toString()) : 0;
          }
          return a[column] && b[column] ? a[column].toString().localeCompare(b[column].toString()) : 0;
        });
      }
    }
    
    return {
      data: currentData,
      isValid: true
    };
    
  } catch (error) {
    return null;
  }
};

export const generateUserOutput = (userQuery, currentTheme = 'default') => {
  const normalized = userQuery.toLowerCase().trim();
  const themeData = themes[currentTheme] || themes.default;
  
  if (normalized.includes('customers')) {
    if (normalized.includes('select *')) {
      if (normalized.includes('order by name')) {
        return [...themeData.customersData].sort((a, b) => normalized.includes('desc') ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
      } else if (normalized.includes('where country')) {
        if (normalized.includes('france')) {
          return themeData.customersData.filter(row => row.country === 'France');
        }
      } else if (normalized.includes('where company')) {
        if (normalized.includes('gryffindor house')) {
          return themeData.customersData.filter(row => row.company === 'Gryffindor House');
        } else if (normalized.includes('rebel alliance')) {
          return themeData.customersData.filter(row => row.company === 'Rebel Alliance');
        } else if (normalized.includes('house stark')) {
          return themeData.customersData.filter(row => row.company === 'House Stark');
        }
      }
      return themeData.customersData;
    } else if (normalized.includes('distinct country')) {
      const uniqueCountries = [...new Set(themeData.customersData.map(row => row.country))];
      return uniqueCountries.map(country => ({ country }));
    } else if (normalized.includes('distinct company')) {
      const uniqueCompanies = [...new Set(themeData.customersData.map(row => row.company))];
      return uniqueCompanies.map(company => ({ company }));
    } else if (normalized.includes('name') && normalized.includes('country')) {
      let result = themeData.customersData.map(row => ({ name: row.name, country: row.country }));
      if (normalized.includes('order by country desc')) {
        result = result.sort((a, b) => b.country.localeCompare(a.country));
      }
      return result;
    }
  }
  
  if (normalized.includes('products')) {
    if (normalized.includes('product_id') && normalized.includes('where') && normalized.includes('low_fats') && normalized.includes('recyclable')) {
      return themeData.productsData
        .filter(row => row.low_fats === 'Y' && row.recyclable === 'Y')
        .map(row => ({ product_id: row.product_id }));
    } else if (normalized.includes('*')) {
      return themeData.productsData;
    }
  }
  
  return [];
};
