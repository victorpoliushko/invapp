import RealEstateAsset from "./components/realEstateAsset";

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
    info: "No stuff, just walls",
    price: "$13000"
  }
];

export default function RealEstate() {
  const realEstates = realEstateMocks.map(rem => (<RealEstateAsset props={rem} />))

  return (
    <div className="real-estate">
      {realEstates}
    </div>
  );
}
