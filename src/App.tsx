import { useEffect, useState } from "react";
import * as zebar from "zebar";
import { Center } from "./components/Center";
import { Chip } from "./components/common/Chip";
import Media from "./components/media";
import Stat from "./components/stat";
import { weatherThresholds } from "./components/stat/defaults/thresholds";
import { TilingControl } from "./components/TilingControl";
import VolumeControl from "./components/volume";
import { WindowTitle } from "./components/windowTitle/WindowTitle";
import { WorkspaceControls } from "./components/WorkspaceControls";
import "./styles/fonts.css";
import { useAutoTiling } from "./utils/useAutoTiling";
import { getWeatherIcon } from "./utils/weatherIcons";
import Systray from "./components/systray";
import { ChevronRight, Pause } from "lucide-react";
import { cn } from "./utils/cn";
import { Button } from "./components/common/Button";
import { motion, AnimatePresence } from "framer-motion";

const providers = zebar.createProviderGroup({
  media: { type: "media" },
  network: { type: "network" },
  glazewm: { type: "glazewm" },
  cpu: { type: "cpu" },
  date: { type: "date", formatting: "EEE d MMM h:mm a", locale: "en-GB" },
  memory: { type: "memory" },
  weather: { type: "weather" },
  audio: { type: "audio" },
  systray: { type: "systray" },
});

function App() {
  const [output, setOutput] = useState(providers.outputMap);

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));
  }, []);

  useAutoTiling();

  const statIconClassnames = "h-3 w-3 text-icon";

  // Check if glazewm is paused using the isPaused property
  const isGlazewmPaused = output.glazewm?.isPaused ?? false;

  // Debug logging to see what binding modes are available
  if (output.glazewm) {
    console.log("Current binding modes:", output.glazewm.bindingModes.map(mode => ({
      name: mode.name,
      displayName: mode.displayName
    })));
    console.log("Is glazewm paused:", isGlazewmPaused);
    
    // Log all available glazewm properties for debugging
    console.log("All glazewm properties:", Object.keys(output.glazewm));
    console.log("Full glazewm output:", output.glazewm);
  }

  return (
    <div className="relative flex justify-between items-center bg-background/80 border border-button-border/80 backdrop-blur-3xl text-text h-full antialiased select-none font-mono py-1.5">
      <div className="flex items-center gap-2 h-full z-10 pl-1.5">
        <div className="flex items-center gap-1.5 h-full">
          <TilingControl glazewm={output.glazewm} />
        </div>
        <div className="flex items-center gap-2 h-full">
          <WorkspaceControls glazewm={output.glazewm} />
        </div>
        <div className="flex items-center justify-center gap-2 h-full">
          <Media media={output.media} />
        </div>
      </div>

      <div className="absolute w-full h-full flex items-center justify-center left-0">
        <Center>
          <WindowTitle glazewm={output.glazewm} />
        </Center>
      </div>

      <div className="flex gap-2 items-center h-full z-10">
        <div className="flex items-center h-full">
          {output.glazewm && (
            <Button onClick={() => output.glazewm?.runCommand("toggle-tiling-direction")}>
              <AnimatePresence mode="popLayout">
                {isGlazewmPaused ? (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <Pause
                      className="h-3 w-3 transition-transform duration-200 ease-in-out"
                      strokeWidth={3}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="chevron"
                    initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 transition-transform duration-200 ease-in-out",
                        output.glazewm.tilingDirection === "vertical" ? "rotate-90" : ""
                      )}
                      strokeWidth={3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          )}
        </div>
        <div className="flex items-center h-full">
          {/* TODO: Extract to component */}
          <Chip
            className="flex items-center gap-3 h-full"
            as="button"
            onClick={() => {
              output.glazewm?.runCommand("shell-exec taskmgr");
            }}
          >
            {output.cpu && (
              <Stat
                Icon={<p className="font-medium text-icon">CPU</p>}
                stat={`${Math.round(output.cpu.usage)}%`}
                type="ring"
              />
            )}

            {output.memory && (
              <Stat
                Icon={<p className="font-medium text-icon">RAM</p>}
                stat={`${Math.round(output.memory.usage)}%`}
                type="ring"
              />
            )}

            {output.weather && (
              <Stat
                Icon={getWeatherIcon(output.weather, statIconClassnames)}
                stat={`${Math.round(output.weather.celsiusTemp)}°C`}
                threshold={weatherThresholds}
                type="inline"
              />
            )}
          </Chip>
        </div>

        <div className="flex items-center h-full">
          <VolumeControl
            playbackDevice={output.audio?.defaultPlaybackDevice}
            setVolume={output.audio?.setVolume}
            statIconClassnames={statIconClassnames}
          />
        </div>


        <div className="h-full flex items-center px-0.5 pr-1">
          <Systray systray={output.systray} />
        </div>

        <div className="h-full flex items-center justify-center pr-2">
          {output?.date?.formatted ??
            new Intl.DateTimeFormat("en-GB", {
              weekday: "short", // EEE
              day: "numeric", // d
              month: "short", // MMM
              hour: "numeric", // h
              minute: "numeric", // mm
              hour12: true, // a (AM/PM)
            })
              .format(new Date())
              .replace(/,/g, "")}
        </div>
      </div>
    </div>
  );
}

export default App;
