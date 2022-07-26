import "../../css/clock.css";

import { HandUpIcon } from "evergreen-ui";
import React, { useEffect, useState } from "react";

import { useToggle } from "../../hooks";
import HowToUsePopUp from "../HowToUse/HowToUsePopUp";
import Button from "../Shared/Button";

/**
 * Simple clock widget for displaying the current time.
 */
const HowToUse = (): JSX.Element => {
  const [date, setDate] = useState(new Date());

  const containerStyle = {
    backgroundColor: "blue",
    boxSizing: "border-box",
    color: "white",
    fontSize: "9vmin",
    fontWeight: 600,
    height: "100%",
    width: "100%",
  } as React.CSSProperties;

  const [visible, toggleVisible] = useToggle(false);

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
    <div id="how-to-use-button-widget" style={containerStyle}>
      <HowToUsePopUp active={visible} onClose={toggleVisible} />
      <Button
        appearance="primary"
        className="how-to-use-button"
        fontSize="xx-large"
        height="100%"
        iconBefore={<HandUpIcon />}
        onClick={toggleVisible}
        text="Learn how to use this display"
        width="100%"
      />
    </div>
  );
};

export default HowToUse;
