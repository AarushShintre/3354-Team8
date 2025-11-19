import {
  IssueReportRequest,
  PaymentSuggestionRequest,
  Rating,
  Recommendation,
  UserProfile,
} from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  listUsers: () => request<UserProfile[]>("/users"),
  createUser: (payload: UserProfile) =>
    request<UserProfile>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateUser: (id: number, payload: Partial<UserProfile>) =>
    request<UserProfile>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteUser: (id: number) =>
    request<{ status: string }>(`/users/${id}`, { method: "DELETE" }),
  fetchReviews: (userId: number) =>
    request<Rating[]>(`/users/${userId}/reviews`),
  fetchRecommendations: (userId: number, limit = 5) =>
    request<Recommendation[]>(`/recommendations?userId=${userId}&limit=${limit}`),
  suggestPayment: (payload: PaymentSuggestionRequest) =>
    request<{ suggestedAmount: number }>("/payments/suggestions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  submitRating: (payload: Rating) =>
    request<Rating>("/ratings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  fetchRatings: (userId?: number) =>
    request<Rating[]>(userId ? `/ratings?userId=${userId}` : "/ratings"),
  fetchTerms: () => request<{ terms: string }>("/terms"),
  reportIssue: (payload: IssueReportRequest) =>
    request<{ id: number }>("/issues", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

