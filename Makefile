.SILENT:
.DEFAULT_GOAL:=run

run:
	node src/main.js

sql:
	duckdb -readonly app.db < curr.sql
