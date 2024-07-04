# Rick & Morty API Challenge

Implements a REST API for retrieving locations that feature in the Rick & Morty
show. Specifically, the API avails endpoints for performing the following:

- List all locations (name and type) plus the characters that reside in that
  location
- Full-text search for specific locations. The search can be carried out on the
  location names, residing character names or episode names
- View more details about a given location
- Given a character that resides in a location, add/update notes about that
  character

## Architectural and Design Decisions

The **tech stack** used is:

- [Fastify](https://fastify.dev/): web framework used to implement the REST API.
  It is fast and easy to grok compared to alternatives
- [ky](https://github.com/sindresorhus/ky): HTTP client used to retrieve data
  from the Rick & Morty API. It has a straightforward API and sensible defaults
- [DuckDB](https://duckdb.org/): embeddable analytics DB used to store and query
  the data. Offers Full-text search out of the box, in-process therefore no need
  to run additional services. Also can be run as a WASM offering the possibility
  of moving the entire app to the client in future

**Why REST instead of GraphQL?** The API is 'closed' or 'fixed' in that all
possible kinds of inputs and outputs are specified in the prompt. Therefore,
while GraphQL provides flexibility, the additional complexity it brings is not
needed. REST on the other hand is simpler, easier to test/debug and given that
the endpoints are few (at most 5), REST exposes only the specified API (there
will not be any future extensions such as modifying an endpoint or adding new
ones). Also, there is only one developer actively working on the project - some
of the advantages of GraphQL such as coordinating across separate teams and
optimizing for front-end development are not needed.

**How is Data Managed?**: The project used DuckDB for persistence. DuckDB is
embeddable therefore there is no need to run a separate database. The DB stores
both the data from Rick & Morty plus user-provided notes. During initialization,
all the data from the Rick & Morty is retrieved and stored in the DB. Therefore,
during runtime, no additional requests are made to the Rick & Morty API. User
notes are also stored in the database. Since we do not have user-account
management (users cannot sign up/create accounts), storing the notes as is is a
flaw and in future, this will be moved to client-side such as local storage on
the browser.

**When/How is Data Updated?**: as new Rick & Morty episodes are released, the
data needs to be updated since we're caching it in the database rather than
fetching it from the API on demand. Therefore, during startup, the app checks if
new episodes have been released and if so, updates the database. If this call
fails, the app still proceeds but the data might be potentially stale.

## Project structure

- `src/app.js`: contains code for starting up and running the server. It is also
  where the configuration is.
- `src/routes.js`: holds the REST API endpoints
- `src/db.js`: holds the schema for the database, plus code for initializing the
  DB by retrieving data from the Rick & Morty API and inserting it.
- `src/handlers.js`: holds code for accessing and querying the data

## Deployment

Get the dependencies

```bash
npm install
```

To configure, modify the `config` object in `src/app.js`. The defaults are:

```javascript
{
  skipDBChecks: true,
  dbPath: "app.db",
  port: 3000,
  host: "localhost",
  logger: false,
};
```

To run **locally**:

```bash
node src/app.js
```

## Tests

TODO
