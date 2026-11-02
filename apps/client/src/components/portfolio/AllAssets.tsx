import { ReactNode } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { useCurrency } from "../../context/CurrencyContext";
import { PortfolioDto, PositionDto } from "../../types/portfolio";
import { useBonds } from "../bonds/useBonds";
import { useRealEstate } from "../real-estate/useRealEstate";
import { useMixedAssets } from "../mixed-assets/useMixedAssets";
import { useCash } from "../cash/useCash";
import { BondCards } from "../bonds/BondCards";
import { RealEstateCards } from "../real-estate/RealEstateCards";
import { MixedAssetCards } from "../mixed-assets/MixedAssetCards";
import { CashPositions } from "../cash/CashPositions";
import { DigitalCashCard } from "../cash/DigitalCashCard";
import { PositionCards } from "./PositionCards";
import { useDisplayMoney } from "./DisplayCurrency";

type Holding = { key: string; amount: number; currency: string; card: ReactNode };

export function AllAssets({ portfolio }: { portfolio: PortfolioDto }) {
  const { currentPrices } = usePortfolio();
  const { convert } = useCurrency();
  const { currency } = useDisplayMoney();
  const { bonds } = useBonds();
  const { properties } = useRealEstate();
  const others = useMixedAssets();
  const cash = useCash();

  const positionValue = (p: PositionDto) => {
    const live = currentPrices[p.assetId];
    return (live && live > 0 ? live : p.price ?? 0) * p.quantity;
  };

  const holdings: Holding[] = [
    ...portfolio.stockPositions.map((p) => ({
      key: `s-${p.assetId}`, amount: positionValue(p), currency: "USD",
      card: <PositionCards portfolio={portfolio} assetType="stock" ids={[p.assetId]} embedded />,
    })),
    ...portfolio.cryptoPositions.map((p) => ({
      key: `c-${p.assetId}`, amount: positionValue(p), currency: "USD",
      card: <PositionCards portfolio={portfolio} assetType="crypto" ids={[p.assetId]} embedded />,
    })),
    ...bonds.map((b) => ({
      key: `b-${b.id}`, amount: (b.currentValue ?? b.purchasePrice) * b.quantity, currency: b.currency,
      card: <BondCards bonds={[b]} embedded />,
    })),
    ...properties.map((r) => ({
      key: `r-${r.id}`, amount: r.currentValue ?? r.purchasePrice, currency: "USD",
      card: <RealEstateCards properties={[r]} embedded />,
    })),
    ...others.map((o) => ({
      key: `o-${o.id}`, amount: (o.currentValue ?? o.purchasePrice) * o.quantity, currency: "USD",
      card: <MixedAssetCards assets={[o]} embedded />,
    })),
    ...cash.map((c) => ({
      key: `cash-${c.id}`, amount: c.amount, currency: c.currency,
      card:
        c.category === "STOCK" || c.category === "CRYPTO"
          ? <DigitalCashCard category={c.category} ids={[c.id]} />
          : <CashPositions displayCurrency={currency} ids={[c.id]} embedded />,
    })),
  ];

  const sorted = holdings.sort(
    (a, b) => convert(b.amount, b.currency, currency) - convert(a.amount, a.currency, currency),
  );

  if (sorted.length === 0) {
    return <p className="position-cards-empty">There are no assets yet — add one with New Asset.</p>;
  }

  return (
    <div className="all-assets-cards">
      {sorted.map((h) => (
        <div key={h.key}>{h.card}</div>
      ))}
    </div>
  );
}
