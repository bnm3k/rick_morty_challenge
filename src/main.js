import { getDB } from "./db.js";
const main = async () => {
  // config
  const config = {
    skipDBChecks: true, // before skipping, check that file is present
    dbPath: "app.db",
  };
  const db = await getDB(config);
  let locs = await getAllLocationsPlusResidents(db);
  console.log(locs.length);
  locs = await getAllLocationsPlusResidents(db);
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
              list({'id': c.id, 'name': c.name, 'status': c.status}) as residents
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
