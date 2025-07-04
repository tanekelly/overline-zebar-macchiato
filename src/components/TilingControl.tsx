import { ChevronRight, Search } from "lucide-react";
import { cn } from "../utils/cn";
import { Button } from "./common/Button";
import { GlazeWmOutput } from "zebar";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "../context/ConfigContext";

interface TilingControlProps {
  glazewm: GlazeWmOutput | null;
}

export function TilingControl({ glazewm }: TilingControlProps) {
  const { flowLauncherPath, isLoading } = useConfig();
  
  if (!glazewm) return null;

  return (
    <>
      <AnimatePresence>
        {glazewm.bindingModes.map((bindingMode) => (
          <motion.div
            key={bindingMode.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <Button>{bindingMode.displayName ?? bindingMode.name}</Button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* <Button
        onClick={() => {
          if (flowLauncherPath && !isLoading) {
            console.log("Flow Launcher path:", flowLauncherPath);
            glazewm.runCommand(`shell-exec ${flowLauncherPath}`);
          } else if (isLoading) {
            console.warn("Configuration is still loading...");
          } else {
            console.warn("Flow Launcher path not configured in config.json");
          }
        }}
      >
        <Search strokeWidth={3} className="h-3 w-3" />
      </Button> */}

      <Button onClick={() => glazewm.runCommand("toggle-tiling-direction")}>
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform duration-200 ease-in-out",
            glazewm.tilingDirection === "vertical" ? "rotate-90" : ""
          )}
          strokeWidth={3}
        />
      </Button>
    </>
  );
}
