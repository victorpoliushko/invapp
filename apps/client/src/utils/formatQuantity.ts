// Stocks trade in whole-ish shares (0.1 precision is plenty); crypto needs
// finer precision since fractional holdings are common down to sub-cent
// amounts of a coin.
export function formatQuantity(quantity: number, assetType: "stock" | "crypto"): string {
  return quantity.toFixed(assetType === "crypto" ? 4 : 1);
}
