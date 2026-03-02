import { useRouter } from "expo-router";
import { useEffect } from "react";

/** No auth: redirect to home immediately. */
export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
