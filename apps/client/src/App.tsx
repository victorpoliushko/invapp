import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Header } from "./Header";
import "./App.css"

function App() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetch("/api")
      .then((res) => res.text())
      .then(setGreeting);
  }, []);



  return (
    <body>
      <Header />
      <div className="container">
        <p className="welcome">Welcome to</p>
        <p className="app-name">Invapp</p>
      </div>
      {/* <h1>{greeting}</h1> */}
    </body>
  );
}

export default App;
