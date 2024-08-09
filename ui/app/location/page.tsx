import Image from "next/image";
import testData from "./test_data";

function Character({ id, name, status, image }) {
  const size = 190;
  return (
    <a href={`/character/${id}`}>
      <div className="column">
        <Image
          src={image}
          width={size}
          height={size}
          alt={`Picture of the character ${name} from the show Rick & Morty`}
        />
        <p>
          {name} ({status})
        </p>
      </div>
    </a>
  );
}

function Row({ characters }) {
  return (
    <>
      <div className="row">
        {characters.map(({ id, name, status, image }) => {
          return (
            <Character
              key={id}
              id={id}
              name={name}
              status={status}
              image={image}
            />
          );
        })}
      </div>
      <br />
      <br />
    </>
  );
}

function Residents({ residents }) {
  const maxPerRow = 3;
  const rows = [];
  for (let i = 0; i < residents.length; i += maxPerRow) {
    rows.push(residents.slice(i, i + maxPerRow));
  }
  return (
    <section>
      <h2>Residents:</h2>
      {rows.map((cs) => {
        return <Row characters={cs} />;
      })}
    </section>
  );
}

function Header({ name, locationType }) {
  return (
    <header>
      <h1>Location: {name}</h1>
      <h2>Type: {locationType}</h2>
    </header>
  );
}

export default async function Page() {
  const locationID = 20;
  const data = await fetch(`http://localhost:3001/location/${locationID}`).then(
    (res) => res.json()
  );
  const { id, name, type, residents } = data;

  return (
    <main>
      <Header name={name} locationType={type} />
      <hr />
      <Residents residents={residents} />
    </main>
  );
}
