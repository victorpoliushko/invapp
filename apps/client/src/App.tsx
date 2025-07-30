import "./App.css";
import { Header } from "./components/header/header";
import RealEstate from "./pages/realEstate/RealEstate";
import { News } from "./pages/news/News";
import { AssetsDashboard } from "./pages/assetsDashboard/AssetsDashboard";

function App() {
  return (
    <>
      {/* <Header /> */}
      <div className="container">
        <News />
        <AssetsDashboard />
        <RealEstate />
      </div>
    </>
  );
}

export default App;
