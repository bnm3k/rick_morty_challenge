const genSearchFn = (matchingLocationsSQL) => {
  const sql = `
  with matches as (
    ${matchingLocationsSQL}
  ), residents as (
      select
          l.id as location_id,
          list(
            {'id': c.id, 'name': c.name, 'status': c.status}
          ) as residents
      from matches l
      join character c on l.id = c.last_known_location
      group by l.id
  )
  select
      l.id as location_id,
      l.name as location_name,
      l.type as location_type,
      case when len(r.residents) >= 1 then r.residents
      else [] end as residents
  from matches l
  left join residents r on l.id = r.location_id
  order by l.score desc`;

  return async (db, searchTerm) => {
    const rows = await db.all(sql, searchTerm);
    return rows;
  };
};

const searchLocationsByEpisodeName = genSearchFn(`
    select l.id, l.name, l.type, score
    from (
        select
            c.last_known_location as location_id,
            max(fts_main_episode.match_bm25(e.id, ?)) as score
        from episode e
        join episode_to_character ec on e.id = ec.episode_id
        join character c on ec.character_id = c.id
        group by location_id
    ) as t
    join location l on t.location_id = l.id
    where score is not null
  `);

const searchLocationsByResidentCharacters = genSearchFn(
  `
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
  `
);

const searchLocationsByName = genSearchFn(
  `
      select
          id, name, type,
          fts_main_location.match_bm25(id, ?) as score,
      from location
      where score is not null
  `
);

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
                {'id': c.id, 'name': c.name, 'status': c.status}
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

const getLocation = async (db, locationID) => {
  const sql = `
  with residents as (
      select
          l.id as location_id,
          list(
            {'id': c.id, 'name': c.name, 'status': c.status, 'image': c.image}
          ) as residents
      from location l
      join character c on l.id = c.last_known_location
      where l.id = ?
      group by l.id
  )
  select
      l.id, l.name, l.type, r.residents,
  from location l
  join residents r on l.id = r.location_id
    `;
  const result = await db.all(sql, locationID);
  return result;
};

const getCharacter = async (db, characterID) => {
  const sql = `
  select
      id, name, status, image, notes
  from character
  where id = ?;
    `;
  const result = await db.all(sql, characterID);
  return result;
};

export default {
  // get locations (id, name and type), plus residents (id, name, status)
  getAllLocationsPlusResidents,
  searchLocationsByName,
  searchLocationsByEpisodeName,
  searchLocationsByResidentCharacters,

  // get location (id, name and type) plus residents (id, name, status, image)
  getLocation,

  // get resident (id, name, status, image, user note if any)
  getCharacter,

  // insert/update resident note (need id & note)
};
