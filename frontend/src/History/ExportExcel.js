import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

export const ExportExcel = ({excelData, fileName}) => {
    console.log(excelData)
    console.log(fileName)

    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const exportToExcel = (excelData, fileName) => {
        console.log("entered")
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    };

    return (
        <button className="ExportToExcel waves-effect waves-light btn" onClick={(e)=> exportToExcel(excelData,fileName)}>
        <i className="material-icons right">file_download</i>
        Export to Excel
        </button>
    );
};
