import ky from "ky";
import { Database } from "duckdb-async";

const schemaSQL = `
CREATE TABLE IF NOT EXISTS location (
  id INTEGER PRIMARY KEY,
  name STRING,
  type STRING,
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
  image STRING,
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

const insertLocations = async (db) => {
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
  console.log("Complete load of locations");
};

const insertEpisodes = async (db) => {
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
  console.log("Complete load of episodes");
};

const insertCharacters = async (db) => {
  // insert characters
  const insertChunk = async (characters) => {
    const conn = await db.connect();
    let stmt = await conn.prepare(
      `INSERT OR REPLACE INTO character
    BY POSITION (id, name, status, species, type, gender, origin_location,
      last_known_location, image, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`
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
        c.image,
        c.created
      );
    }
    stmt.finalize();
    await conn.close();
  };

  let endpoint = "https://rickandmortyapi.com/api/character";
  await doInsert(db, endpoint, insertChunk);
  console.log("Complete load of characters");
};

const doInsert = async (db, endpoint, insertChunk) => {
  while (true) {
    let resp = await ky.get(endpoint).json();
    await insertChunk(resp.results);
    endpoint = resp.info.next;
    if (endpoint === null || endpoint === undefined) break;
  }
};

export const getDB = async ({ dbPath, skipDBChecks }) => {
  // setup create db instance
  const db = await Database.create(dbPath);

  if (skipDBChecks) {
    return;
  }
  const conn = await db.connect();

  // set up schema
  conn.run(schemaSQL);

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
    console.log(
      `Retrieve expected count of episodes from API: ${expectedCount}`
    );
  } catch (_) {
    console.log("Use stale count of episodes to check if data up to date");
  }

  if (count === expectedCount) {
    console.log("Data is up to date");
    conn.close();
    return;
  } else {
    console.log(
      `Expect count of ${expectedCount} episodes, got ${count} in DB`
    );
  }
  console.log("Retrieve latest data from Rick and Morty API");

  // insert data
  let l = insertLocations(db);
  let e = insertEpisodes(db);
  let c = insertCharacters(db);

  await e;
  await l;
  await c;

  return;
};
