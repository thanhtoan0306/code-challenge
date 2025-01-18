// src/api.ts
import axios from "axios";
import { TokenPrice } from "./types";

export async function fetchTokenPrices(): Promise<TokenPrice[]> {
  const response = await axios.get(
    "https://interview.switcheo.com/prices.json"
  );
  return response.data;
}
