import { getDB } from "./db.js";
const main = async () => {
  // config
  const config = {
    skipDBChecks: true, // before skipping, check that file is present
    dbPath: "app.db",
  };
  const db = await getDB(config);
  let results = await searchLocationsByResidentCharacters(db, "Evil");
  for (let r of results) {
    console.log(r);
  }
  console.log("--------------");
  results = await searchLocationsByName(db, "Rick");
  for (let r of results) {
    console.log(r);
  }
};
const genSearchResultsSQL = (matchingLocationsSQL) => `
  with matches as (
    ${matchingLocationsSQL}
  ), residents as (
      select
          l.id as location_id,
          list(
            {'id': c.id, 'name': c.name, 'status': c.status, 'image': c.image}
          ) as residents
      from matches l
      join character c on l.id = c.last_known_location
      group by l.id
  )
  select
      l.id as location_id,
      l.name as location_name,
      l.type as location_type,
      case when len(r.residents) >= 1 then [1]
      else [] end as residents
  from matches l
  left join residents r on l.id = r.location_id
  order by l.score desc
`;

const searchLocationsByResidentCharacters = async (db, searchTerm) => {
  const matchingLocationsSQL = `
        select l.id, l.name, l.type, score
        from (
          select
             last_known_location as location_id,
             max(fts_main_character.match_bm25(id, ?)) as score
          from character
          group by location_id
        ) as t
        join location l on t.location_id = l.id
        where score is not null
  `;
  const sql = genSearchResultsSQL(matchingLocationsSQL);
  const rows = await db.all(sql, searchTerm);
  return rows;
};

const searchLocationsByName = async (db, searchTerm) => {
  const matchingLocationsSQL = `
      select
          id, name, type,
          fts_main_location.match_bm25(id, ?) as score,
      from location
      where score is not null
  `;
  const sql = genSearchResultsSQL(matchingLocationsSQL);
  const rows = await db.all(sql, searchTerm);
  return rows;
};

// retrieve a list of locations (name and type), along with residents of that
// location and their status.
// since the result of this call does not change across invocations, we cache
// the output such that future calls don't hit the DB
const getAllLocationsPlusResidents = (() => {
  let result = null;
  return async (db) => {
    if (result === null) {
      const sql = `
      with residents as (
          select
              l.id as location_id,
              list(
                {'id': c.id, 'name': c.name, 'status': c.status, 'image': c.image}
              ) as residents
          from location l
          join character c on l.id = c.last_known_location
          group by l.id
      )
      select
          l.id as location_id,
          l.name as location_name,
          l.type as location_type,
          case when len(r.residents) >= 1 then r.residents
          else [] end as residents
      from location l
      left join residents r on l.id = r.location_id
    `;
      result = await db.all(sql);
    }
    return result;
  };
})();

main();
