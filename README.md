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
- `src/config.js`: holds the default configuration, dev config and setting up
  and parsing of config passed via CLI arguments.
- `src/controllers.js`: holds code for accessing and querying the data
- `src/db.js`: holds the schema for the database, plus code for initializing the
  DB by retrieving data from the Rick & Morty API and inserting it.
- `src/docs.js`: holds setup code for the API documentations (which uses
  [swagger](https://swagger.io/))
- `src/routes.js`: holds the REST API endpoints
- `src/version.js`: retrieves version from package.json
- `scripts/init-db.js`: script for setting up the database and seeding it with
  data from the Rick & Morty API.

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
  port: 3000,
  host: "localhost",
  logger: true,
  dev: false,
};
```

However, for runtime, it is recommended that the configurations are set via CLI
arguments:

```bash=
> node src/app.js --help
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

To build the image (at the project root):

```bash
docker build -t rick_morty_api .
```

To run:

```bash
docker container run --rm -p 3000:3000 \
  --name rick_morty rick_morty_api:latest
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
