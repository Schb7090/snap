import { render, screen } from "@testing-library/react-native";
import { UpgradePrompt } from "@src/components/subscription/UpgradePrompt";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

describe("UpgradePrompt", () => {
  it("shows quota_exceeded with used/limit", () => {
    render(
      <UpgradePrompt
        reason="quota_exceeded"
        requiredTier="starter"
        used={10}
        limit={10}
      />,
    );
    expect(screen.getByText(/Havi limit elérve/)).toBeOnTheScreen();
    expect(screen.getByText(/10\/10/)).toBeOnTheScreen();
    expect(screen.getByText(/Kezdő/)).toBeOnTheScreen();
  });

  it("shows feature_locked with required tier", () => {
    render(<UpgradePrompt reason="feature_locked" requiredTier="pro" />);
    expect(
      screen.getByText(/Magasabb csomag szükséges/),
    ).toBeOnTheScreen();
    expect(screen.getAllByText(/Profi/).length).toBeGreaterThan(0);
  });

  it("shows low_quota with remaining count", () => {
    render(
      <UpgradePrompt
        reason="low_quota"
        requiredTier="starter"
        remaining={2}
      />,
    );
    expect(screen.getByText(/Fogyóban/)).toBeOnTheScreen();
    expect(screen.getByText(/2 nyugta/)).toBeOnTheScreen();
  });

  it("renders the upgrade CTA button", () => {
    render(<UpgradePrompt reason="feature_locked" requiredTier="pro" />);
    expect(screen.getByText("Csomagok megnézése")).toBeOnTheScreen();
  });
});
