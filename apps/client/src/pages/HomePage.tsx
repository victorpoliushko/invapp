import "../App.css";

export const HomePage = () => {
  return (
    <>
      <section className="intro-section-1">
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
      <section className="try-section-1">
        <button className="try-section-1-btn">Give it a try. It's free!</button>
        <img src="/invapp-placeholder.png" height={500} width={800} alt="placeholder" />
      </section>
    </>
  );
};
