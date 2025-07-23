import { useState } from "react";

import api from "../../../../shared/api/api";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/sign-in", { email, password });
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Auth error");
      setLoading(false);
      return null;
    }
  };

  return { signIn, loading, error };
}
