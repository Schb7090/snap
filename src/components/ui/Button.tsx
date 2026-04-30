import { Pressable, Text, ActivityIndicator } from "react-native";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps {
  readonly onPress: () => void;
  readonly children: ReactNode;
  readonly variant?: Variant;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly className?: string;
}

const VARIANT_BG: Record<Variant, string> = {
  primary: "bg-brand-600 active:bg-brand-700",
  secondary: "bg-gray-100 active:bg-gray-200",
  ghost: "bg-transparent active:bg-gray-100",
  danger: "bg-red-600 active:bg-red-700",
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-gray-900",
  ghost: "text-brand-600",
  danger: "text-white",
};

export function Button({
  onPress,
  children,
  variant = "primary",
  disabled = false,
  loading = false,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-2xl px-5 py-4 ${VARIANT_BG[variant]} ${isDisabled ? "opacity-40" : ""} ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#1f2937"} />
      ) : (
        <Text className={`text-base font-semibold ${VARIANT_TEXT[variant]}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
