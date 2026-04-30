export interface CategoryDef {
  readonly id: string;
  readonly labelHu: string;
  readonly icon: string;
  readonly color: string;
}

export const DEFAULT_CATEGORIES: readonly CategoryDef[] = [
  { id: "groceries", labelHu: "Élelmiszer", icon: "cart", color: "#22c55e" },
  { id: "fuel", labelHu: "Üzemanyag", icon: "car", color: "#f97316" },
  { id: "restaurant", labelHu: "Étterem", icon: "restaurant", color: "#ef4444" },
  { id: "office", labelHu: "Iroda", icon: "briefcase", color: "#3b82f6" },
  { id: "travel", labelHu: "Utazás", icon: "airplane", color: "#8b5cf6" },
  { id: "utilities", labelHu: "Rezsi", icon: "flash", color: "#eab308" },
  { id: "health", labelHu: "Egészség", icon: "medkit", color: "#ec4899" },
  { id: "other", labelHu: "Egyéb", icon: "ellipsis-horizontal", color: "#6b7280" },
];

export const findCategory = (id: string): CategoryDef | undefined =>
  DEFAULT_CATEGORIES.find((c) => c.id === id);
