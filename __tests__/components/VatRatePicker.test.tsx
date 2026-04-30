import { render, screen, fireEvent } from "@testing-library/react-native";
import { VatRatePicker } from "@src/components/forms/VatRatePicker";

describe("VatRatePicker", () => {
  it("renders all three Hungarian VAT rates", () => {
    render(<VatRatePicker value={0.27} onChange={() => {}} />);
    expect(screen.getByText("5%")).toBeOnTheScreen();
    expect(screen.getByText("18%")).toBeOnTheScreen();
    expect(screen.getByText("27%")).toBeOnTheScreen();
  });

  it("calls onChange with the selected rate", () => {
    const onChange = jest.fn();
    render(<VatRatePicker value={0.27} onChange={onChange} />);
    fireEvent.press(screen.getByText("5%"));
    expect(onChange).toHaveBeenCalledWith(0.05);
    fireEvent.press(screen.getByText("18%"));
    expect(onChange).toHaveBeenCalledWith(0.18);
  });

  it("does not call onChange when pressing the already-selected rate", () => {
    const onChange = jest.fn();
    render(<VatRatePicker value={0.27} onChange={onChange} />);
    fireEvent.press(screen.getByText("27%"));
    expect(onChange).toHaveBeenCalledWith(0.27);
  });
});
