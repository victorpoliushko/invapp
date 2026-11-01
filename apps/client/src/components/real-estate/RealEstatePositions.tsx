import { useIsPhone } from "../../hooks/useIsPhone";
import { RealEstateCards } from "./RealEstateCards";
import { RealEstateTable } from "./RealEstateTable";
import { useRealEstate } from "./useRealEstate";

export function RealEstatePositions() {
  const isPhone = useIsPhone();
  const { properties } = useRealEstate();
  return isPhone ? <RealEstateCards properties={properties} /> : <RealEstateTable />;
}
