import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { generateKey } from "../../utils/jwtToken";

export class AuthService {
  private readonly instance: AxiosInstance;

  public constructor(url: string) {
    this.instance = axios.create({
      baseURL: url,
      timeout: 50000,
      timeoutErrorMessage: "Time out!",
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.response.use(
      (response) => {
        if (response?.status === 401) {
          window.location.href = "/login";
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  public async login(
    password: string,
    userName: string,
    token: string
  ): Promise<AxiosResponse> {
    const payload = { password, userName, token } as Record<string, unknown>;
    const tokenizedData = await generateKey(payload);

    return this.instance.post("api/Auth/Login", {
      data: tokenizedData,
    });
  }

  public async logout(userName: string): Promise<AxiosResponse> {
    const payload = { userName } as Record<string, unknown>;
    const tokenizedData = await generateKey(payload);

    return this.instance.post<AxiosResponse>("api/Auth/logout", {
      data: tokenizedData,
    });
  }
}
