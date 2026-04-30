import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Receipt } from "@src/types/receipt";
import { findCategory } from "@src/constants/categories";

interface ExportRow {
  readonly Datum: string;
  readonly Kereskedo: string;
  readonly Adoszam: string;
  readonly Brutto_Ft: number;
  readonly Netto_Ft: number;
  readonly AFA_Ft: number;
  readonly AFA_kulcs: string;
  readonly Kategoria: string;
  readonly Megjegyzes: string;
}

const HUNGARIAN_HEADERS: readonly [keyof ExportRow, string][] = [
  ["Datum", "Dátum"],
  ["Kereskedo", "Kereskedő"],
  ["Adoszam", "Adószám"],
  ["Brutto_Ft", "Bruttó (Ft)"],
  ["Netto_Ft", "Nettó (Ft)"],
  ["AFA_Ft", "ÁFA (Ft)"],
  ["AFA_kulcs", "ÁFA kulcs"],
  ["Kategoria", "Kategória"],
  ["Megjegyzes", "Megjegyzés"],
];

const toRow = (r: Receipt): ExportRow => {
  const cat = r.category ? findCategory(r.category)?.labelHu : null;
  return {
    Datum: r.date,
    Kereskedo: r.merchant,
    Adoszam: r.merchantTaxId ?? "",
    Brutto_Ft: r.grossAmount,
    Netto_Ft: r.netAmount,
    AFA_Ft: r.vatAmount,
    AFA_kulcs: `${Math.round(r.vatRate * 100)}%`,
    Kategoria: cat ?? r.category ?? "",
    Megjegyzes: r.notes ?? "",
  };
};

export const toCsv = (receipts: readonly Receipt[]): string => {
  const rows = receipts.map(toRow);
  const remapped = rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [key, label] of HUNGARIAN_HEADERS) {
      out[label] = row[key];
    }
    return out;
  });
  const csv = Papa.unparse(remapped, {
    delimiter: ";",
    header: true,
    quotes: true,
  });
  return `﻿${csv}`;
};

export const toXlsxBase64 = (receipts: readonly Receipt[]): string => {
  const rows = receipts.map(toRow);
  const remapped = rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [key, label] of HUNGARIAN_HEADERS) {
      out[label] = row[key];
    }
    return out;
  });

  const ws = XLSX.utils.json_to_sheet(remapped);
  ws["!cols"] = [
    { wch: 12 },
    { wch: 24 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 16 },
    { wch: 32 },
  ];

  const totalGross = rows.reduce((s, r) => s + r.Brutto_Ft, 0);
  const totalNet = rows.reduce((s, r) => s + r.Netto_Ft, 0);
  const totalVat = rows.reduce((s, r) => s + r.AFA_Ft, 0);

  const summary = [
    ["Időszak", `${receipts.length} nyugta`],
    ["Bruttó összesen (Ft)", totalGross],
    ["Nettó összesen (Ft)", totalNet],
    ["ÁFA összesen (Ft)", totalVat],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summary);
  wsSummary["!cols"] = [{ wch: 24 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Nyugták");
  XLSX.utils.book_append_sheet(wb, wsSummary, "Összesítő");

  return XLSX.write(wb, { type: "base64", bookType: "xlsx" });
};

export interface ExportFile {
  readonly filename: string;
  readonly mimeType: string;
}

export const writeAndShareCsv = async (
  receipts: readonly Receipt[],
): Promise<ExportFile> => {
  const csv = toCsv(receipts);
  const filename = `snap-track-${new Date().toISOString().slice(0, 10)}.csv`;
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      UTI: "public.comma-separated-values-text",
      dialogTitle: "Nyugták exportálása CSV",
    });
  }
  return { filename, mimeType: "text/csv" };
};

export const writeAndShareXlsx = async (
  receipts: readonly Receipt[],
): Promise<ExportFile> => {
  const base64 = toXlsxBase64(receipts);
  const filename = `snap-track-${new Date().toISOString().slice(0, 10)}.xlsx`;
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      UTI: "org.openxmlformats.spreadsheetml.sheet",
      dialogTitle: "Nyugták exportálása Excel",
    });
  }
  return { filename, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
};
