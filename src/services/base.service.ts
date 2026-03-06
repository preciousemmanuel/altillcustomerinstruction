import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { encryptionService } from "./encryption.service";

export class BaseService {
    protected readonly instance: AxiosInstance;

    constructor(url: string) {
        this.instance = axios.create({
            baseURL: url,
            timeout: 50000,
            timeoutErrorMessage: "Time out!",
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request Interceptor: Encrypt payload
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                if (config.data && !(config.data instanceof FormData)) {
                    config.data = {
                        data: encryptionService.encrypt(config.data),
                    };
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor: Decrypt payload
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                if (response.status === 401) {
                    window.location.href = "/login";
                }

                // Check if the response data is encrypted in the 'data' property
                if (response.data && response.data.data && typeof response.data.data === "string" && response.data.data.length > 20) {
                    // we check length > 20 to avoid trying to decrypt small strings that might not be ciphertext
                    const decrypted = encryptionService.decrypt(response.data.data);
                    if (decrypted !== null) {
                        response.data = decrypted;
                    }
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
}
