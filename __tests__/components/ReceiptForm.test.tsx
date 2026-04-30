import { Alert } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ReceiptForm } from "@src/components/receipt/ReceiptForm";
import type { ReceiptFormValues } from "@src/components/receipt/ReceiptForm";

jest.spyOn(Alert, "alert").mockImplementation(() => {});

const noop = () => {};

describe("ReceiptForm", () => {
  beforeEach(() => {
    (Alert.alert as jest.Mock).mockClear();
  });

  it("renders without crashing", () => {
    render(<ReceiptForm onSave={noop} onCancel={noop} />);
    expect(screen.getByPlaceholderText(/SPAR/)).toBeOnTheScreen();
    expect(screen.getByPlaceholderText(/2026.04.30/)).toBeOnTheScreen();
    expect(screen.getByPlaceholderText("12500")).toBeOnTheScreen();
  });

  it("hydrates initial values", () => {
    render(
      <ReceiptForm
        initial={{
          merchant: "Tesco",
          date: "2026.04.15",
          grossAmount: 5000,
          vatRate: 0.18,
          notes: "Munka ebéd",
        }}
        onSave={noop}
        onCancel={noop}
      />,
    );
    expect(screen.getByDisplayValue("Tesco")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("2026.04.15")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("5000")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("Munka ebéd")).toBeOnTheScreen();
  });

  it("computes and displays VAT breakdown from gross + rate", () => {
    render(
      <ReceiptForm
        initial={{ grossAmount: 12700, vatRate: 0.27 }}
        onSave={noop}
        onCancel={noop}
      />,
    );
    expect(screen.getByText(/ÁFA \(27%\)/)).toBeOnTheScreen();
  });

  it("calls onSave with the right values when valid", async () => {
    const onSave = jest.fn();
    render(
      <ReceiptForm
        initial={{
          merchant: "SPAR",
          date: "2026.04.30",
          grossAmount: 1270,
          vatRate: 0.27,
        }}
        onSave={onSave}
        onCancel={noop}
      />,
    );
    fireEvent.press(screen.getByText("Mentés"));
    await new Promise((r) => setTimeout(r, 0));
    expect(onSave).toHaveBeenCalledTimes(1);
    const values = onSave.mock.calls[0]?.[0] as ReceiptFormValues;
    expect(values.merchant).toBe("SPAR");
    expect(values.date).toBe("2026.04.30");
    expect(values.breakdown.gross).toBe(1270);
    expect(values.breakdown.net).toBe(1000);
    expect(values.breakdown.vat).toBe(270);
    expect(values.breakdown.rate).toBe(0.27);
    expect(values.items).toEqual([]);
  });

  it("blocks save and alerts when merchant is empty", async () => {
    const onSave = jest.fn();
    render(
      <ReceiptForm
        initial={{ date: "2026.04.30", grossAmount: 1270, vatRate: 0.27 }}
        onSave={onSave}
        onCancel={noop}
      />,
    );
    fireEvent.press(screen.getByText("Mentés"));
    await new Promise((r) => setTimeout(r, 0));
    expect(onSave).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Hiányzó adat",
      expect.stringContaining("kereskedő"),
    );
  });

  it("blocks save when date is malformed", async () => {
    const onSave = jest.fn();
    render(
      <ReceiptForm
        initial={{ merchant: "X", date: "26.04.30", grossAmount: 1270, vatRate: 0.27 }}
        onSave={onSave}
        onCancel={noop}
      />,
    );
    fireEvent.press(screen.getByText("Mentés"));
    await new Promise((r) => setTimeout(r, 0));
    expect(onSave).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Hiányzó adat",
      expect.stringContaining("ÉÉÉÉ.HH.NN"),
    );
  });

  it("calls onCancel when cancel pressed", () => {
    const onCancel = jest.fn();
    render(<ReceiptForm onSave={noop} onCancel={onCancel} />);
    fireEvent.press(screen.getByText("Mégse"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("adds an item row when 'Új tétel' is pressed", () => {
    render(<ReceiptForm onSave={noop} onCancel={noop} />);
    expect(screen.queryByPlaceholderText("Tétel neve")).toBeNull();
    fireEvent.press(screen.getByText("Új tétel"));
    expect(screen.getByPlaceholderText("Tétel neve")).toBeOnTheScreen();
    expect(screen.getByText("1. tétel")).toBeOnTheScreen();
  });

  it("includes valid items in onSave payload", async () => {
    const onSave = jest.fn();
    render(
      <ReceiptForm
        initial={{
          merchant: "SPAR",
          date: "2026.04.30",
          grossAmount: 1270,
          vatRate: 0.27,
        }}
        onSave={onSave}
        onCancel={noop}
      />,
    );
    fireEvent.press(screen.getByText("Új tétel"));
    fireEvent.changeText(screen.getByPlaceholderText("Tétel neve"), "Tej");
    fireEvent.changeText(screen.getByPlaceholderText("Ár (Ft)"), "350");
    fireEvent.press(screen.getByText("Mentés"));
    await new Promise((r) => setTimeout(r, 0));
    const values = onSave.mock.calls[0]?.[0] as ReceiptFormValues;
    expect(values.items).toHaveLength(1);
    expect(values.items[0]?.name).toBe("Tej");
    expect(values.items[0]?.grossAmount).toBe(350);
  });

  it("rejects unsaved items missing a name", async () => {
    const onSave = jest.fn();
    render(
      <ReceiptForm
        initial={{
          merchant: "SPAR",
          date: "2026.04.30",
          grossAmount: 1270,
          vatRate: 0.27,
        }}
        onSave={onSave}
        onCancel={noop}
      />,
    );
    fireEvent.press(screen.getByText("Új tétel"));
    fireEvent.changeText(screen.getByPlaceholderText("Ár (Ft)"), "350");
    fireEvent.press(screen.getByText("Mentés"));
    await new Promise((r) => setTimeout(r, 0));
    expect(onSave).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });
});
