import { PortfolioDto } from "../../types/portfolio";
import { useIsPhone } from "../../hooks/useIsPhone";
import { PositionCards } from "../portfolio/PositionCards";
import { PositionTable } from "../portfolio/PositionTable";
import { DigitalCashCard } from "../cash/DigitalCashCard";

export function CryptoPositions({ portfolio }: { portfolio: PortfolioDto }) {
  const isPhone = useIsPhone();
  return (
    <div className="positions-with-cash">
      <DigitalCashCard category="CRYPTO" />
      {isPhone
        ? <PositionCards portfolio={portfolio} assetType="crypto" />
        : <PositionTable portfolio={portfolio} assetType="crypto" />}
    </div>
  );
}
