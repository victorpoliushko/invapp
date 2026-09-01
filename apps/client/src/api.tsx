import { PortfolioDto } from "./types/portfolio";
import { API_BASE_URL as BASE_URL } from "./config";

const apiRequest = async (path: String) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`Expected JSON but got ${contentType}. Check if the URL ${BASE_URL} is correct!`);
  }

  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  
  return response.json();
};

export const fetchPortfolio = (id: String): Promise<PortfolioDto> => apiRequest(`/portfolios/${id}`);
export const fetchPortfolioPrices = (id: String) => apiRequest(`/portfolios/${id}/balance`);
