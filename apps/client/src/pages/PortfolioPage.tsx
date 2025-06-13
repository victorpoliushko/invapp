import { useParams } from "react-router-dom"

export default function PortfolioPage() {
  const params = useParams<{ portfolioId: string }>();
  return (
    <div className="">Portfolio page {params.portfolioId}</div>
  )
}
