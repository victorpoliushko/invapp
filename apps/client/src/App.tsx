import { useEffect, useState } from "react";
import "./App.css";
import { Header } from "./components/header/header";

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
        </body>
      </div>
    </>
  );
}

export default App;
