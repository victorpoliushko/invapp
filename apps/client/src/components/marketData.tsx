import React, { useEffect, useRef } from "react";

export default function MarketTicker() {
  const container = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !container.current) return;
    initialized.current = true;

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
      "isTransparent": true,
      "showSymbolLogo": true,
      "locale": "en",
    });
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}
