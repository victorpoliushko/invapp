import { API_BASE_URL } from "../config";
import { decryptDeep, encryptDeep } from "../crypto/vault";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const storedRefresh = localStorage.getItem("refreshToken");
  if (!storedRefresh) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/auth-v2/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function tryRefresh(): Promise<boolean> {
  refreshing ??= refreshTokens().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function encryptBody(body: BodyInit | null | undefined): Promise<BodyInit | null | undefined> {
  if (typeof body !== "string") return body;
  try {
    return JSON.stringify(await encryptDeep(JSON.parse(body)));
  } catch (err) {
    if (err instanceof SyntaxError) return body;
    throw err;
  }
}

async function decryptResponse(response: Response): Promise<Response> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const text = await response.text();
  const init = { status: response.status, statusText: response.statusText, headers: response.headers };
  if (!text) return new Response(null, init);
  const decrypted = await decryptDeep(JSON.parse(text));
  return new Response(JSON.stringify(decrypted), init);
}

export async function secureFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = input.startsWith("http") ? input : `${API_BASE_URL}${input}`;
  const body = await encryptBody(init.body);

  const send = () => {
    const token = localStorage.getItem("accessToken");
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (body != null && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    return fetch(url, { ...init, headers, body });
  };

  let response = await send();
  if (response.status === 401) {
    if (!(await tryRefresh())) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      throw new UnauthorizedError();
    }
    response = await send();
  }
  return decryptResponse(response);
}
