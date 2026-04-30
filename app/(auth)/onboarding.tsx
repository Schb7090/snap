import { View, Text } from "react-native";
import { router } from "expo-router";
import { Screen } from "@src/components/ui/Screen";
import { Button } from "@src/components/ui/Button";

export default function Onboarding() {
  return (
    <Screen className="px-6">
      <View className="flex-1 justify-center">
        <Text className="mb-3 text-3xl font-bold text-gray-900">
          Üdv a Snap Trackben!
        </Text>
        <Text className="mb-10 text-base text-gray-500">
          Fotózd le a nyugtákat, mi mindent kiolvasunk belőlük.
        </Text>
        <Button onPress={() => router.replace("/(tabs)")}>Kezdjük</Button>
      </View>
    </Screen>
  );
}
