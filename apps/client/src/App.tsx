import { useEffect, useState } from "react";
import { Header } from "./Header";
import "./App.css"
import { Navbar } from "./components/Navbar";
import { Main } from "./components/Main";

function App() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetch("/api")
      .then((res) => res.text())
      .then(setGreeting);
  }, []);



  return (
    <body>
      <>
        <Header />
        <Navbar />
        <Main />
        <div className="container">
          <p className="welcome">Welcome to</p>
          <p className="app-name">Invapp</p>
        </div>
        {/* <h1>{greeting}</h1> */}
      </>
    </body>
  );
}

export default App;
