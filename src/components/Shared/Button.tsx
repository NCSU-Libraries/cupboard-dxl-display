import type { ButtonAppearance, IntentTypes } from "evergreen-ui";
import { Button as EverGreenButton } from "evergreen-ui";
import React from "react";

/**
 * Wraps an Evergreen UI Button, providing it with an onClick property.
 */

interface ButtonProperties {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  text?: string;
  appearance?: ButtonAppearance;
  className?: string;
  iconBefore?: JSX.Element;
  width?: number | string;
  height?: number | string;
  containerClass?: string;
  style?: React.CSSProperties;
  fontSize?: string;
  intent?: IntentTypes;
}
const Button = ({
  onClick,
  text,
  appearance,
  className,
  iconBefore,
  width,
  height,
  style,
  containerClass,
  fontSize,
  intent,
}: ButtonProperties): JSX.Element => {
  return (
    <div
      className={containerClass}
      onMouseUp={onClick}
      style={{ width: width, height: "100%" }}
    >
      <EverGreenButton
        appearance={appearance ?? "default"}
        //use evergreen's default button with if no width is provided
        className={className}
        cursor="pointer"
        fontSize={fontSize}
        height={height ?? undefined}
        iconBefore={iconBefore ?? undefined}
        intent={intent ?? "none"}
        style={style}
        width={width ?? undefined}
      >
        {text}
      </EverGreenButton>
    </div>
  );
};

export default Button;
