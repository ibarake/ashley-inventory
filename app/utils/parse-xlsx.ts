import xlsx from "node-xlsx";
import fs from "fs";

export async function parseXLSXFromFile(filePath: string) {
  return new Promise((resolve) => {
    const sheets = xlsx.parse(filePath, {
      header: [
        "Handle",
        "Title",
        "Option1 Name",
        "Option1 Value",
        "Option2 Name",
        "Option2 Value",
        "Option3 Name",
        "Option3 Value",
        "SKU",
        "HS Code",
        "COO",
        "Location",
        "Incoming",
        "Unavailable",
        "Committed",
        "Available",
        "On hand",
        "Fecha Disponible",
      ],
      sheets: [0],
      range: 18,
    });

    fs.rm(filePath, () => {
      return resolve(sheets[0].data as { name: string; age: number }[]);
    });
  });
}
