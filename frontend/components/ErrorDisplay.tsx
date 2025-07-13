import React from "react";

export interface ErrorDisplayProps {
  title?: string;
  message: string;
}

const containerStyle: React.CSSProperties = {
  border: "1px solid red",
  padding: "1rem",
  backgroundColor: "#ffe6e6",
  borderRadius: "4px",
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ title = "Error", message }) => (
  <div style={containerStyle}>
    <h2>{title}</h2>
    <p>{message}</p>
  </div>
);

export default ErrorDisplay;
