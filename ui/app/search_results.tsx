"use client";

import Link from "next/link";
import { useState } from "react";

function LocationList({ locations }) {
  return (
    <section>
      <h2>Locations 📍:</h2>
      {locations.map((l) => {
        return (
          <Link href={`/location/${l.location_id}`} key={l.location_id}>
            <p>
              {l.location_name} ({l.location_type})
            </p>
          </Link>
        );
      })}
    </section>
  );
}

function SearchBox({}) {
  return (
    <section>
      <h2>Search 🔍:</h2>
      <form>
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
              <input type="submit" value="Send" />
            </div>
            <div className="column">
              <button>Reset</button>
            </div>
          </div>
        </fieldset>
      </form>
    </section>
  );
}

export default function Results({ locations }) {
  const [resultType, setResultType] = useState("all");
  return (
    <>
      <SearchBox />
      <LocationList locations={locations} />
    </>
  );
}
