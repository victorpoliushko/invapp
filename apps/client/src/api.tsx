import { PortfolioDto } from "../../api/src/portfolios/dto/portfolio.dto";

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';;


console.log("Current BASE_URL is:", BASE_URL); 

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
