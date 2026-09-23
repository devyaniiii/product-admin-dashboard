import api from "./axios";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  token: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await api.post<AuthUser>("/auth/login", {
    username: credentials.username,
    password: credentials.password,
    expiresInMins: 60,
  });
  return response.data;
}

export function saveSession(user: AuthUser) {
  localStorage.setItem("token", user.token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
    })
  );
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}