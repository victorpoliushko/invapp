import { useEffect, useState } from "react";
import { Header } from "../Header";
import "./App.css";
import { Navbar } from "../components/navbar/Navbar";
import { Main } from "../components/main/Main";

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
          <Navbar />
          <Main />
        </body>
      </div>
    </>
  );
}

export default App;
