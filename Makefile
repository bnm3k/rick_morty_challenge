.SILENT:
.DEFAULT_GOAL:=run

run:
	node main.js

sql:
	duckdb -readonly app.db < curr.sql
