import Image from "next/image";
import Character from "@/app/character";

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

function Row() {
  return (
    <>
      <div className="row">
        <Character />
        <Character />
        <Character />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <main>
      <Header />
      <hr />
      <hr />
      <section>
        <h2>Locations</h2>
        <Row />
        <br />
        <br />
        <Row />
        <br />
        <br />
        <Row />
      </section>
    </main>
  );
}
