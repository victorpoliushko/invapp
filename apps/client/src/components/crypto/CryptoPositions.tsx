import { PortfolioDto } from "../../types/portfolio";
import { useIsPhone } from "../../hooks/useIsPhone";
import { PositionCards } from "../portfolio/PositionCards";
import { PositionTable } from "../portfolio/PositionTable";

export function CryptoPositions({ portfolio }: { portfolio: PortfolioDto }) {
  const isPhone = useIsPhone();
  return isPhone
    ? <PositionCards portfolio={portfolio} assetType="crypto" />
    : <PositionTable portfolio={portfolio} assetType="crypto" />;
}
