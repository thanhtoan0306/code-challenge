// src/App.tsx
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { fetchTokenPrices } from "./api";
import { TokenPrice, FormData } from "./types";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";

const App: React.FC = () => {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
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
    if (exchangeRate !== null) {
      const convertedAmount = data.amount * exchangeRate;
      setResult(`${convertedAmount.toFixed(2)} ${data.toCurrency}`);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "0 auto", padding: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Currency Swap
      </Typography>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* From Currency */}
        <TextField
          select
          label="From Currency"
          fullWidth
          error={!!errors.fromCurrency}
          helperText={errors.fromCurrency?.message}
          {...register("fromCurrency", {
            required: "From currency is required",
          })}
        >
          {tokenPrices.map((token) => (
            <MenuItem key={token.currency} value={token.currency}>
              {token.currency}
            </MenuItem>
          ))}
        </TextField>

        {/* To Currency */}
        <TextField
          select
          label="To Currency"
          fullWidth
          error={!!errors.toCurrency}
          helperText={errors.toCurrency?.message}
          {...register("toCurrency", { required: "To currency is required" })}
        >
          {tokenPrices.map((token) => (
            <MenuItem key={token.currency} value={token.currency}>
              {token.currency}
            </MenuItem>
          ))}
        </TextField>

        {/* Amount */}
        <TextField
          label="Amount"
          type="number"
          fullWidth
          error={!!errors.amount}
          helperText={errors.amount?.message}
          {...register("amount", {
            required: "Amount is required",
            min: { value: 0.01, message: "Amount must be greater than 0" },
          })}
        />

        {/* Exchange Rate */}
        <Typography variant="body2" color="textSecondary">
          {exchangeRate !== null
            ? `Exchange Rate: ${exchangeRate.toFixed(4)}`
            : "Select currencies to view exchange rate"}
        </Typography>

        {/* Result Field */}
        <TextField label="Converted Amount" value={result} fullWidth disabled />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Converting..." : "Convert"}
        </Button>
      </form>
    </Box>
  );
};

export default App;
