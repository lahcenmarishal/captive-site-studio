import { useState, useEffect } from "react";

type Currency = "EUR" | "MAD";

const RATE_EUR_TO_MAD = 10;

interface CurrencyInfo {
  currency: Currency;
  symbol: string;
  convert: (eurPrice: number) => number;
  format: (eurPrice: number) => string;
  isLoading: boolean;
}

export function useCurrency(): CurrencyInfo {
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("visitor_currency");
    if (cached === "MAD" || cached === "EUR") {
      setCurrency(cached);
      setIsLoading(false);
      return;
    }

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const detectedCurrency: Currency = data.country_code === "MA" ? "MAD" : "EUR";
        setCurrency(detectedCurrency);
        sessionStorage.setItem("visitor_currency", detectedCurrency);
      })
      .catch(() => {
        setCurrency("EUR");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const convert = (eurPrice: number) =>
    currency === "MAD" ? Math.round(eurPrice * RATE_EUR_TO_MAD) : eurPrice;

  const symbol = currency === "MAD" ? "MAD" : "€";

  const format = (eurPrice: number) => {
    const converted = convert(eurPrice);
    if (currency === "MAD") {
      return `${converted.toLocaleString("fr-FR")} MAD`;
    }
    return `${converted.toLocaleString("fr-FR")} €`;
  };

  return { currency, symbol, convert, format, isLoading };
}
