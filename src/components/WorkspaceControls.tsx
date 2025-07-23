import { motion } from "framer-motion";
import { Workspace } from "glazewm";
import useMeasure from "react-use-measure";
import { GlazeWmOutput } from "zebar";
import { cn } from "../utils/cn";
import { buttonStyles } from "./common/Button";
import { Chip } from "./common/Chip";
import { getWorkspaceNameFromProcesses, extractProcessesFromWorkspace } from "../utils/workspaceNameMatcher";

type WorkspaceControlsProps = {
  glazewm: GlazeWmOutput | null;
}
export function WorkspaceControls({ glazewm }: WorkspaceControlsProps) {
  if (!glazewm) return;
  const workspaces = glazewm.currentWorkspaces;

  const [ref, { width }] = useMeasure();
  const springConfig = {
    type: "spring",
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  };

  const handleWheel = (e: React.WheelEvent<HTMLButtonElement>) => {
    const delta = e.deltaY > 0 ? 1 : -1;
    const workspaceName = workspaces.indexOf(glazewm.focusedWorkspace);
    const newWorkspaceName = workspaces[workspaceName + delta]?.name;

    if (workspaces[workspaceName + delta]) {
      glazewm.runCommand(`focus --workspace ${newWorkspaceName}`);
    } else {
      const command =
        delta > 0 ? "focus --next-workspace" : "focus --prev-workspace";
      glazewm.runCommand(command);
    }
  };

  return (
    <motion.div
      key="workspace-control-panel"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: width || "auto", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={springConfig}
      className="relative overflow-hidden h-full"
    >
      <Chip
        className={cn(
          width ? "absolute" : "relative",
          "flex items-center gap-1.5 select-none overflow-hidden px-1 h-full"
        )}
        as="div"
        ref={ref}
        onWheel={handleWheel}
      >
        {workspaces.map((workspace: Workspace, index: number) => {
          const isFocused = workspace.hasFocus;
          
          // Extract processes from the workspace
          const { appNames: workspaceApps, processNames: workspaceProcesses } = extractProcessesFromWorkspace(workspace);
          
          // Get custom workspace name based on processes
          const customWorkspaceName = getWorkspaceNameFromProcesses(workspaceApps, workspaceProcesses, workspace.name);
          
          // Use custom name if available, otherwise fall back to displayName or name
          const displayName = customWorkspaceName ?? workspace.displayName ?? workspace.name;
          
          return (
            <div key={workspace.name} className="flex items-center">
              <button
                onClick={() =>
                  glazewm.runCommand(`focus --workspace ${workspace.name}`)
                }
                className={cn(
                  "relative rounded-xl px-1.5 transition duration-500 ease-in-out text-text-muted h-full max-w-[120px]",
                  isFocused ? "" : "hover:text-text",
                  isFocused &&
                  "text-text duration-700 transition-all ease-in-out font-medium"
                )}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <p className={cn("z-10 whitespace-nowrap overflow-hidden text-ellipsis")}>
                  {displayName}
                </p>

                {isFocused && (
                  <motion.span
                    layoutId="bubble"
                    className={cn(
                      buttonStyles,
                      "bg-primary border-primary-border drop-shadow-sm rounded-xl absolute inset-0 -z-10",
                      isFocused && "hover:bg-primary"
                    )}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              
              {/* Add separator between workspaces (except after the last one) */}
              {index < workspaces.length - 1 && (
                <div className="w-px h-4 bg-border/30 mx-1" />
              )}
            </div>
          );
        })}
      </Chip>
    </motion.div>
  );
}
