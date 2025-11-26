# Frontend SQL: Which is Easiest?

## Quick Comparison

| Feature | **AlaSQL** ✅ | sql.js |
|---------|-----------|--------|
| Bundle Size | ~280 KB | ~700 KB (WASM) |
| Setup | Synchronous, instant | Async (must await) |
| Result Format | Array of objects | `{columns, values}` arrays |
| Query JS Arrays | ✅ Native (`FROM ?`) | ❌ Must create tables |
| Complexity | Very simple | More complex |
| SQLite Compatibility | Partial SQL-99 | Full SQLite |

---

## Winner for Simple Use: **AlaSQL**

### Why AlaSQL is Easier

1. **No async setup** - works immediately
2. **Query arrays directly** - no table creation needed
3. **Returns objects** - `[{id: 1, name: "Alice"}]` not `{columns, values}`
4. **Smaller bundle** - 280KB vs 700KB

---

## AlaSQL - Minimal Example

```html
<script src="https://cdn.jsdelivr.net/npm/alasql"></script>
<script>
  // Query a JavaScript array directly!
  const data = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 }
  ];
  
  const result = alasql("SELECT * FROM ? WHERE age > 20", [data]);
  console.log(result);
  // → [{ id: 1, name: "Alice", age: 25 }, { id: 2, name: "Bob", age: 30 }]
</script>
```

That's it. No initialization, no promises, no async/await.

---

## AlaSQL Complete Pattern

```javascript
// 1. Query existing array
const users = [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}];
alasql("SELECT * FROM ? WHERE id = 1", [users]);
// → [{id: 1, name: "Alice"}]

// 2. Or create tables if you prefer
alasql("CREATE TABLE users (id INT, name STRING)");
alasql("INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob')");
alasql("SELECT * FROM users");
// → [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}]

// 3. JOINs work too
alasql(`
  SELECT u.name, o.product 
  FROM ? u 
  JOIN ? o ON u.id = o.userId
`, [users, orders]);
```

---

## Simple Table Renderer (AlaSQL)

```javascript
function renderTable(sql, data = []) {
  const result = alasql(sql, [data]);
  if (!result.length) return '<p>No results</p>';
  
  const keys = Object.keys(result[0]);
  return `
    <table border="1">
      <tr>${keys.map(k => `<th>${k}</th>`).join('')}</tr>
      ${result.map(row => 
        `<tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>`
      ).join('')}
    </table>
  `;
}

// Usage
const html = renderTable("SELECT * FROM ? WHERE age > 20", users);
document.body.innerHTML = html;
```

---

## When to Use Each

### Use **AlaSQL** when:
- You want the simplest solution
- You're querying existing JS arrays/objects
- You need quick prototyping
- Bundle size matters

### Use **sql.js** when:
- You need full SQLite compatibility
- You're loading `.sqlite` database files
- You need specific SQLite functions
- You want to export real SQLite files

---

## Side-by-Side Code

### AlaSQL (3 lines)
```javascript
const data = [{a: 1}, {a: 2}];
const result = alasql("SELECT * FROM ?", [data]);
// → [{a: 1}, {a: 2}]
```

### sql.js (8+ lines)
```javascript
const SQL = await initSqlJs({
  locateFile: f => `https://sql.js.org/dist/${f}`
});
const db = new SQL.Database();
db.run("CREATE TABLE t (a INT)");
db.run("INSERT INTO t VALUES (1), (2)");
const result = db.exec("SELECT * FROM t");
// → [{columns: ["a"], values: [[1], [2]]}]
```

---

## Bottom Line

For your use case (run SQL snippets, show tables, basic stuff):

**→ Use AlaSQL. It's simpler, smaller, and synchronous.**