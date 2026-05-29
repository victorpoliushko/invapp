import React, { useEffect, useState } from "react";

export function LocationPicker() {
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    const countriesP = fetch("https://countriesnow.space/api/v0.1/countries")
      .then((r) => r.json())
      .then((data) =>
        (data.data as { country: string }[])
          .map((c) => c.country)
          .sort() as string[],
      );

    const ipP = fetch("/api/geo/location")
      .then((r) => r.json())
      .catch(() => null);

    Promise.all([countriesP, ipP]).then(([countryList, ip]) => {
      setCountries(countryList);
      if (ip?.country_name) {
        const match = countryList.find(
          (c) => c.toLowerCase() === ip.country_name.toLowerCase(),
        );
        if (match) setCountry(match);
      }
      if (ip?.city) setCity(ip.city);
      setDetecting(false);
    });
  }, []);

  useEffect(() => {
    if (!country) return;
    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
    })
      .then((r) => r.json())
      .then((data) => setCities((data.data as string[]) ?? []));
  }, [country]);

  const selectStyle: React.CSSProperties = {
    padding: "6px 8px",
    border: "1px solid #444",
    borderRadius: 4,
    backgroundColor: "#2b2b2b",
    color: "white",
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <select
        value={country}
        disabled={detecting}
        onChange={(e) => {
          setCountry(e.target.value);
          setCity("");
        }}
        style={selectStyle}
      >
        <option value="">{detecting ? "Detecting…" : "Country"}</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={city}
        disabled={!cities.length}
        onChange={(e) => setCity(e.target.value)}
        style={selectStyle}
      >
        <option value="">{cities.length ? "City" : "—"}</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
