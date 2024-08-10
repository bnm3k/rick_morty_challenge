"use client";

import Link from "next/link";
import { useState } from "react";
import { rickMortyEndpoint } from "@/app/common";

function LocationList({ results }) {
  const { locations, resultType } = results;
  return (
    <section>
      <h2>Locations ({resultType}) 📍:</h2>
      {locations.map((l) => {
        return (
          <Link href={`/location/${l.location_id}`} key={l.location_id}>
            <p>
              {l.location_name} {l.location_type && `(${l.location_type})`}
            </p>
          </Link>
        );
      })}
    </section>
  );
}

function SearchBox({ setResults, allLocations }) {
  function handleReset(e) {
    e.preventDefault();
    setResults({ resultType: "all", locations: allLocations });
  }
  function handleSearch(formData: FormData) {
    const query = formData.get("query");
    const searchBy = formData.get("filter");
    setResults({
      resultType: searchBy,
      locations: [],
    });
  }

  return (
    <section>
      <h2>Search 🔍:</h2>
      <form action={handleSearch}>
        <fieldset>
          <legend>...</legend>
          <div className="row">
            <div className="column">
              <label htmlFor="query">Term</label>
              <input type="text" name="query" id="query" />
            </div>
            <div className="column">
              <label htmlFor="filter">Filter by</label>
              <select name="filter" id="filter">
                <option value="location">Location Name</option>
                <option value="episode">Episode Name</option>
                <option value="character">Character</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="column">
              <input type="submit" value="Submit" />
            </div>
            <div className="column">
              <button onClick={handleReset}>Reset</button>
            </div>
          </div>
        </fieldset>
      </form>
    </section>
  );
}

export default function Results({ locations: allLocations }) {
  const [results, setResults] = useState({
    resultType: "all",
    locations: allLocations,
  });
  return (
    <>
      <SearchBox setResults={setResults} allLocations={allLocations} />
      <LocationList results={results} />
    </>
  );
}
