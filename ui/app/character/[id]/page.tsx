import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/app/nav";
import { rickMortyEndpoint } from "@/app/common";
import Notes from "./notes";

function Header({ name }: { name: string }) {
  return (
    <header>
      <Nav />
      <h1>{name}</h1>
    </header>
  );
}

function CharacterImage({ image, name }: { image: string; name: string }) {
  const size = 400;
  return (
    <Image
      src={`${rickMortyEndpoint}/public/images/${image}`}
      width={size}
      height={size}
      alt={`Picture of the character ${name} from the show Rick & Morty`}
    />
  );
}

function CharacterInfo({ info }) {
  return (
    <section>
      <p>Status: {info.status}</p>
      {info.species && <p>Species: {info.species}</p>}
      {info.type && <p>Type: {info.type}</p>}
      <p>Gender: {info.gender}</p>
      <p>
        Location of origin:{" "}
        {info.origin_location_id ? (
          <Link href={`/location/${info.origin_location_id}`}>
            {info.origin_location_name}
          </Link>
        ) : (
          "unknown"
        )}
      </p>
      <p>
        Last seen at:{" "}
        <Link href={`/location/${info.last_known_location_id}`}>
          {info.last_known_location_name}
        </Link>
      </p>
    </section>
  );
}

export default async function Page({ params }: { params: { id: Number } }) {
  const { id } = params;
  let data;
  try {
    const res = await fetch(`${rickMortyEndpoint}/character/${id}`, {
      cache: "no-cache",
    });
    data = await res.json();
  } catch (err) {
    notFound();
  }

  const { name, status, image_filename } = data;

  return (
    <main>
      <Header name={name} />
      <section className="row">
        <div className="column">
          <CharacterImage image={image_filename} name={name} />
        </div>
        <div className="column">
          <CharacterInfo info={data} />
        </div>
      </section>
      <Notes />
    </main>
  );
}
