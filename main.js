import ky from "ky";
import fs from "fs";
import path from "path";

const getDataFromAPI = async () => {
  let endpoint = "https://rickandmortyapi.com/api";
  let charactersReq = ky.get(`${endpoint}/character`);
  let locationsReq = ky.get(`${endpoint}/location`);
  let episodesReq = ky.get(`${endpoint}/episode`);

  return {
    characters: await charactersReq.json(),
    locations: await locationsReq.json(),
    episodes: await episodesReq.json(),
  };
};

const getData = async (dirPath, overwrite) => {
  let keys = ["characters", "locations", "episodes"];
  let paths = keys.map((k) => path.join(dirPath, `${k}.json`));
  let allExist = paths.every((p) => fs.existsSync(p));
  let data = {};
  if (!allExist || overwrite === true) {
    data = await getDataFromAPI();
    // cache to disk
    keys.forEach((k, i) => {
      let content = JSON.stringify(data[k]);
      fs.writeFileSync(paths[i], content);
    });
  } else {
    keys.forEach((k, i) => {
      let content = JSON.parse(fs.readFileSync(paths[i], "utf8"));
      data[k] = content;
    });
  }
  return data;
};

const main = async () => {
  let dirpath = "data";
  let overwrite = false;
  let { characters, locations, episodes } = await getData(dirpath, overwrite);
  console.log(characters.info);
  console.log(locations.info);
  console.log(episodes.info);
};

main();
