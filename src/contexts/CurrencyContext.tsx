import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("currency")) as CurrencyCode | null;
    if (stored === "MAD" || stored === "EUR") setCurrencyState(stored);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try { localStorage.setItem("currency", c); } catch {}
  };

  const format = (eurAmount: number) => {
    if (currency === "MAD") {
      const mad = Math.round(eurAmount * RATE_EUR_TO_MAD);
      return `${mad.toLocaleString("fr-FR")} DH`;
    }
    return `${eurAmount.toLocaleString("fr-FR")} €`;
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
