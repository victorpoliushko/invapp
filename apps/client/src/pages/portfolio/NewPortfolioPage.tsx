import { PortfolioProvider} from "../../context/PortfolioContext";
import { PortfolioContent } from "../../components/portfolio/PortfolioContent";

export default function PortfolioPage() {
  return (
    <PortfolioProvider>
      <PortfolioContent />
    </PortfolioProvider>
  );
}
