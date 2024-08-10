import { notFound } from "next/navigation";
import SearchResults from "@/app/search_results";
import { rickMortyEndpoint } from "./common";

function Header() {
  return (
    <header>
      <h1>Rick & Morty Search</h1>
      <nav>
        <ul>
          <li>
            <a href="https://github.com/bnm3k/rick_morty_challenge">Code</a> |
          </li>
          <li>
            <a href={`${rickMortyEndpoint}/docs`} target="_blank">
              API Docs
            </a>{" "}
            |
          </li>
        </ul>
      </nav>
      <p>
        Search locations that appear in the show, add notes on your favourite
        characters:
      </p>
    </header>
  );
}

export default async function Page() {
  let locations;
  try {
    const res = await fetch(`${rickMortyEndpoint}/locations`, {
      cache: "no-cache",
    });
    locations = await res.json();
  } catch (err) {
    notFound();
  }

  return (
    <main>
      <Header />
      <hr />
      <SearchResults locations={locations} />
    </main>
  );
}
