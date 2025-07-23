import { useState } from "react";

import api from "../../../../shared/api/api";

export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function signUp(email, password) {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await api.post("/auth/sign-up", { email, password });
      setSuccess(true);
      setLoading(false);
      return true;
    } catch (e) {
      setError(e?.response?.data?.message || "Network error");
      setLoading(false);
      return false;
    }
  }

  return { signUp, loading, error, success };
}
