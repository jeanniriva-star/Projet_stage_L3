import axios from "axios";

export function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? fallback;
  }

  return fallback;
}