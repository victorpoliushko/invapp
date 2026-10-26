import { useIsPhone } from "../../hooks/useIsPhone";
import { BondCards } from "./BondCards";
import { BondTable } from "./BondTable";
import { useBonds } from "./useBonds";

export function BondPositions() {
  const isPhone = useIsPhone();
  const { bonds, reload } = useBonds();
  return isPhone ? <BondCards bonds={bonds} /> : <BondTable bonds={bonds} onChanged={reload} />;
}
