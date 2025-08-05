console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error("BACKEND URL is not set in your .env file!");
}
