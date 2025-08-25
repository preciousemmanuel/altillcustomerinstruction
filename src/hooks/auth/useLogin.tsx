import { authService } from "../../services";

export const useLogin = () => {
  const login = async (password: string, userName: string, token: string) => {
    const user = await authService.login(password, userName, token);
    return user;
  };

  return { login };
};

export const useLogout = () => {
  const logout = async (userName: string) => {
    const user = await authService.logout(userName);
    return user;
  };
  return { logout };
};
