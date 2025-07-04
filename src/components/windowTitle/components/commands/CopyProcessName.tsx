import { Check, Clipboard } from "lucide-react";
import { useState } from "react";
import { GlazeWmOutput } from "zebar";
import { ContainerType } from "../../WindowTitle";
import { IconButton } from "../IconButton";
import { CommandProps } from "./types/command";

const getWindowProcess = (glazewm: GlazeWmOutput | null): string | null => {
  if (!glazewm) return null;
  const focusedContainer = glazewm.focusedContainer;

  if (focusedContainer.type === ContainerType.WINDOW) {
    return focusedContainer.processName;
  }

  return null;
};

export const CopyProcessName = ({ glazewm }: CommandProps) => {
  const tooltipText = "Copy process name of the window";
  const [copying, setCopying] = useState(false);

  // Safety check - don't render if no valid glazewm data
  if (!glazewm) {
    return null;
  }

  // Check if there's actually a process name to copy
  const processName = getWindowProcess(glazewm);
  if (!processName) {
    return null; // Don't render the button if there's no process name
  }

  const handleCopyProcessName = () => {
    navigator.clipboard
      .writeText(processName)
      .then(() => {
        console.log(`Copied to clipboard: ${processName}`);
        setCopying(true);
        setTimeout(() => setCopying(false), 750);
      })
      .catch((err) => {
        console.error("Failed to copy text to clipboard:", err);
      });
  };

  return (
    <IconButton
      animateKey={copying ? "copying" : "not-copying"}
      title={tooltipText}
      onClick={handleCopyProcessName}
      icon={copying ? Check : Clipboard}
    />
  );
};
