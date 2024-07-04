import handler from "./handlers.js";

const routes = async (app, options) => {
  app.get("/", async (request, reply) => {
    return { foo: "bar" };
  });

  app.get("/character/:characterID", async (request, reply) => {
    const { characterID } = request.params;
    const [result] = await handler.getCharacter(app.db, characterID);
    if (result) {
      return result;
    }
    return null;
  });

  app.get("/location/:locationID", async (request, reply) => {
    const { locationID } = request.params;
    const [result] = await handler.getLocation(app.db, locationID);
    if (result) {
      return result;
    }
    return null;
  });

  app.get("/locations", async (request, reply) => {
    // retrieves a list locations (name and type), plus residents of that
    // location and their status
    //
    // optionally, one can pass a query parameter to filter locations by name,
    // episode or character
    //
    // To filter by location name, use the query parameter `name`
    // To filter by episode name, use the query parameter `episode`
    // To filter by character name, use the query parameter `character`
    //
    // Supports only one query parameter at a go: If multiple are provided,
    // name takes precedence, then character, then episode. If a parameter
    // other than any of these is provided, then it's ignored and all locations
    // are returned
    const { name, character, episode } = request.query;
    let result;
    if (name) {
      result = await handler.searchLocationsByName(app.db, name);
    } else if (character) {
      result = await handler.searchLocationsByResidentCharacters(
        app.db,
        character
      );
    } else if (episode) {
      result = await handler.searchLocationsByEpisodeName(app.db, episode);
    } else {
      result = await handler.getAllLocationsPlusResidents(app.db);
    }
    return result;
  });
};

export default routes;
