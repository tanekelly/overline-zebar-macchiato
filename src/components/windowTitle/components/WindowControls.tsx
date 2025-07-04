import React from "react";
import { GlazeWmOutput } from "zebar";
import { Chip } from "../../common/Chip";
import { ConditionalPanel } from "../../common/ConditionalPanel";
import { CopyProcessName } from "./commands/CopyProcessName";
import { ToggleFloating } from "./commands/CycleFocus";

interface WindowControlsProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  glazewm: GlazeWmOutput | null;
  parentRef: React.ForwardedRef<HTMLButtonElement>;
}

export function WindowControls({ glazewm, ...props }: WindowControlsProps) {
  const ref = React.useRef<HTMLButtonElement>(null);

  // Safety check - don't render controls if no valid glazewm data
  if (!glazewm) {
    return null;
  }

  // Check if there are any valid controls to show
  const controlList = <ControlList glazewm={glazewm} />;
  if (!controlList) {
    return null; // Don't render anything if no valid controls
  }

  return (
    <ConditionalPanel sessionActive={props.show}>
      <Chip
        as="button"
        className="mx-2.5 h-fit py-1"
        ref={ref}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
        }}
      >
        {controlList}
      </Chip>
    </ConditionalPanel>
  );
}

/**
 * TODO: Investigate controls. At the moment, I can't find an accurate state to bind controls to.
 * For example, when setting a window to be floating, the type of the window is not updated until
 * the user brings the window forward with ALT+SHIFT+SPACE.
 * I may have to use the WebSocket API to get a more responsive state.
 * I am currently avoiding tracking any state locally and then replicating it to GlazeWM, as it could cause desync issues.
 */
const ControlList = ({ glazewm }: { glazewm: GlazeWmOutput | null }) => {
  // Safety check - only show controls if we have a valid focused container
  if (!glazewm?.focusedContainer) {
    return null;
  }

  const controls = [CopyProcessName, ToggleFloating];

  // Filter out controls that return null (no valid state to show)
  const validControls = controls
    .map(Control => <Control key={Control.name} glazewm={glazewm} />)
    .filter(control => control !== null);

  // If no valid controls, return null
  if (validControls.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5">
      {validControls}
    </div>
  );
};
