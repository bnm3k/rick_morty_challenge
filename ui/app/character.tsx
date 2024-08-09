import Image from "next/image";

export default function Character({ id, name, status, image }) {
  const size = 190;
  return (
    <a href="google.com">
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
