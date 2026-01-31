const BASE_URL = import.meta.env.VITE_BASE_URL;

const apiRequest = async (path: String) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  return response.json();
};

export const fetchPortfolio = (id: String) => apiRequest(`/portfolios/${id}`);
export const fetchPortfolioPrices = (id: String) => apiRequest(`/portfolios/${id}/balance`);
