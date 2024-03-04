
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const handleURLReceived = (url: string, router: AppRouterInstance): string => {
  let code: string | null = null;
  // Extract the refresh token from the redirected URL
  if (window.location.href != "http://localhost:3000/") {
    const urlParams = new URLSearchParams(window.location.href.split("?")[1]);
    code = urlParams.get("code") ?? "";
  }

  if (code == null) {
    router.push(url);
  }

  return code ?? "";
};
