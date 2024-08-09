import swagger from "@fastify/swagger";
import docsUI from "@scalar/fastify-api-reference";

import version from "./version.js";

export async function setupAPIDocs(app) {
  const { host, port } = app.config;
  const address = `http://${host}:${port}`;
  const title = "Rick & Morty API Reference";
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: title,
        description:
          "API for searching locations in the Rick and Morty show and adding notes",
        version: version,
      },
      servers: [
        {
          url: address,
          description: "API server",
        },
      ],
      components: {
        securitySchemes: null, // no security
      },
    },
  });

  await app.register(docsUI, {
    routePrefix: "/docs",
    configuration: {
      hideDownloadButton: false,
      searchHotKey: "/",
      metaData: {
        title: title,
      },
    },
  });
}
