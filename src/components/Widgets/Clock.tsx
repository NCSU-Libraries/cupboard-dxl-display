import "../../css/clock.css";

import React, { useEffect, useState } from "react";

/**
 * Simple clock widget for displaying the current time.
 */
const Clock = (): JSX.Element => {
  const [date, setDate] = useState(new Date());

  const containerStyle = {
    boxSizing: "border-box",
    color: "white",
    fontWeight: 600,
    height: "100%",
    overflow: "hidden",
    padding: "3vmin",
    width: "100%",
  } as React.CSSProperties;

  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    return function cleanup() {
      clearInterval(timerID);
    };
  });

  function tick(): void {
    setDate(new Date());
  }

  return (
    <div style={containerStyle}>
      <div style={{ color: "white", fontSize: "8vmin" }}>
        Data Experience Lab
      </div>
      <div style={{ color: "white", fontSize: "8vmin" }}>
        {date.toLocaleTimeString("en-IT", { hour12: true, timeStyle: "short" })}
      </div>
    </div>
  );
};

export default Clock;
