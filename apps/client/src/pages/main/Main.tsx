import "../../App.css";

export const MainPage = () => {
  return (
    <>
      <section className="section-container section-flex-container news-section">
        <div className="news-div">
          <div className="news-item"> Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
              ipsum Lorem ipsum</div>
          <div className="news-item"> Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem
              ipsum Lorem ipsum</div>
        </div>
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
      <section className="section-container advanced-section">
        <h1>Advanced techniques</h1>
        <div className="advanced-level-1">
          <h1>Some real info</h1>
          <p>
            A lot of good stuff we were working on for years A lot of good stuff
            we were working on for years A lot of good stuff we were working on
            for years A lot of good stuff we were working on for years A lot of
            good stuff we were working on for years
          </p>
        </div>
        <div className="advanced-level-2">
          <div className="advanced-level-2-left">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
          <div className="advanced-level-2-right">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
        </div>
        <div className="advanced-level-3">
          <div className="advanced-level-3-left">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
          <div className="advanced-level-3-center">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
          <div className="advanced-level-3-right">
            <h1>Some real info</h1>
            <p>
              A lot of good stuff we were working on for years A lot of good
              stuff we were working on for years A lot of good stuff we were
              working on for years A lot of good stuff we were working on for
              years A lot of good stuff we were working on for years
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
