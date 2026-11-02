import { clientesAxios } from "../config/axios";

export interface ILoginData {
  email: string;
  password: string;
}

export interface ILoginResponse {
  ok: boolean;
  token: string;
  debeCambiarPassword: boolean;
  message?: string;
}

export const authService = {
  login: async (data: ILoginData): Promise<ILoginResponse> => {
    const response = await clientesAxios.post<ILoginResponse>("/api/v1/auth/login", data);
    return response.data;
  },
};