export const DepositType = {
    Cash: "cash",
    Cheque: "cheque",
} as const;


export const AccountType = {
    Savings: "savings",
    Current: "current",
    //Current: "current",
} as const;

export const CustomerType = {
    Self: "self",
    ThirdParty: "thirdParty",
} as const;

export const ChequeType = {
    Cheque: "cheque",
    Counter: "counter",
} as const;


export const Currencies = [
    { value: "NGN", label: "NGN" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "Euro" },
    { value: "GBP", label: "Pounds" },
  ];