import { useIsPhone } from "../../hooks/useIsPhone";
import { MixedAssetCards } from "./MixedAssetCards";
import { MixedAssetTable } from "./MixedAssetTable";
import { useMixedAssets } from "./useMixedAssets";

export function MixedAssetPositions() {
  const isPhone = useIsPhone();
  const assets = useMixedAssets();
  return isPhone ? <MixedAssetCards assets={assets} /> : <MixedAssetTable />;
}
