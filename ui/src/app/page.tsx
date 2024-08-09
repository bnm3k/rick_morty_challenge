import Image from "next/image";
import styles from "./page.module.css";

function Hello({ name }) {
  return <p>Hello {name || "World"}</p>;
}

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

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <hr />
    </main>
  );
}
