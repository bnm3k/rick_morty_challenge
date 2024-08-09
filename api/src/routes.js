import handle from "./controllers.js";

const routes = async (app, options) => {
  app.route({
    url: "/",
    method: ["GET"],
    schema: { hide: true }, // do not display route on openAPI docs
    handler: async (request, reply) => {
      reply.redirect("/docs", 303);
    },
  });

  app.route({
    url: "/character/:characterID",
    method: ["GET"],
    schema: {
      summary: "Get character",
      description: "",
      response: {
        200: {
          description: "Character information",
          type: "object",
          nullable: true,
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the character",
              example: 1,
            },
            name: {
              type: "string",
              description: "Name of the character",
              example: "Rick Sanchez",
            },
            status: {
              type: "string",
              description:
                "Current status of the character in the show (Alive, Dead, Unknown)",
              example: "Alive",
            },
            image: {
              type: "string",
              format: "uri",
              description: "URL to the character's image",
              example:
                "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
            },
            notes: {
              type: "string",
              description:
                "Additional notes about the character added by a user",
              example: "Rick Sanchez is from dimension C-137",
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { characterID } = request.params;
      const [result] = await handle.getCharacter(app.db, characterID);
      if (result) {
        return result;
      }
      return null;
    },
  });

  app.route({
    url: "/character/:characterID/note",
    method: ["POST"],
    schema: {
      summary: "Add note for character",
      description: "",
      body: {
        type: "object",
        required: ["id", "notes"],
        properties: {
          id: {
            type: "integer",
            description: "Unique identifier for the character",
          },
          notes: {
            type: "string",
            description: "User provided notes on the character",
          },
        },
      },
      response: {
        204: {
          description: "Notes has been persisted successfully",
          type: "null",
        },
      },
    },
    handler: async (request, reply) => {
      const validate = request.compileValidationSchema({
        type: "object",
        required: ["id", "notes"],
        properties: {
          id: { type: "integer" },
          notes: { type: "string" },
        },
      });
      if (validate(request.body) === true) {
        const { id, notes } = request.body;
        await handle.insertNotesOnCharacter(app.db, id, notes);
        reply.code(204).send();
      } else {
        return validate.errors;
      }
    },
  });

  app.route({
    url: "/location/:locationID",
    method: ["GET"],
    schema: {
      summary: "Get location and its residents",
      description: "",
      response: {
        200: {
          description: "Details of the specified location",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    description: "Unique identifier for the location",
                    example: 3,
                  },
                  name: {
                    type: "string",
                    description: "Name of the location",
                    example: "Citadel of Ricks",
                  },
                  type: {
                    type: "string",
                    description: "Type of the location",
                    example: "Space station",
                  },
                  residents: {
                    type: "array",
                    description: "List of characters residing in the location",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          description: "Unique identifier for the resident",
                          example: 1,
                        },
                        name: {
                          type: "string",
                          description: "Name of the resident",
                          example: "Rick Sanchez",
                        },
                        status: {
                          type: "string",
                          description: "Current status of the resident",
                          example: "Alive",
                        },
                        image: {
                          type: "string",
                          format: "uri",
                          description: "URL to the resident's image",
                          example:
                            "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { locationID } = request.params;
      const [result] = await handle.getLocation(app.db, locationID);
      if (result) {
        console.log("NO WAY");
        return result;
      }
      console.log("BOZO alert");
      reply.code(404).send();
    },
  });

  app.route({
    url: "/locations",
    method: ["GET"],
    schema: {
      summary: "List/Search all locations",
      description: `
Retrieves a list locations (name and type), plus residents of that
location and their status. Optionally, one can pass a query parameter to search
and filter locations by name, episode or character.

- To search by location name, use the query parameter \`name\`
- To search by episode name, use the query parameter \`episode\`
- To search by character name, use the query parameter \`character\`

This endpoint supports only one query parameter at a go: If multiple parameters
are provided, name takes precedence, then character, then episode. If a
parameter other than any of these is provided, then it's ignored and all
locations are returned
`,
      querystring: {
        name: {
          type: "string",
          description: "Search locations by their names",
        },
        episode: {
          type: "string",
          description: "Search locations by the episodes they appear in",
        },
        character: {
          type: "string",
          description: "Search locations by the characters that reside there",
        },
      },
      response: {
        200: {
          description: "A list of locations",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    location_id: {
                      type: "integer",
                      description: "Unique identifier for the location",
                      example: 1,
                    },
                    location_name: {
                      type: "string",
                      description: "Name of the location",
                      example: "Earth (C-137)",
                    },
                    location_type: {
                      type: "string",
                      description: "Type of the location",
                      example: "Planet",
                    },
                    residents: {
                      type: "array",
                      description: "List of residents in the location",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "integer",
                            description: "Unique identifier for the resident",
                            example: 38,
                          },
                          name: {
                            type: "string",
                            description: "Name of the resident",
                            example: "Beth Smith",
                          },
                          status: {
                            type: "string",
                            description: "Current status of the resident",
                            example: "Alive",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { name, character, episode } = request.query;
      let result;
      if (name) {
        result = await handle.searchLocationsByName(app.db, name);
      } else if (character) {
        result = await handle.searchLocationsByResidentCharacters(
          app.db,
          character
        );
      } else if (episode) {
        result = await handle.searchLocationsByEpisodeName(app.db, episode);
      } else {
        result = await handle.getAllLocationsPlusResidents(app.db);
      }
      return result;
    },
  });
};

export default routes;
