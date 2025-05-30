import "./RealEstate.css";
import genericHouse from "../../assets/house-placeholder.jpg"

const realEstateMocks = [
  {
    title: "One bedroom flat, Lviv, Dodik str.",
    imageSrc: "../src/assets/house1.jpeg",
    info: "New house with some stuff",
    price: "$65000"
  },
  {
    title: "Two bedroom flat, Kyiv, Bobik str.",
    imageSrc: "../src/assets/house2.jpg",
    info: "N=Used house with some stuf",
    price: "$95000"
  },
  {
    title: "Three bedroom flat, Rivne, Boobik str.",
    imageSrc: "../src/assets/house3.jpeg",
    info: "New house with some stuff",
    price: "$235000"
  },
  {
    title: "No bedroom house, Odesa, Valik str.",
    imageSrc: "./src/assets/house1.jpeg",
    info: "No stuff, just walls",
    price: "$15000"
  },
    {
    title: "No bedroom house, Odesa, Valik str.",
    info: "No stuff, just walls",
    price: "$15000"
  },
    {
    title: "No bedroom house, Odesa, Valik str.",
    imageSrc: "./src/assets/house1.jpeg",
    price: "$15000"
  }
]

export default function RealEstate({ title, imageSrc, info, price }: {
  title: string;
  imageSrc?: string;
  info: string;
  price: string;
}) {
  return (
    <article className="real-estate-card">
      <img src={imageSrc ?? genericHouse} alt="house" />
      <h3>{title}</h3>
      <div className="info-group">
        <p>{info}</p>
        <p>{price}</p>
      </div>
    </article>
  );
}
