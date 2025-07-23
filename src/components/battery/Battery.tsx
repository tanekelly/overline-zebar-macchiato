import React from "react";
import { BatteryOutput } from "zebar";
import { Chip } from "../common/Chip";
import Stat from "../stat";
import { Battery as BatteryIcon, Zap } from "lucide-react";
import { cn } from "../../utils/cn";
import { useBatteryStatus } from "../../utils/useBatteryStatus";

interface BatteryProps {
  battery: BatteryOutput;
}

export function Battery({ battery }: BatteryProps) {
  const webBatteryStatus = useBatteryStatus();
  
  // Use web battery API if available and more recent, otherwise fall back to Zebar
  const currentBattery = webBatteryStatus || battery;
  const { chargePercent, isCharging } = currentBattery;
  
  // Debug logging to verify battery updates
  React.useEffect(() => {
    console.log("Battery updated:", { 
      chargePercent, 
      isCharging, 
      source: webBatteryStatus ? 'WebAPI' : 'Zebar' 
    });
  }, [chargePercent, isCharging, webBatteryStatus]);
  
  // Get battery icon - only show when not charging, always white
  const getBatteryIcon = () => {
    // Only show battery icon when not charging
    if (isCharging) {
      return null;
    }
    
    // Always white color regardless of charge level
    return <BatteryIcon className="h-3 w-3 text-icon" strokeWidth={3} />;
  };

  const percentageText = `${Math.round(chargePercent)}%`;

  return (
    <Chip className="flex items-center gap-1.5 h-full">
      {/* Show charging icon if plugged in (like reference code) */}
      {isCharging && (
        <Zap className="h-3 w-3 text-icon" strokeWidth={3} />
      )}
      {/* Show battery icon (always shown like reference code) */}
      {getBatteryIcon()}
      <p>{percentageText}</p>
    </Chip>
  );
} 