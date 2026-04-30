import { View } from "react-native";
import type { ReactNode } from "react";

interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-white p-4 shadow-sm border border-gray-100 ${className ?? ""}`}
    >
      {children}
    </View>
  );
}
