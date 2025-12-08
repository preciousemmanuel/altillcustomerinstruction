


export const formatCurrency = (value: number, currency: string) => {
  if (!currency || ["No currency", "N/A"].includes(currency)) {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  // Pick the best locale for each currency
  const localeMap: Record<string, string> = {
    NGN: "en-NG",
    USD: "en-US",
    EUR: "de-DE", // or "en-GB" if you prefer €1,234.56
  };

  const locale = localeMap[currency] || "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  };