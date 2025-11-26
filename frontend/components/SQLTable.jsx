import { useState, useEffect, useRef } from 'react' // SQL table component with AlaSQL - simpler and synchronous
import { Filter, ArrowUpDown, Play, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from './ui/button'
import alasql from 'alasql'

// Simple AlaSQL manager - synchronous and lightweight
class SQLManager {
  constructor() {
    this.tables = new Map() // Store table data for persistence across queries
  }

  // Execute DDL statements (CREATE TABLE, etc.) - synchronous
  runSQL(sql) {
    try {
      // AlaSQL can execute DDL directly
      alasql(sql)
      console.log('SQLTable: DDL executed successfully')
    } catch (error) {
      console.error('SQLTable: Error executing DDL:', sql, error)
      throw error
    }
  }

  // Execute queries and return results as array of objects - synchronous
  queryAsObjects(sql, params = []) {
    try {
      const result = alasql(sql, params)
      console.log('SQLTable: Query executed successfully, returned', result.length, 'rows')
      return result
    } catch (error) {
      console.error('SQLTable: Error executing query:', sql, error)
      throw error
    }
  }

  // Create table from data array - for data persistence
  createTableFromData(tableName, data) {
    if (!data || !Array.isArray(data) || data.length === 0) return

    try {
      // Store data for later queries
      this.tables.set(tableName, data)

      // Create table structure based on first row
      const columns = Object.keys(data[0])
      const createSQL = `CREATE TABLE ${tableName} (${columns.map(col => `${col} STRING`).join(', ')})`
      alasql(createSQL)

      // Insert data
      alasql(`INSERT INTO ${tableName} SELECT * FROM ?`, [data])
      console.log(`SQLTable: Created table ${tableName} with ${data.length} rows`)
    } catch (error) {
      console.error('SQLTable: Error creating table from data:', error)
      throw error
    }
  }

  // Get stored table data
  getTableData(tableName) {
    return this.tables.get(tableName) || []
  }

  // Clean up - AlaSQL doesn't need complex cleanup
  cleanup() {
    this.tables.clear()
    console.log('SQLTable: AlaSQL manager cleaned up')
  }

  // Reset database - drop all tables
  resetDatabase() {
    try {
      // Get all table names from AlaSQL
      const tables = alasql('SHOW TABLES')
      tables.forEach(table => {
        if (table.tableid) {
          alasql(`DROP TABLE IF EXISTS ${table.tableid}`)
          console.log(`SQLTable: Dropped table ${table.tableid}`)
        }
      })
      this.tables.clear()
      console.log('SQLTable: Database reset successfully')
    } catch (error) {
      console.error('SQLTable: Error resetting database:', error)
      throw error
    }
  }
}

export default function SQLTable({ sqlCode, autoExecute = false, onReady = null }) {
  const sqlManagerRef = useRef(new SQLManager())

  const [results, setResults] = useState([])
  const [cols, setCols] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [sortCol, setSortCol] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('')

  // Column-based filtering system
  const [showFilters, setShowFilters] = useState(false)
  const [columnFilters, setColumnFilters] = useState({})
  const [columnTypes, setColumnTypes] = useState({})

  useEffect(() => { // AlaSQL is synchronous - no initialization needed
    console.log('SQLTable: AlaSQL ready for use (synchronous)')

    // Notify parent component that SQLTable is ready
    if (onReady) {
      onReady(sqlManagerRef.current);
    }

    // Cleanup on unmount
    return () => {
      sqlManagerRef.current.cleanup()
    }
  }, [onReady])

  useEffect(() => {
    console.log('SQLTable: useEffect triggered:', { sqlCode: !!sqlCode, autoExecute })
    if (sqlCode && autoExecute) {
      executeSchemaAndShowData()
    }
  }, [sqlCode, autoExecute])

  // Analyze column data types and initialize filters
  const analyzeColumnsAndInitializeFilters = (columns, dataRows) => {
    console.log('SQLTable: Analyzing columns for', columns.length, 'columns with', dataRows.length, 'rows')

    const types = {}
    const uniqueValues = {}

    columns.forEach((col, colIndex) => {
      const values = dataRows.map(row => row[colIndex]).filter(val => val !== null && val !== undefined)
      const stringValues = values.map(String)
      const uniqueStringValues = [...new Set(stringValues)]

      // Store unique values for select filters
      uniqueValues[col] = uniqueStringValues

      // Determine column type and appropriate filter
      if (values.length === 0) {
        types[col] = 'text'
      } else if (uniqueStringValues.length === 2 && uniqueStringValues.includes('true') && uniqueStringValues.includes('false')) {
        types[col] = 'boolean'
      } else if (uniqueStringValues.length <= 10 && values.every(val => !isNaN(Number(val)))) {
        types[col] = 'number'
      } else if (uniqueStringValues.length <= 20) {
        types[col] = 'select'
      } else {
        types[col] = 'text'
      }

      console.log(`SQLTable: Column "${col}" type: ${types[col]}, unique values:`, uniqueStringValues.slice(0, 5), uniqueStringValues.length > 5 ? `...and ${uniqueStringValues.length - 5} more` : '')
    })

    setColumnTypes(types)
    // Initialize empty filters for each column
    const initialFilters = {}
    columns.forEach(col => {
      initialFilters[col] = types[col] === 'select' ? [] : ''
      console.log(`SQLTable: Initialized filter for "${col}":`, initialFilters[col])
    })
    setColumnFilters(initialFilters)

    console.log('SQLTable: Column analysis complete, types:', types)
    return { types, uniqueValues }
  }

  // Execute schema with AlaSQL - synchronous and simpler
  const executeSchemaAndShowData = () => {
    if (!sqlCode) return

    console.log('SQLTable: Executing schema with AlaSQL')
    setLoading(true)
    setError('')

    try {
      const tableNames = []

      if (sqlCode) {
        // Parse and execute SQL statements
        const sql = sqlCode.trim()

        // Split by semicolon but handle multi-line statements properly
        const statements = sql.split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt && !stmt.startsWith('--'))

        console.log('SQLTable: Processing', statements.length, 'SQL statements')

        statements.forEach((stmt, index) => {
          if (!stmt) return

          try {
            console.log(`SQLTable: Executing statement ${index + 1}:`, stmt.substring(0, 80) + '...')

            // AlaSQL can execute DDL directly - no type conversion needed
            sqlManagerRef.current.runSQL(stmt)

            // Extract table name from CREATE TABLE statements
            const createMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)
            if (createMatch) {
              tableNames.push(createMatch[1])
              console.log('SQLTable: Found table:', createMatch[1])
            }
          } catch (stmtError) {
            // Check if it's a duplicate key error on INSERT - this is expected when re-running schema
            const isDuplicateKeyError = stmtError.message.includes('already exists in primary key index') ||
                                      stmtError.message.includes('UNIQUE constraint failed') ||
                                      stmtError.message.includes('duplicate key') ||
                                      stmtError.message.includes('PRIMARY KEY constraint failed') ||
                                      stmtError.message.includes('constraint failed')

            // Check if it's a table already exists error on CREATE TABLE
            const isTableExistsError = stmtError.message.includes('already exists in the database') ||
                                     stmtError.message.includes('table already exists')

            if (isDuplicateKeyError && stmt.trim().toUpperCase().startsWith('INSERT')) {
              console.log(`SQLTable: Skipping duplicate INSERT statement ${index + 1} (data already exists)`)
            } else if (isTableExistsError && stmt.trim().toUpperCase().startsWith('CREATE TABLE')) {
              console.log(`SQLTable: Skipping CREATE TABLE statement ${index + 1} (table already exists)`)
            } else {
              console.warn(`SQLTable: Statement ${index + 1} failed:`, stmtError.message)
              console.warn(`SQLTable: Failed statement:`, stmt)
            }
            // Continue with other statements instead of failing completely
          }
        })
      }

      console.log('SQLTable: Schema execution completed, found tables:', tableNames)
      setTables(tableNames)

      // Auto-select first table if available
      if (tableNames.length > 0) {
        const mainTable = tableNames[0]
        setSelectedTable(mainTable)
        showTableData(mainTable)
      }

    } catch (error) {
      console.error('SQLTable: Schema execution failed:', error)
      setError(`Schema execution failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Retrieve table data using AlaSQL - returns objects directly
  const showTableData = (tableName) => {
    if (!tableName) {
      console.log('SQLTable: showTableData called but tableName missing')
      return
    }

    console.log('SQLTable: Retrieving data from table:', tableName)
    setLoading(true)
    setError('')

    try {
      // Validate table name
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
        throw new Error('Invalid table name')
      }

      // AlaSQL returns array of objects directly
      const rows = sqlManagerRef.current.queryAsObjects(`SELECT * FROM ${tableName}`)
      console.log('SQLTable: Raw rows from database:', rows.slice(0, 3))

      if (rows.length > 0) {
        // Extract column names from first row
        const columns = Object.keys(rows[0])
        console.log('SQLTable: Retrieved', rows.length, 'rows with columns:', columns)

        // Convert objects to array format for display
        const arrayResults = rows.map(row => columns.map(col => row[col]))
        console.log('SQLTable: Array results sample:', arrayResults.slice(0, 3))

        console.log('SQLTable: Loading table data - columns:', columns, 'rows:', arrayResults.length)
        setCols(columns)
        setResults(arrayResults)

        // Analyze columns and initialize filters
        analyzeColumnsAndInitializeFilters(columns, arrayResults)
      } else {
        console.log('SQLTable: Table is empty')
        setCols([])
        setResults([])
        setColumnFilters({})
        setColumnTypes({})
      }

    } catch (error) {
      console.error('SQLTable: Error retrieving table data:', error)
      setError(`Failed to load table data: ${error.message}`)
      setCols([])
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Execute user SQL queries with AlaSQL
  const runSQL = () => {
    if (!sqlCode?.trim()) {
      setError('No SQL code to execute')
      return
    }

    console.log('SQLTable: Executing user SQL query with AlaSQL')
    setLoading(true)
    setError('')

    try {
      // AlaSQL returns array of objects directly
      const result = sqlManagerRef.current.queryAsObjects(sqlCode.trim())
      console.log('SQLTable: Raw query results from database:', result.slice(0, 3))

      if (result.length > 0) {
        // Extract column names from first row
        const columns = Object.keys(result[0])
        // Convert objects to array format for display
        const arrayResults = result.map(row => columns.map(col => row[col]))

        console.log('SQLTable: Loading query results - columns:', columns, 'rows:', arrayResults.length)
        setCols(columns)
        setResults(arrayResults)

        // Analyze columns and initialize filters
        analyzeColumnsAndInitializeFilters(columns, arrayResults)

        console.log('SQLTable: Query executed successfully, returned', result.length, 'rows')
      } else {
        // Handle empty results
        setCols([])
        setResults([])
        setColumnFilters({})
        setColumnTypes({})
        console.log('SQLTable: Query returned no results')
      }

    } catch (error) {
      console.error('SQLTable: SQL execution failed:', error)
      setError(`SQL execution failed: ${error.message}`)
      setCols([])
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Apply column-based filters to data
  console.log('SQLTable: Starting filtering process - global filter:', filter, 'column filters:', columnFilters, 'column types:', columnTypes)
  const filteredData = results.filter((row, rowIndex) => {
    console.log(`SQLTable: Filtering row ${rowIndex}, values:`, row.map(String))

    // Global text search
    if (filter && !row.some(cell => String(cell).toLowerCase().includes(filter.toLowerCase()))) {
      console.log(`SQLTable: Row ${rowIndex} filtered out by global search "${filter}"`)
      return false
    }

    // Apply column-specific filters - only when they have actual values
    for (const [colName, filterValue] of Object.entries(columnFilters)) {
      console.log(`SQLTable: Checking filter for "${colName}":`, filterValue, `type: ${columnTypes[colName]}`)

      // Skip if no filter value is set
      if (columnTypes[colName] === 'select' && (!Array.isArray(filterValue) || filterValue.length === 0)) {
        console.log(`SQLTable: Skipping empty select filter for "${colName}"`)
        continue
      }
      if (typeof filterValue === 'string' && !filterValue.trim()) {
        console.log(`SQLTable: Skipping empty text filter for "${colName}"`)
        continue
      }

      const colIndex = cols.indexOf(colName)
      if (colIndex === -1) {
        console.log(`SQLTable: Column "${colName}" not found in cols array`)
        continue
      }

      const cellValue = String(row[colIndex] || '').toLowerCase()
      console.log(`SQLTable: Row ${rowIndex}, column "${colName}" (index ${colIndex}), cell value: "${cellValue}"`)

      if (columnTypes[colName] === 'boolean') {
        // Only apply boolean filter if at least one option is selected
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          const matches = filterValue.some(fv => {
            if (fv === 'true') return cellValue === 'true'
            if (fv === 'false') return cellValue === 'false'
            if (fv === 'null') return cellValue === 'null' || cellValue === ''
            return false
          })
          console.log(`SQLTable: Boolean filter result for "${colName}": ${matches}`)
          if (!matches) {
            console.log(`SQLTable: Row ${rowIndex} filtered out by boolean filter "${colName}"`)
            return false
          }
        }
      } else if (columnTypes[colName] === 'select') {
        // Only apply select filter if values are selected
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          console.log(`SQLTable: Checking ${filterValue.length} filter values:`, filterValue)
          const matches = filterValue.some(filterVal => {
            const filterValLower = filterVal.toLowerCase()
            const match = filterValLower === cellValue
            console.log(`SQLTable: Comparing "${filterVal}" (lowercase: "${filterValLower}") with "${cellValue}": ${match}`)
            return match
          })
          console.log(`SQLTable: Select filter result for "${colName}": ${matches}`)
          if (!matches) {
            console.log(`SQLTable: Row ${rowIndex} filtered out by select filter "${colName}"`)
            return false
          }
        }
      } else {
        // Text/number filter - only apply if there's text to filter by
        if (typeof filterValue === 'string' && filterValue.trim()) {
          const matches = cellValue.includes(filterValue.toLowerCase())
          console.log(`SQLTable: Text filter for "${colName}" "${filterValue}" in "${cellValue}": ${matches}`)
          if (!matches) {
            console.log(`SQLTable: Row ${rowIndex} filtered out by text filter "${colName}"`)
            return false
          }
        }
      }
    }

    console.log(`SQLTable: Row ${rowIndex} passed all filters`)
    return true
  })

  console.log(`SQLTable: Filtering complete - ${results.length} original rows, ${filteredData.length} filtered rows`)

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortCol) return 0
    const idx = cols.indexOf(sortCol)
    const valA = a[idx], valB = b[idx]
    return sortDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
  })

  const toggleSort = (col) => { // Toggle sort
    if (sortCol === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  // Filter management functions
  const updateColumnFilter = (column, value) => {
    console.log(`SQLTable: Updating filter for column "${column}" to:`, value)
    setColumnFilters(prev => {
      const newFilters = {
        ...prev,
        [column]: value
      }
      console.log('SQLTable: New column filters state:', newFilters)
      return newFilters
    })
  }

  const clearColumnFilter = (column) => {
    console.log(`SQLTable: Clearing filter for column "${column}"`)
    setColumnFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[column]
      console.log('SQLTable: Column filters after clearing:', newFilters)
      return newFilters
    })
  }

  const clearAllFilters = () => {
    console.log('SQLTable: Clearing all filters')
    setFilter('')
    setColumnFilters({})
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const resetDatabase = () => {
    try {
      sqlManagerRef.current.resetDatabase()
      setResults([])
      setCols([])
      setTables([])
      setSelectedTable('')
      setColumnFilters({})
      setColumnTypes({})
      setFilter('')
      setShowFilters(false)
      console.log('SQLTable: Database reset and UI cleared')
    } catch (error) {
      setError(`Failed to reset database: ${error.message}`)
    }
  }

  // Generate SQL WHERE clause from filters
  const generateWhereClause = () => {
    const conditions = []

    // Add column filters
    for (const [colName, filterValue] of Object.entries(columnFilters)) {
      if (!filterValue || filterValue.length === 0) continue

      if (columnTypes[colName] === 'boolean') {
        const boolConditions = filterValue.map(fv => {
          if (fv === 'true') return `${colName} = true`
          if (fv === 'false') return `${colName} = false`
          if (fv === 'null') return `${colName} IS NULL`
          return ''
        }).filter(Boolean)
        if (boolConditions.length > 0) {
          conditions.push(`(${boolConditions.join(' OR ')})`)
        }
      } else if (columnTypes[colName] === 'select') {
        const quotedValues = filterValue.map(val => `'${val.replace(/'/g, "''")}'`)
        conditions.push(`${colName} IN (${quotedValues.join(', ')})`)
      } else {
        // Text/number filter
        conditions.push(`${colName} LIKE '%${filterValue.replace(/'/g, "''")}%'`)
      }
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  }

  // Generate complete SQL query from current filters
  const generateSQLFromFilters = () => {
    if (!selectedTable) return ''

    const whereClause = generateWhereClause()
    return `SELECT * FROM ${selectedTable}${whereClause ? '\n' + whereClause : ''};`
  }

  // Apply SQL query generated from filters
  const applyFiltersAsSQL = () => {
    const sqlQuery = generateSQLFromFilters()
    if (sqlQuery) {
      // You can either execute this SQL or just show it
      console.log('Generated SQL from filters:', sqlQuery)
      // For now, we'll just log it. In a real app, you might want to execute it or show it to the user
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="border-b">
        <div className="p-3 flex gap-2">
          {tables.length > 1 && (
            <select
              value={selectedTable}
              onChange={e => {
                setSelectedTable(e.target.value)
                showTableData(e.target.value)
              }}
              className="px-3 py-1 text-sm border rounded"
              disabled={loading}
            >
              {tables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          )}
          <Button size="sm" onClick={runSQL} disabled={loading || !sqlCode?.trim()}>
            <Play className="w-4 h-4 mr-1" />
            {loading ? 'Running...' : 'Run SQL'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetDatabase}
            disabled={loading}
            className="text-orange-600 hover:text-orange-700"
          >
            Reset DB
          </Button>
          <input
            placeholder="Global search..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-1 text-sm border rounded flex-1"
            disabled={loading}
          />
          {cols.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={toggleFilters}
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          )}
          {selectedTable && Object.keys(columnFilters).some(key => {
            const filterValue = columnFilters[key]
            return (Array.isArray(filterValue) && filterValue.length > 0) ||
                   (typeof filterValue === 'string' && filterValue.trim().length > 0)
          }) && (
            <Button
              size="sm"
              variant="outline"
              onClick={applyFiltersAsSQL}
              className="flex items-center gap-1"
            >
              <Play className="w-4 h-4" />
              Generate SQL
            </Button>
          )}
          {(filter || Object.keys(columnFilters).some(key => {
            const filterValue = columnFilters[key]
            return (Array.isArray(filterValue) && filterValue.length > 0) ||
                   (typeof filterValue === 'string' && filterValue.trim().length > 0)
          })) && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Column Filters Panel */}
        {showFilters && cols.length > 0 && (
          <div className="px-3 pb-3 border-t bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {cols.map(col => (
                <div key={col} className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    {col}
                  </label>

                  {columnTypes[col] === 'boolean' ? (
                    <div className="space-y-1">
                      {['true', 'false', 'null'].map(value => (
                        <label key={value} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={(columnFilters[col] || []).includes(value)}
                            onChange={(e) => {
                              const currentFilters = columnFilters[col] || []
                              if (e.target.checked) {
                                updateColumnFilter(col, [...currentFilters, value])
                              } else {
                                updateColumnFilter(col, currentFilters.filter(v => v !== value))
                              }
                            }}
                            className="mr-2"
                            disabled={loading}
                          />
                          {value === 'null' ? 'NULL' : value}
                        </label>
                      ))}
                    </div>
                  ) : columnTypes[col] === 'select' ? (
                    <div className="space-y-1">
                      {Array.from(new Set(results.map(row => {
                        const colIndex = cols.indexOf(col)
                        return String(row[colIndex] || '')
                      }))).slice(0, 10).map(value => {
                        console.log(`SQLTable: Checkbox for "${col}": "${value}", current filters:`, columnFilters[col] || [])
                        return (
                          <label key={value} className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={(columnFilters[col] || []).includes(value)}
                              onChange={(e) => {
                                const currentFilters = columnFilters[col] || []
                                if (e.target.checked) {
                                  console.log(`SQLTable: Adding "${value}" to filter for "${col}"`)
                                  updateColumnFilter(col, [...currentFilters, value])
                                } else {
                                  console.log(`SQLTable: Removing "${value}" from filter for "${col}"`)
                                  updateColumnFilter(col, currentFilters.filter(v => v !== value))
                                }
                              }}
                              className="mr-2"
                              disabled={loading}
                            />
                            {value || 'NULL'}
                          </label>
                        )
                      })}
                      {Array.from(new Set(results.map(row => {
                        const colIndex = cols.indexOf(col)
                        return String(row[colIndex] || '')
                      }))).length > 10 && (
                        <div className="text-xs text-gray-500">
                          ... and more values
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Filter ${col}...`}
                      value={columnFilters[col] || ''}
                      onChange={(e) => updateColumnFilter(col, e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded"
                      disabled={loading}
                    />
                  )}

                  {((Array.isArray(columnFilters[col]) && columnFilters[col].length > 0) ||
                    (typeof columnFilters[col] === 'string' && columnFilters[col].trim().length > 0)) && (
                    <button
                      onClick={() => clearColumnFilter(col)}
                      className="text-xs text-red-600 hover:text-red-700"
                      disabled={loading}
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            Executing query...
          </div>
        ) : cols.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {cols.map(col => (
                  <th key={col} className="p-3 text-left border-b">
                    <button
                      onClick={() => toggleSort(col)}
                      className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded disabled:opacity-50"
                      disabled={loading}
                    >
                      {col}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="p-3 break-words">
                        {cell === null || cell === undefined ? 'NULL' : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={cols.length || 1} className="p-8 text-center text-gray-500">
                    No matching data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            {tables.length > 0 ? 'Select a table to view data' : 'No tables available'}
          </div>
        )}
      </div>
    </div>
  )
}
