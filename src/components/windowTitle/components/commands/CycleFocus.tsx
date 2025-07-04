import { LayoutTemplate, SquareSquare } from "lucide-react";
import { IconButton } from "../IconButton";
import { CommandProps } from "./types/command";

// TODO: Make issue to GlazeWM to export window types.
export const ToggleFloating = ({ glazewm }: CommandProps) => {
  // Safety check for glazewm and focusedContainer structure
  if (!glazewm?.focusedContainer) {
    return null; // Don't render the button if we don't have a focused container
  }

  // Type assertion to handle runtime data structure that includes state
  const containerWithState = glazewm.focusedContainer as any;
  if (!containerWithState.state) {
    return null; // Don't render if no state property
  }

  const isFloating = containerWithState.state.type === "floating";
  const tooltipText = isFloating
    ? "Set window to tiling"
    : "Set window to floating";
  const command = "toggle-floating";

  return (
    <IconButton
      key={command}
      animateKey={isFloating ? "floating" : "not-floating"}
      title={tooltipText}
      onClick={() => glazewm?.runCommand(command)}
      icon={isFloating ? LayoutTemplate : SquareSquare}
    />
  );
};
