import { PortfolioProvider} from "../../context/PortfolioContext";
import { PortfolioContent } from "../../components/portfolio/PortfolioContent";

export default function NewPortfolioPage() {
  return (
    <PortfolioProvider>
      <PortfolioContent />
    </PortfolioProvider>
  );
}
