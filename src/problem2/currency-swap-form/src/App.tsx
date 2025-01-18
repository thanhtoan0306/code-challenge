// src/App.tsx
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { fetchTokenPrices } from "./api";
import { TokenPrice, FormData } from "./types";

const App: React.FC = () => {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  // Fetch token prices on mount
  useEffect(() => {
    const fetchPrices = async () => {
      const prices = await fetchTokenPrices();
      setTokenPrices(prices);
    };
    fetchPrices();
  }, []);

  // Compute exchange rate
  const computeExchangeRate = (fromCurrency: string, toCurrency: string) => {
    const fromToken = tokenPrices.find((t) => t.currency === fromCurrency);
    const toToken = tokenPrices.find((t) => t.currency === toCurrency);
    if (fromToken && toToken) {
      setExchangeRate(toToken.price / fromToken.price);
    } else {
      setExchangeRate(null);
    }
  };

  // Watch form values and update exchange rate
  const fromCurrency = watch("fromCurrency");
  const toCurrency = watch("toCurrency");
  useEffect(() => {
    if (fromCurrency && toCurrency) {
      computeExchangeRate(fromCurrency, toCurrency);
    }
  }, [fromCurrency, toCurrency]);

  // Form submission handler
  const onSubmit: SubmitHandler<FormData> = (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(
        `Converted ${data.amount} ${data.fromCurrency} to ${data.toCurrency}`
      );
    }, 2000);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Currency Swap</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* From Currency */}
        <div>
          <label className="block mb-1">From Currency</label>
          <select
            {...register("fromCurrency", {
              required: "From currency is required",
            })}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Currency</option>
            {tokenPrices.map((token) => (
              <option key={token.currency} value={token.currency}>
                {token.currency}
              </option>
            ))}
          </select>
          {errors.fromCurrency && (
            <p className="text-red-500 text-sm">
              {errors.fromCurrency.message}
            </p>
          )}
        </div>

        {/* To Currency */}
        <div>
          <label className="block mb-1">To Currency</label>
          <select
            {...register("toCurrency", { required: "To currency is required" })}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Currency</option>
            {tokenPrices.map((token) => (
              <option key={token.currency} value={token.currency}>
                {token.currency}
              </option>
            ))}
          </select>
          {errors.toCurrency && (
            <p className="text-red-500 text-sm">{errors.toCurrency.message}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            {...register("amount", {
              required: "Amount is required",
              min: { value: 0.01, message: "Amount must be greater than 0" },
            })}
            className="p-2 border rounded w-full"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}
        </div>

        {/* Exchange Rate */}
        <div className="text-gray-500">
          {exchangeRate !== null
            ? `Exchange Rate: ${exchangeRate.toFixed(4)}`
            : "Select currencies to view exchange rate"}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full p-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-green-500"
          }`}
          disabled={loading}
        >
          {loading ? "Converting..." : "Convert"}
        </button>
      </form>
    </div>
  );
};

export default App;
