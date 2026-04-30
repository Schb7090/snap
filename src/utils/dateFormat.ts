import { format, parse, isValid } from "date-fns";
import { hu } from "date-fns/locale";

export const HU_DATE_FORMAT = "yyyy.MM.dd";
export const HU_MONTH_FORMAT = "yyyy.MM";

export const formatHuDate = (date: Date | number): string => {
  return format(date, HU_DATE_FORMAT, { locale: hu });
};

export const formatHuMonth = (date: Date | number): string => {
  return format(date, HU_MONTH_FORMAT, { locale: hu });
};

export const formatHuMonthLong = (date: Date | number): string => {
  return format(date, "yyyy. MMMM", { locale: hu });
};

const HU_DATE_REGEX = /^\d{4}\.\d{2}\.\d{2}$/;

export const parseHuDate = (input: string): Date | null => {
  if (!HU_DATE_REGEX.test(input)) return null;
  const parsed = parse(input, HU_DATE_FORMAT, new Date(), { locale: hu });
  return isValid(parsed) ? parsed : null;
};

export const monthKey = (date: Date | number): string => {
  return format(date, "yyyy-MM");
};
