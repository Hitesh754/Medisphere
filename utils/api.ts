const BASE_URL = "https://symmetrical-goggles-jj4gg74qx9p5cx4q-5000.app.github.dev";

export const apiRequest = async (
  endpoint: string,
  method: string = "GET",
  body?: any,
  token?: string
) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body,
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.log("API Error:", err);
    throw err;
  }
};