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

function Character() {
  const data = {
    id: 1,
    name: "Rick Sanchez",
    status: "Alive",
    image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  };
  const { id, name, status, image } = data;
  return (
    <a href="google.com">
      <div className="column">
        <Image
          src={image}
          width={500}
          height={500}
          alt={`Picture of the character ${name} from the show Rick & Morty`}
        />
        <p>
          {name} ({status})
        </p>
      </div>
    </a>
  );
}

export default function Home() {
  return (
    <main className={styles.main}>
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
