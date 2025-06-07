import React from "react";

export const spinnerIcon = () => {
    const containerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
        width: "70vw",
        backgroundColor: "rgba(0, 0, 0, 0)"
    };

    const spinnerStyle = {
        width: "50px",
        height: "50px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #3498db",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    };

    return (
        <div style={containerStyle}>
            <div style={spinnerStyle}></div>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};
