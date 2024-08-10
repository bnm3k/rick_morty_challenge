import Image from "next/image";
import { notFound } from "next/navigation";
import Nav from "@/app/nav";

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
  const deriveKey = (cs) => cs.map((c) => c.id).join("");
  return (
    <section>
      <h2>Residents:</h2>
      {rows.map((cs) => {
        return <Row key={deriveKey(cs)} characters={cs} />;
      })}
    </section>
  );
}

function Header({ name, locationType }) {
  return (
    <header>
      <Nav />
      <h1>Location: {name}</h1>
      {locationType && <h2>Type: {locationType}</h2>}
    </header>
  );
}

export default async function Page({ params }: { params: { id: Number } }) {
  const { id } = params;
  let data;
  try {
    const res = await fetch(`http://localhost:3001/location/${id}`);
    data = await res.json();
  } catch (err) {
    notFound();
  }
  const { name, type, residents } = data;

  return (
    <main>
      <Header name={name} locationType={type} />
      <hr />
      <Residents residents={residents} />
    </main>
  );
}
