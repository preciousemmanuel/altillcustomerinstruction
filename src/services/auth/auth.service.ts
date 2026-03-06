import { type AxiosResponse } from "axios";
import { BaseService } from "../base.service";

export class AuthService extends BaseService {
  public async login(
    password: string,
    userName: string,
    token: string
  ): Promise<AxiosResponse> {
    const payload = { password, userName, token } as Record<string, unknown>;

    return this.instance.post("api/Auth/Login", payload);
  }

  public async logout(userName: string): Promise<AxiosResponse> {
    const payload = { userName } as Record<string, unknown>;

    return this.instance.post<AxiosResponse>("api/Auth/logout", payload);
  }
}
