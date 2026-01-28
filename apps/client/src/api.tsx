const apiRequest = async (path: string) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${process.env.BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  return response.json();
};

export const fetchPortfolio = (id: string) => apiRequest(`/portfolios/${id}`);
export const fetchPortfolioPrices = (id: string) => apiRequest(`/portfolios/${id}/balance`);
