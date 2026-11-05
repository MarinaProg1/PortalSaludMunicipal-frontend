import { ReactNode } from "react";

export const SSRProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useSSRSafeId = (defaultId?: string) => {
  return defaultId ?? `id-${Math.random().toString(36).slice(2, 11)}`;
};

export const useIsSSR = () => false;

export default SSRProvider;
