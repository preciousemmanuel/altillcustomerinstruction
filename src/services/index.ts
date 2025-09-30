import { AuthService } from "./auth/auth.service";
import { AccountService } from "./account/account.service";

export const authService = new AuthService(import.meta.env.VITE_API_URL);
export const accountService = new AccountService(import.meta.env.VITE_API_URL);
