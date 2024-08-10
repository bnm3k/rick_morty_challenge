import { notFound } from "next/navigation";
import SearchResults from "@/app/search_results";

function Header() {
  return (
    <header>
      <h1>Rick & Morty Search</h1>
      <nav>
        <ul>
          <li>Search locations that appear in the show:</li>
          <li>
            <a href="https://github.com/bnm3k/rick_morty_challenge">Code</a> |
          </li>
          <li>
            <a href="localhost:3001/docs">Docs</a> |
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default async function Page() {
  let locations;
  try {
    const res = await fetch(`http://localhost:3001/locations`, {
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
