import Image from "next/image";
import styles from "./page.module.css";

export default function Character() {
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
