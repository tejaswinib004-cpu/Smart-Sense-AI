const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function predictStress(payload) {
  const response = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function savePrediction(userEmail, prediction) {
  const response = await fetch(`${BASE_URL}/save-prediction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_email: userEmail, prediction }),
  });
  return response.json();
}

export async function getRecommendations(level) {
  const response = await fetch(`${BASE_URL}/recommendations/${level}`);
  return response.json();
}

export async function getHistory(userEmail, limit = 50) {
  const response = await fetch(`${BASE_URL}/history/${userEmail}?limit=${limit}`);
  return response.json();
}
