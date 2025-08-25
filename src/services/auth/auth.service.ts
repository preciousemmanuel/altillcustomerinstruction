import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { generateKey } from "../../utils/jwtToken";

interface ILoginPayload {
  password: string;
  userName: string;
  token: string;
}

interface ILogoutPayload {
  userName: string;
}

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
    console.log(" Reached here");
    const payload: ILoginPayload = { password, userName, token };
    const tokenizedData = await generateKey(payload);

    const x = this.instance.post<AxiosResponse>("api/Auth/Login", {
      data: tokenizedData,
    });
    console.log({ x });
    return x;
  }

  public async logout(userName: string): Promise<AxiosResponse> {
    const payload: ILogoutPayload = { userName };
    const tokenizedData = await generateKey(payload);

    return this.instance.post<AxiosResponse>("api/Auth/logout", {
      data: tokenizedData,
    });
  }

  public async generateToken(data: any): Promise<AxiosResponse> {
    const tokenizedData = await generateKey(data);

    return this.instance.post<AxiosResponse>("api/Auth/GenerateUserToken", {
      data: tokenizedData,
    });
  }
}
