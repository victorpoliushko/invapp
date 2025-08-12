import "../App.css";

export const HomePage = () => {
  return (
    <>
      <section className="section-container section-flex-container intro-section-1">
        <h1 className="intro-section-1-h1">
          Application to track your investments from multiple sources
        </h1>
        <p className="intro-section-1-p">
          Application to track your investments from multiple sources. Stay in
          control with a single dashboard that consolidates all your assets —
          from stocks and crypto to real estate. The app is designed to be
          simple yet powerful, offering AI-powered suggestions, curated
          portfolios you can follow, and return predictions to help you make
          informed financial decisions with confidence.
        </p>
      </section>
      <section className="section-container section-flex-container try-section-1">
        <button className="try-section-1-btn">Give it a try. It's free!</button>
        <img
          src="/invapp-placeholder.png"
          height={500}
          width={800}
          alt="placeholder"
        />
      </section>
      <section className="section-container section-flex-container pros-section-1">
        <h1 className="pros-section-1-h1">A single tool to track your gains</h1>
        <div className="pros-section-cols">
          <div className="pros-section-div">
            <h3>Easy to use</h3>
            <p>
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
              ipsum Lorem ipsum{" "}
            </p>
          </div>
          <div className="pros-section-div">
            <h3>Easy to use</h3>
            <p>
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
              ipsum Lorem ipsum{" "}
            </p>
          </div>
          <div className="pros-section-div">
            <h3>Easy to use</h3>
            <p>
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
              ipsum Lorem ipsum{" "}
            </p>
          </div>
        </div>
      </section>
      <section className="section-container section-flex-container advanced-section">
        <h1>Advanced techniques</h1>
        <div className="top-advanced">A</div>
        <div className="botton-advanced">
          <div className="botton-left">B</div>
          <div className="botton-right">C</div>
        </div>
      </section>
    </>
  );
};
