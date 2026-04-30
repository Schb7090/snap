import { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { Screen } from "@src/components/ui/Screen";
import { Button } from "@src/components/ui/Button";
import { useUserStore } from "@src/store/userStore";
import { signIn, AuthError } from "@src/services/authService";
import { isFirebaseConfigured } from "@src/config/env";

const ERROR_MESSAGES_HU: Record<string, string> = {
  invalid_email: "Érvénytelen email cím.",
  user_not_found: "Nincs ilyen felhasználó.",
  wrong_password: "Hibás jelszó.",
  network_error: "Nincs internet kapcsolat.",
  not_configured: "A Firebase még nincs konfigurálva — fejlesztői belépés.",
  unknown: "Ismeretlen hiba történt.",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const setUser = useUserStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!isFirebaseConfigured()) {
      setUser({
        id: "dev-user",
        email: email || "dev@snaptrack.local",
        displayName: "Fejlesztő",
        tier: "free",
        createdAt: Date.now(),
        deletedAt: null,
      });
      router.replace("/(tabs)");
      return;
    }

    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e) {
      const code = e instanceof AuthError ? e.code : "unknown";
      Alert.alert("Bejelentkezés sikertelen", ERROR_MESSAGES_HU[code] ?? code);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen className="px-6">
      <View className="flex-1 justify-center">
        <Text className="mb-2 text-3xl font-bold text-gray-900">Snap Track</Text>
        <Text className="mb-8 text-base text-gray-500">
          Számlák és nyugták egy helyen
        </Text>

        <View className="mb-3">
          <Text className="mb-1 text-sm font-medium text-gray-700">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="te@email.hu"
            className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base"
          />
        </View>

        <View className="mb-6">
          <Text className="mb-1 text-sm font-medium text-gray-700">Jelszó</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base"
          />
        </View>

        <Button onPress={handleLogin} loading={busy}>
          Bejelentkezés
        </Button>

        <View className="mt-4">
          <Button
            variant="ghost"
            onPress={() => router.push("/(auth)/register")}
          >
            Még nincs fiókom — regisztráció
          </Button>
        </View>

        {!isFirebaseConfigured() && (
          <Text className="mt-8 text-center text-xs text-gray-400">
            Fejlesztői mód: bármilyen adattal belép
          </Text>
        )}
      </View>
    </Screen>
  );
}
