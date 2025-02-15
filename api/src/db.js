import fs from "fs";

import ky from "ky";
import { Database } from "duckdb-async";
import pino from "pino";

const schemaSQL = `
CREATE TABLE IF NOT EXISTS location (
  id INTEGER PRIMARY KEY,
  name STRING NOT NULL,
  type STRING NOT NULL,
  dimension STRING,
  created_at DATETIME
);

CREATE TABLE IF NOT EXISTS character(
  id INTEGER PRIMARY KEY,
  name STRING,
  status STRING CHECK (status in ('Alive','Dead','unknown')),
  species STRING,
  type STRING,
  gender STRING CHECK (gender in ('Female', 'Male', 'Genderless', 'unknown')),
  origin_location INTEGER,
  last_known_location INTEGER,
  image_filename STRING, -- not null
  created_at DATETIME
);

CREATE TABLE IF NOT EXISTS episode(
  id INTEGER PRIMARY KEY,
  name STRING,
  air_date DATE,
  episode STRING,
  created_at DATETIME
);

CREATE TABLE IF NOT EXISTS episode_to_character(
  episode_id INTEGER,
  character_id INTEGER,
  PRIMARY KEY(episode_id, character_id)
);
`;

const insertLocations = async (db, logger) => {
  // Insert chunk/page of location
  // We do not expect the location metadata to change as new episodes are
  // released, therefore we 'ignore' if we already have the data for a given
  // location.

  const insertChunk = async (locations) => {
    const conn = await db.connect();
    const stmt = await conn.prepare(
      "INSERT OR IGNORE INTO location VALUES (?,?,?,?,?)"
    );
    for (let l of locations) {
      stmt.run(l.id, l.name, l.type, l.dimension, l.created);
    }
    stmt.finalize();
    await conn.close();
  };

  let endpoint = "https://rickandmortyapi.com/api/location";
  await doInsert(db, endpoint, insertChunk);
  logger.info("Complete load of locations from API into DB");
};

const insertEpisodes = async (db, logger) => {
  // Insert chunk/page of episodes
  // We do not expect the episode data for previous episodes to change as new
  // episodes are released, therefore we 'ignore' if we already have the data
  // for a given episode.

  const insertChunk = async (episodes) => {
    const conn = await db.connect();
    // insert episode
    let stmt = await conn.prepare(
      `INSERT OR IGNORE INTO episode
      BY POSITION (id, name, air_date, episode, created_at)
      VALUES(?,?,strptime(?, '%B %d, %Y'),?,?)`
    );
    for (let e of episodes) {
      stmt.run(e.id, e.name, e.air_date, e.episode, e.created);
    }
    stmt.finalize();

    stmt = await conn.prepare(
      `INSERT OR IGNORE INTO episode_to_character
      BY POSITION (episode_id, character_id) VALUES (?,?)`
    );
    for (let e of episodes) {
      for (let c of e.characters) {
        const cID = parseInt(c.slice(42), 10);
        stmt.run(e.id, cID);
      }
    }
    stmt.finalize();
    await conn.close();
  };
  let endpoint = "https://rickandmortyapi.com/api/episode";
  await doInsert(db, endpoint, insertChunk);
  logger.info("Complete load of episodes from API into DB");
};

const insertCharacters = async (db, logger) => {
  // insert characters
  // As new episodes are released, we expect that certain details about
  // characters will change. Therefore we do an entire replace. For efficiency,
  // we might have to upsert, however, new seasons come after a couple of years
  // and episodes are released weekly, therefore no need to optimize
  const insertChunk = async (characters) => {
    const conn = await db.connect();
    let stmt = await conn.prepare(
      `INSERT OR REPLACE INTO character
    BY POSITION (id, name, status, species, type, gender, origin_location,
      last_known_location, created_at)
    VALUES (?,?,?,?,?,?,?,?,?)`
    );
    for (let c of characters) {
      let origin_location = null;
      if (c.origin.url !== "") {
        origin_location = parseInt(c.origin.url.slice(41), 10);
      }
      let last_known_location = null;
      if (c.location.url !== "") {
        last_known_location = parseInt(c.location.url.slice(41), 10);
      }

      stmt.run(
        c.id,
        c.name,
        c.status,
        c.species,
        c.type,
        c.gender,
        origin_location,
        last_known_location,
        c.created
      );
    }
    stmt.finalize();
    await conn.close();
  };

  let endpoint = "https://rickandmortyapi.com/api/character";
  await doInsert(db, endpoint, insertChunk);
  logger.info("Complete load of characters into DB");
};

const doInsert = async (db, endpoint, insertChunk) => {
  while (true) {
    let resp = await ky.get(endpoint).json();
    await insertChunk(resp.results);
    endpoint = resp.info.next;
    if (endpoint === null || endpoint === undefined) break;
  }
};

export const getDB = async ({ dbPath, skipDbChecks, logger: log }) => {
  if (!log) {
    log = pino(fs.createWriteStream("/dev/null"));
  }
  // setup create db instance
  const db = await Database.create(dbPath);
  log.info("Create DB instance");

  if (skipDbChecks) {
    log.info("Skip DB checks");
    return db;
  }
  const conn = await db.connect();

  // set up schema
  await conn.run(schemaSQL);
  log.info("Setup DB schema");

  // get number of episodes
  const [{ count }] = await conn.all(
    "select count(*)::float as count from episode"
  );

  let expectedCount = 51;
  try {
    let { info } = await ky
      .get("https://rickandmortyapi.com/api/episode")
      .json();
    expectedCount = info.count; // up to date count
    log.info(`Retrieve expected count of episodes from API: ${expectedCount}`);
  } catch (_) {
    log.info("Use stale count of episodes to check if data up to date");
  }

  if (count === expectedCount) {
    log.info("Data in DB is up to date");
    conn.close();
    return db;
  } else {
    log.info(`Expect count of ${expectedCount} episodes, got ${count} in DB`);
  }
  log.info("Retrieve latest data from Rick and Morty API");

  // insert data
  let l = insertLocations(db, log);
  let e = insertEpisodes(db, log);
  let c = insertCharacters(db, log);

  await e;
  await l;
  await c;

  // after doing all the insertions, we can now create the full text search
  // indexes
  await conn.run(`
  PRAGMA create_fts_index(location, id, name, overwrite=true);
  PRAGMA create_fts_index(character, id, name, overwrite=true);
  PRAGMA create_fts_index(episode, id, name, overwrite=true);
  `);
  log.info("Create Full-text search indexes");

  return db;
};
