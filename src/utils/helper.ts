


export const formatCurrency = (value: number, currency: string) => {
    if (!currency || currency === "No currency" || currency === "N/A") {
      return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value || 0);
    }
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
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