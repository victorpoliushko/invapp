import { PortfolioProvider} from "../../context/PortfolioContext";
import { PortfolioContent } from "../../components/portfolio/PortfolioContent";
import "./PortfolioPage.css";

export default function NewPortfolioPage() {
  return (
    <PortfolioProvider>
      <PortfolioContent />
    </PortfolioProvider>
  );
}
