import { AuthService } from "./auth/auth.service";

export const authService = new AuthService(import.meta.env.VITE_API_URL);
