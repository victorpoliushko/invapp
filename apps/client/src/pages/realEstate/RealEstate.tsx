import RealEstateAsset from "./components/RealEstateAsset";

const realEstateMocks = [
  {
    id: 1,
    title: "One bedroom flat, Lviv, Dodik str.",
    imageSrc: "../src/assets/house1.jpeg",
    info: "New house with some stuff",
    price: "$65000"
  },
  {
    id: 2,
    title: "Two bedroom flat, Kyiv, Bobik str.",
    imageSrc: "../src/assets/house2.jpg",
    info: "N=Used house with some stuf",
    price: "$95000"
  },
  {
    id: 3,
    title: "Three bedroom flat, Rivne, Boobik str.",
    imageSrc: "../src/assets/house3.jpeg",
    info: "New house with some stuff",
    price: "$235000"
  },
  {
    id: 4,
    title: "No bedroom house, Odesa, Valik str.",
    imageSrc: "./src/assets/house1.jpeg",
    info: "No stuff, just walls",
    price: "$15000"
  },
  {
    id: 5,
    title: "No bedroom house, Odesa, Valik str.",
    info: "No stuff, just walls",
    price: "$15000"
  },
  {
    id: 6,
    title: "No bedroom house, Odesa, Valik str.",
    info: "No stuff, just walls",
    price: "$13000"
  }
];

export default function RealEstate() {
  const realEstates = realEstateMocks.map(rem => (<RealEstateAsset key={rem.id} {...rem} />))

  return (
    <div className="real-estate">
      {realEstates}
    </div>
  );
}
