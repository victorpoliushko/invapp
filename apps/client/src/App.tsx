import "./App.css";
import { Header } from "./pages/header/header";
import RealEstate from "./pages/realEstate/RealEstate";
import { Stocks } from "./pages/stocks/Stocks";
import { News } from "./pages/news/News";

function App() {
  const handeGoogleLogin = () => {
    window.location.href = "http://localhost:5173/api/auth-v2/google/login";
  };

  return (
    <>
      <div className="">
        <button onClick={handeGoogleLogin}>Login with Google</button>
      </div>
      <Header />
      <div className="container">
        <News />
        <Stocks />
        <div className="real-estate">
          <RealEstate
            title="One bedroom flat, Lviv, Dodik str."
            imageSrc="../src/assets/house1.jpeg"
            info="New house with some stuff"
            price="$65000"
          />
          <RealEstate
            title="Two bedroom flat, Kyiv, Bobik str."
            imageSrc="../src/assets/house2.jpg"
            info="Used house with some stuf"
            price="$95000"
          />
          <RealEstate
            title="Three bedroom flat, Rivne, Boobik str."
            imageSrc="../src/assets/house3.jpeg"
            info="New house with some stuff"
            price=">$235000"
          />
          <RealEstate
            title="No bedroom house, Odesa, Valik str."
            imageSrc="../src/assets/house1.jpeg"
            info="No stuff, just walls"
            price="$15000"
          />
          <RealEstate
            title="No bedroom house, Odesa, Valik str."
            info="No stuff, just walls"
            price="$15000"
          />
          <RealEstate
            title="No bedroom house, Odesa, Valik str."
            info="No stuff, just walls"
            price="$15000"
          />
        </div>
      </div>
    </>
  );
}

export default App;
