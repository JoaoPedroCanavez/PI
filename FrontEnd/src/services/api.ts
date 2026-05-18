const API_URL = "http://localhost:8000/api/v1";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    credentials: 'include',
  }; 

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      const errorMessage = errorData?.error 
        || errorData?.detail 
        || `Erro HTTP: ${response.status}`;

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
    
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}