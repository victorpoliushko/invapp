import { NewPositionModal } from "../portfolio/NewPositionModal";

export function NewCryptoModal({ onClose }: { onClose: () => void }) {
  return <NewPositionModal assetType="crypto" onClose={onClose} />;
}
