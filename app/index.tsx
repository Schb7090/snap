import { Redirect } from "expo-router";
import { useUserStore } from "@src/store/userStore";

export default function Index() {
  const user = useUserStore((s) => s.user);
  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}
