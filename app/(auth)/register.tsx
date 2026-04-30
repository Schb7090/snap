import { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { Screen } from "@src/components/ui/Screen";
import { Button } from "@src/components/ui/Button";
import { signUp, AuthError } from "@src/services/authService";
import { isFirebaseConfigured } from "@src/config/env";

const ERROR_MESSAGES_HU: Record<string, string> = {
  invalid_email: "Érvénytelen email cím.",
  email_in_use: "Ez az email már regisztrálva van.",
  weak_password: "A jelszó túl rövid (legalább 6 karakter).",
  network_error: "Nincs internet kapcsolat.",
  not_configured: "A Firebase még nincs konfigurálva.",
  unknown: "Ismeretlen hiba történt.",
};

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    if (!isFirebaseConfigured()) {
      Alert.alert(
        "Firebase nincs konfigurálva",
        "Add meg a Firebase kulcsokat a .env.local fájlban a regisztrációhoz.",
      );
      return;
    }
    setBusy(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
      router.replace("/(tabs)");
    } catch (e) {
      const code = e instanceof AuthError ? e.code : "unknown";
      Alert.alert("Regisztráció sikertelen", ERROR_MESSAGES_HU[code] ?? code);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen className="px-6">
      <View className="flex-1 justify-center">
        <Text className="mb-2 text-3xl font-bold text-gray-900">
          Regisztráció
        </Text>
        <Text className="mb-8 text-base text-gray-500">
          Hozz létre egy új Snap Track fiókot.
        </Text>

        <View className="mb-3">
          <Text className="mb-1 text-sm font-medium text-gray-700">Név</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Vezetéknév Keresztnév"
            className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base"
          />
        </View>

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
          <Text className="mb-1 text-sm font-medium text-gray-700">
            Jelszó (min. 6 karakter)
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base"
          />
        </View>

        <Button onPress={handleRegister} loading={busy}>
          Fiók létrehozása
        </Button>
        <View className="mt-3">
          <Button variant="secondary" onPress={() => router.back()}>
            Vissza
          </Button>
        </View>
      </View>
    </Screen>
  );
}
