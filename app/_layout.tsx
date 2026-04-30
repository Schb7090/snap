import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "@src/hooks/useAuth";

function AuthBootstrap({ children }: { readonly children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthBootstrap>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="receipt/[id]"
              options={{
                headerShown: true,
                title: "Nyugta részletei",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="receipt/new"
              options={{
                headerShown: true,
                title: "Új nyugta",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="upgrade"
              options={{
                headerShown: true,
                title: "Csomagok",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="export"
              options={{
                headerShown: true,
                title: "Exportálás",
                presentation: "modal",
              }}
            />
          </Stack>
        </AuthBootstrap>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
