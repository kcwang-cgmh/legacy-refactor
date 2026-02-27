# Data Migration Patterns

## Strategy Selection

### Strategy A: Reuse Existing Database (Recommended for most cases)

Directly map existing Oracle tables to Dapper POCO entities:

1. Create POCO entity classes matching Oracle table columns
2. Build `IRepository` interfaces for each domain entity
3. Implement repositories using Dapper + `Oracle.ManagedDataAccess.Core`
4. Centralize SQL queries in `Data/Sql/` static classes
5. Incrementally rename properties to follow .NET naming conventions

**When to use:** Database schema is reasonable, just needs minor adjustments.

### Strategy B: New Database Schema

Design new POCO entities from scratch, then write Oracle DDL migration scripts:

1. Design new entity model based on domain requirements
2. Write Oracle DDL scripts (`CREATE TABLE`, `ALTER TABLE`) to generate new schema
3. Execute DDL scripts manually or via a migration runner (e.g., DbUp, Flyway)
4. Write SQL scripts or C# code to transform and copy data
5. Run migration during cutover

**When to use:** Legacy schema is heavily denormalized, has significant debt, or when doing a complete redesign.

### Strategy C: Hybrid (Most Common)

Keep core Oracle tables, refactor problematic ones:

1. Map existing core entities (Strategy A)
2. Identify tables needing redesign
3. Write Oracle DDL for new/modified tables
4. Write targeted data migration SQL scripts for changed tables
5. Implement Dapper repositories for both old and new tables

## Stored Procedure Handling

| Scenario | Recommended Approach |
| --- | --- |
| Simple CRUD SP | Replace with Dapper `QueryAsync<T>` / `ExecuteAsync` |
| Complex business logic SP | Rewrite as C# service methods |
| Performance-critical SP | Keep SP, call via Dapper with `CommandType.StoredProcedure` |
| Reporting SP | Keep SP or convert to Dapper query |
| SP with dynamic SQL | Rewrite with Dapper parameterized queries |

## Connection String Migration

**Legacy (Web.config):**

```text
<connectionStrings>
  <add name="DefaultConnection"
       connectionString="Data Source=ORASERVER;User Id=MYUSER;Password=MYPASS;"
       providerName="Oracle.ManagedDataAccess.Client" />
</connectionStrings>
```

**Modern (appsettings.json):**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ORASERVER;User Id=MYUSER;Password=MYPASS;"
  }
}
```

## Common Data Access Migration Patterns

### ADO.NET → Dapper

Legacy:

```text
using (var conn = new OracleConnection(connString))
{
    var cmd = new OracleCommand("SELECT * FROM USERS WHERE ID = :Id", conn);
    cmd.Parameters.Add(":Id", OracleDbType.Int32).Value = id;
    conn.Open();
    var reader = cmd.ExecuteReader();
}
```

Modern (Dapper):

```text
var user = await _connection.QueryFirstOrDefaultAsync<User>(
    UserSql.GetById, new { Id = id });
```

### DataSet/DataTable → Dapper POCOs

Legacy:

```text
var ds = new DataSet();
var adapter = new OracleDataAdapter("SELECT * FROM ORDERS", conn);
adapter.Fill(ds, "Orders");
var row = ds.Tables["Orders"].Rows[0];
```

Modern (Dapper):

```text
var orders = await _connection.QueryAsync<Order>(OrderSql.GetAll);
var order = orders.First();
```
