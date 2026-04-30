import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";

interface ScreenProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly safe?: boolean;
}

export function Screen({ children, className, safe = true }: ScreenProps) {
  const Wrapper = safe ? SafeAreaView : View;
  return (
    <Wrapper className={`flex-1 bg-white ${className ?? ""}`}>
      {children}
    </Wrapper>
  );
}
