import { createContext, useContext, useState, ReactNode } from "react";

export type CurrencyCode = "MAD" | "EUR";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  /** Convert an EUR base price to the active currency and format it. */
  format: (eurAmount: number) => string;
  symbol: string;
  /** Approx EUR→MAD rate (manual). */
  rate: number;
}

const RATE_EUR_TO_MAD = 11; // approx, easy to update later

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>("MAD");

  const setCurrency = (_c: CurrencyCode) => {
    // Currency toggle removed — MAD only.
    setCurrencyState("MAD");
  };

  const format = (eurAmount: number) => {
    const mad = Math.round(eurAmount * RATE_EUR_TO_MAD);
    return `${mad.toLocaleString("fr-FR")} DH`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, format, symbol: currency === "MAD" ? "DH" : "€", rate: RATE_EUR_TO_MAD }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
};
