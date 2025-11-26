# sql.js Developer Guide

**sql.js** is SQLite compiled to WebAssembly, running entirely in the browser or Node.js. No server needed.

---

## 1. Installation & Setup

### Browser (CDN)
```html
<script src="https://sql.js.org/dist/sql-wasm.js"></script>
<script>
  initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  }).then(SQL => {
    const db = new SQL.Database();
    // Ready to use
  });
</script>
```

### NPM
```bash
npm install sql.js
```

```javascript
const initSqlJs = require('sql.js');
// or: import initSqlJs from 'sql.js';

const SQL = await initSqlJs({
  locateFile: file => `https://sql.js.org/dist/${file}`
});
const db = new SQL.Database();
```

---

## 2. Core API Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `db.run(sql, params?)` | Execute SQL, no results | `Database` (chainable) |
| `db.exec(sql, params?)` | Execute SQL, returns results | `QueryResult[]` |
| `db.prepare(sql)` | Create prepared statement | `Statement` |
| `db.each(sql, params, callback)` | Iterate rows with callback | `Database` |
| `db.export()` | Export database to file | `Uint8Array` |
| `db.close()` | Close database | `void` |

---

## 3. Result Format

`db.exec()` returns an array of result objects:

```javascript
const results = db.exec("SELECT id, name FROM users");
// Returns:
[
  {
    columns: ["id", "name"],        // Column names
    values: [                        // Row data (array of arrays)
      [1, "Alice"],
      [2, "Bob"]
    ]
  }
]
```

**Multiple statements** return multiple result objects:
```javascript
db.exec("SELECT * FROM a; SELECT * FROM b");
// Returns: [{ columns, values }, { columns, values }]
```

---

## 4. Simple Utility Functions

### Initialize Database
```javascript
let db = null;

async function initDB() {
  const SQL = await initSqlJs({
    locateFile: f => `https://sql.js.org/dist/${f}`
  });
  db = new SQL.Database();
  return db;
}
```

### Run SQL (No Results)
```javascript
function runSQL(sql, params = {}) {
  db.run(sql, params);
}

// Usage
runSQL("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)");
runSQL("INSERT INTO users VALUES (:id, :name, :age)", {
  ':id': 1,
  ':name': 'Alice',
  ':age': 25
});
```

### Execute Query (With Results)
```javascript
function querySQL(sql, params = {}) {
  const results = db.exec(sql, params);
  if (results.length === 0) return { columns: [], rows: [] };
  
  const { columns, values } = results[0];
  return { columns, rows: values };
}

// Usage
const { columns, rows } = querySQL("SELECT * FROM users WHERE age > 20");
```

### Convert Results to Objects
```javascript
function queryAsObjects(sql, params = {}) {
  const { columns, rows } = querySQL(sql, params);
  return rows.map(row => 
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

// Usage
const users = queryAsObjects("SELECT * FROM users");
// Returns: [{ id: 1, name: "Alice", age: 25 }, ...]
```

---

## 5. Render Table to HTML

### Basic Table Renderer
```javascript
function renderTable(sql, params = {}) {
  const { columns, rows } = querySQL(sql, params);
  
  if (columns.length === 0) return '<p>No results</p>';
  
  const header = columns.map(c => `<th>${c}</th>`).join('');
  const body = rows.map(row => 
    `<tr>${row.map(cell => `<td>${cell ?? 'NULL'}</td>`).join('')}</tr>`
  ).join('');
  
  return `
    <table border="1">
      <thead><tr>${header}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

// Usage
document.getElementById('output').innerHTML = renderTable("SELECT * FROM users");
```

### React Component
```jsx
function SQLTable({ sql, params = {} }) {
  const { columns, rows } = querySQL(sql, params);
  
  if (columns.length === 0) return <p>No results</p>;
  
  return (
    <table>
      <thead>
        <tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => <td key={ci}>{cell ?? 'NULL'}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 6. Prepared Statements (For Repeated Queries)

```javascript
const stmt = db.prepare("SELECT * FROM users WHERE age > :minAge");

// First execution
stmt.bind({ ':minAge': 18 });
while (stmt.step()) {
  console.log(stmt.getAsObject()); // { id: 1, name: "Alice", age: 25 }
}

// Reuse with new params
stmt.reset();
stmt.bind({ ':minAge': 30 });
while (stmt.step()) {
  console.log(stmt.get()); // [2, "Bob", 35] (array format)
}

stmt.free(); // Always free when done!
```

---

## 7. Load/Save Database Files

### Load from File Input
```javascript
async function loadDB(file) {
  const buffer = await file.arrayBuffer();
  const SQL = await initSqlJs({ locateFile: f => `https://sql.js.org/dist/${f}` });
  db = new SQL.Database(new Uint8Array(buffer));
}

// HTML: <input type="file" onchange="loadDB(this.files[0])">
```

### Export & Download
```javascript
function downloadDB(filename = 'database.sqlite') {
  const data = db.export();
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 8. Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://sql.js.org/dist/sql-wasm.js"></script>
</head>
<body>
  <textarea id="sql" rows="4">SELECT * FROM demo</textarea>
  <button onclick="executeQuery()">Run</button>
  <div id="output"></div>

  <script>
    let db;

    // Initialize
    initSqlJs({
      locateFile: f => `https://sql.js.org/dist/${f}`
    }).then(SQL => {
      db = new SQL.Database();
      db.run(`
        CREATE TABLE demo (id INT, name TEXT);
        INSERT INTO demo VALUES (1, 'Hello'), (2, 'World');
      `);
    });

    // Execute and render
    function executeQuery() {
      const sql = document.getElementById('sql').value;
      try {
        const results = db.exec(sql);
        if (results.length === 0) {
          document.getElementById('output').innerHTML = '<p>Query executed (no results)</p>';
          return;
        }
        const { columns, values } = results[0];
        const html = `
          <table border="1">
            <tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr>
            ${values.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
          </table>
        `;
        document.getElementById('output').innerHTML = html;
      } catch (e) {
        document.getElementById('output').innerHTML = `<p style="color:red">${e.message}</p>`;
      }
    }
  </script>
</body>
</html>
```

---

## Key Points

- **In-memory only**: Changes don't persist on page reload (use `db.export()` to save)
- **Parameter prefixes**: Use `:name`, `$name`, or `@name` for named params
- **Always free statements**: Call `stmt.free()` after using prepared statements
- **WebWorker support**: Use `worker.sql-wasm.js` for heavy queries off main thread