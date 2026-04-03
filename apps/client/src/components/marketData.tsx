import React, { useEffect, useRef } from "react";

export default function MarketTicker() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = container.current;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-tickers.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        { "proName": "FOREXCOM:SPX500", "title": "S&P 500" },
        { "proName": "FOREXCOM:DJI", "title": "Dow 30" },
        { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" }
      ],
      // "colorTheme": "dark",
      "isTransparent": true,
      "showSymbolLogo": true,
      "locale": "en",
      // "width": "100%",
      // "height": "100%"
    });
    container.current?.appendChild(script);

    return () => {
    if (currentContainer) {
      currentContainer.innerHTML = "";
    }
  };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
