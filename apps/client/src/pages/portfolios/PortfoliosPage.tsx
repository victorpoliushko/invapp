import { Link } from "react-router-dom";

export default function PortfoliosPage() {
  const portfolios = [1, 2, 3, 4, 5]

  return (
    <div className='portfolio'>
      {portfolios.map(p => (
        <Link key={p} to={`/portfolios/${p}`}>
          Portfolio {p}
        </Link>
      ))}
    </div>
  );
}
