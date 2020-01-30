import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

export const exportExcel = (excelData, fileName) => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column width. Currently setting width for first 5 columns
    const wscols = [];
    for (let i = 0; i < 5; i++) {
        if (i === 0) {
        wscols.push({ wch: 20 });
        } else {
        wscols.push({ wch: 60 });
        }
      }
    ws["!cols"] = wscols;

    // Set hyper-links for image urls which is in column 1 of each row
    const wsRef = ws["!ref"] || " ";
    const range = XLSX.utils.decode_range(wsRef);
    const noRows = range.e.r;
    for (let i = 1; i <= noRows; i++) {
        const cellref = XLSX.utils.encode_cell({c: 1, r: i}); // construct reference for cell
        if (!ws[cellref]) { continue; } // if cell doesn't exist, move on
        const cell = ws[cellref];
        cell.l = { Target: excelData[i - 1].Image_Url };
      }
    const wb = { Sheets: { data: ws }, SheetNames: [fileName] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, "Analysis" + fileExtension);
};
