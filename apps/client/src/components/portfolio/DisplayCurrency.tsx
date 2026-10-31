import { createContext, useContext } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { formatCurrency, signedCurrency } from "../../utils/money";

const DisplayCurrencyContext = createContext("USD");

export const DisplayCurrencyProvider = DisplayCurrencyContext.Provider;

export function useDisplayMoney() {
  const currency = useContext(DisplayCurrencyContext);
  const { convert } = useCurrency();
  const toDisplay = (amount: number, from = "USD") => convert(amount, from, currency);

  return {
    currency,
    money: (amount: number, from = "USD", digits = 0) => formatCurrency(toDisplay(amount, from), currency, digits),
    signedMoney: (amount: number, from = "USD", digits = 0) => signedCurrency(toDisplay(amount, from), currency, digits),
  };
}
