import { render, screen } from "@testing-library/react-native";
import { TierBadge } from "@src/components/ui/TierBadge";
import { TIER_LABELS_HU } from "@src/constants/tiers";

describe("TierBadge", () => {
  it.each(["free", "starter", "pro", "business"] as const)(
    "renders the Hungarian label for tier=%s",
    (tier) => {
      render(<TierBadge tier={tier} />);
      expect(screen.getByText(TIER_LABELS_HU[tier])).toBeOnTheScreen();
    },
  );
});
