import axios, { AxiosInstance, AxiosError } from "axios";

// Use Next.js API proxy route to avoid CORS issues
const API_BASE_URL = "/api/proxy";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let authToken: string | null = null;
let onTokenInvalidCallback: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Register a callback to be called when token becomes invalid (401 error)
 */
export function setOnTokenInvalidCallback(callback: (() => void) | null) {
  onTokenInvalidCallback = callback;
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(
    (config) => {
      if (!authToken) {
        throw new ApiError("No authentication token provided", 401);
      }
      config.headers.Authorization = `Bearer ${authToken}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        // If we get 401 Unauthorized, token is invalid
        if (error.response.status === 401 && authToken && onTokenInvalidCallback) {
          // Clear token and notify
          authToken = null;
          onTokenInvalidCallback();
        }
        
        const message =
          (error.response.data as { message?: string })?.message ||
          error.message ||
          "An error occurred";
        throw new ApiError(
          message,
          error.response.status,
          error.response.data
        );
      }
      throw new ApiError(error.message || "Network error");
    }
  );

  return client;
}

export const apiClient = createClient();

/**
 * Test if a token is valid by making a test API call
 */
export async function testToken(token: string): Promise<boolean> {
  try {
    // Create a temporary client with the test token
    const testClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Make a test call to health endpoint
    const response = await testClient.get("/health");
    return response.status === 200;
  } catch {
    return false;
  }
}

