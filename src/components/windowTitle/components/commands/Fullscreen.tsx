import { Maximize, Minimize } from "lucide-react";
import { IconButton } from "../IconButton";
import { CommandProps } from "./types/command";

// TODO: Make issue to GlazeWM to export window types.
enum WindowType {
  TILING = "tiling",
  FLOATING = "floating",
  MINIMIZED = "minimized",
  FULLSCREEN = "fullscreen",
}

export const Floating = ({ glazewm }: CommandProps) => {
  // Safety check for glazewm and focusedContainer structure
  if (!glazewm?.focusedContainer) {
    return null; // Don't render the button if we don't have a focused container
  }

  // Type assertion to handle runtime data structure that includes state
  const containerWithState = glazewm.focusedContainer as any;
  if (!containerWithState.state) {
    return null; // Don't render if no state property
  }

  const tooltipText = "Toggle fullscreen state of window";
  const isFloating = containerWithState.state.type === WindowType.FLOATING;
  const command = isFloating ? "set-tiling" : "set-floating";
  console.log(containerWithState.state.type);

  return (
    <IconButton
      animateKey={isFloating ? "maximise" : "minimise"}
      key={command}
      title={tooltipText}
      onClick={() => glazewm?.runCommand(command)}
      icon={isFloating ? Minimize : Maximize}
    />
  );
};
