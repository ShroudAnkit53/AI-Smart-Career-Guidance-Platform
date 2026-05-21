import React from "react";

const SettingsDropdown = () => {
  return (
    <div
      style={{
        background: "#334155",
        padding: "10px",
        borderRadius: "6px",
        marginTop: "10px",
        animation: "slideDown 0.3s ease-out",
      }}
    >
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={itemStyle}>👤 Profile</li>
        <li style={itemStyle}>🔒 Logout</li>
        {/* <li style={itemStyle}>🌙 Dark Mode</li> */}
      </ul>
    </div>
  );
};

const itemStyle = {
  padding: "8px",
  cursor: "pointer",
  borderRadius: "4px",
};

export default SettingsDropdown;