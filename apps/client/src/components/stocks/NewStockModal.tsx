import { NewPositionModal } from "../portfolio/NewPositionModal";

export function NewStockModal({ onClose }: { onClose: () => void }) {
  return <NewPositionModal assetType="stock" onClose={onClose} />;
}
