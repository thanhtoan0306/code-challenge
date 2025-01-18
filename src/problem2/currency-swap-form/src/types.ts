// src/types.ts
export interface TokenPrice {
  currency: string;
  price: number;
}

export interface FormData {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}
