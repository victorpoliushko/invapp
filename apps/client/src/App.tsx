import { useEffect, useState } from "react";
import "./App.css";
import { Header } from "./components/header/header";
import { AssetsDashboard } from "./components/assetsDashboard/AssettsDashboard";

function App() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetch("/api")
      .then((res) => res.text())
      .then(setGreeting);
  }, []);

  return (
    <>
      <div className="container">
        <body>
          <Header />
          <AssetsDashboard />
        </body>
      </div>
    </>
  );
}

export default App;
