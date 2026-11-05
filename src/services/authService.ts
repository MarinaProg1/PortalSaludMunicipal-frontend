import clientesAxios from "../config/axios";

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

export interface ICambiarPasswordData {
  passwordActual: string;
  nuevaPassword: string;
}

export interface ICambiarPasswordResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
  data?: unknown;
}

export const authService = {
  login: async (data: ILoginData): Promise<ILoginResponse> => {
    const response = await clientesAxios.post<ILoginResponse>("/auth/login", data);
    return response.data;
  },

  cambiarPassword: async (data: ICambiarPasswordData): Promise<ICambiarPasswordResponse> => {
    const response = await clientesAxios.put<ICambiarPasswordResponse>("/auth/cambiar-password", data);
    return response.data;
  },
};
