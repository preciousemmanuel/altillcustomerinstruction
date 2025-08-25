import { authService } from "../../services";

export const useLogin = () => {
  const login = async (password: string, userName: string, token: string) => {
    console.log("login:", { password, userName, token });
    const user = await authService.login(password, userName, token);
    console.log({ user });
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
