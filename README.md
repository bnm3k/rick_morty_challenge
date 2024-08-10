# Rick & Morty API Challenge

Implements a REST API for retrieving locations that feature in the Rick & Morty
show. Specifically, the API avails endpoints for performing the following:

- List all locations (name and type) plus the characters that reside in that
  location
- Full-text search for specific locations. The search can be carried out on the
  location names, residing character names or episode names
- View more details about a given location

## Update - NextJS UI Added

UI added, powered by next.js and what-nots. After running the backend API based
on the instructions below (which powers search and caches content from the
actual rickandmorty.api), `cd` into `ui` and launch the next js server:

```bash
cd ui
npm run dev
```

Then go to `localhost:3000`. Notes are now persisted in browser local storage
rather than in the backend.

A docker image is also provided for the ui server. It runs `next build` for an
optimized deployable server build. When building the ui image, make sure the
backend API is running.

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
both the data from Rick & Morty. During initialization, all the data from the
Rick & Morty is retrieved and stored in the DB. Therefore, during runtime, no
additional requests are made to the Rick & Morty API.

**When/How is Data Updated?**: as new Rick & Morty episodes are released, the
data needs to be updated since we're caching it in the database rather than
fetching it from the API on demand. Therefore, during startup, the app checks if
new episodes have been released and if so, updates the database. If this call
fails, the app still proceeds but the data might be potentially stale.

## Project structure

- `api/src/app.js`: contains code for starting up and running the server. It is
  also where the configuration is.
- `api/src/config.js`: holds the default configuration, dev config and setting
  up and parsing of config passed via CLI arguments.
- `api/src/controllers.js`: holds code for accessing and querying the data
- `api/src/db.js`: holds the schema for the database, plus code for initializing
  the DB by retrieving data from the Rick & Morty API and inserting it.
- `api/src/docs.js`: holds setup code for the API documentations (which uses
  [swagger](https://swagger.io/))
- `api/src/routes.js`: holds the REST API endpoints
- `api/src/version.js`: retrieves version from package.json
- `api/scripts/init-db.js`: script for setting up the database and seeding it
  with data from the Rick & Morty API.

## Deployment

Get the dependencies

```bash
npm install
```

To configure the defaults, modify the `defaultConfig` object in `src/config.js`.
The defaults are:

```javascript
{
  skipDbChecks: false, // before skipping, check that file is present
  dbPath: "app.db",
  port: 3001,
  host: "localhost",
  logger: true,
  dev: false,
};
```

However, for runtime, it is recommended that the configurations are set via CLI
arguments:

```bash=
> node api/src/app.js --help
Usage: app [options]

Options:
  -V, --version      output the version number
  --dev              Sets dev mode to true, NOT for live production
  -p, --port <port>  Port for server address
  -h, --host <host>  Host for server address
  --db-path <path>   Path to db file
  --skip-db-checks   Skip check for updates on Rick & Morty API
  --quiet            Quiet mode: disable all logging (default: false)
  --help             display help for command
```

To run **locally**:

```bash
node src/app.js
```

The DB will be automatically seeded and refreshed on startup (unless you pass
the `--skip-db-checks` flag). However, if you want to init and seed the db
separately, run the following at the project root:

```bash
npm run init-db
```

or:

```bash
node scripts/init-db.js
```

### Docker

The service can also be run within a docker container.

To build the API image (at the project root):

```bash
cd api
```

```bash
docker build -t rick_morty_api .
```

To run:

```bash
docker container run --rm -p 3001:3001 \
  --name rick_morty_api rick_morty_api:latest
```

The debian node image is used rather than alpine since getting DuckDB to work
with musl proved challenging - that is, the duckdb package as installed from NPM
rather than built from source.

While the API docs endpoint is accessible from a containerized instance, there
is a configuration bug somewhere that prevents sending requests to and fro to
test the API. For such usage, it is recommended that the service is run directly
at the host rather than within the docker container.

## Tests

TODO

## License

MIT
