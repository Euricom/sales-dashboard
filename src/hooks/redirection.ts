import router from "next/router";
import {useEffect} from "react";

export function useTLRedirection(status: string, data: unknown, redirectionUrl: string | undefined) {
  useEffect(() => {
    const asyncFn = async () => {
      const loadingState = status === "loading";
      if (!loadingState && data) {
        await router.push(redirectionUrl ?? "");
      }
    };
    void asyncFn()
  }, [status, data, redirectionUrl]);
}
