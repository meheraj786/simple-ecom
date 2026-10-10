import axios from "axios";

const configuredApiUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: configuredApiUrl.endsWith("/api")
    ? configuredApiUrl
    : `${configuredApiUrl}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof document === "undefined") {
    return config;
  }

  const isReadOnly = ["get", "head", "options"].includes(
    (config.method ?? "get").toLowerCase(),
  );
  if (!isReadOnly) {
    const csrfCookie = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("csrf_token="));
    const csrfToken = csrfCookie?.slice("csrf_token=".length);
    if (csrfToken) {
      config.headers.set("x-csrf-token", decodeURIComponent(csrfToken));
    }
  }

  return config;
});

export default apiClient;
