import { useState, useEffect } from "react";

interface BatteryStatus {
  chargePercent: number;
  isCharging: boolean;
}

export function useBatteryStatus() {
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus | null>(null);

  useEffect(() => {
    let battery: any = null;

    const updateBatteryStatus = (bat: any) => {
      setBatteryStatus({
        chargePercent: Math.round(bat.level * 100),
        isCharging: bat.charging,
      });
    };

    const setupBatteryAPI = async () => {
      try {
        // Use the Battery API if available (Chrome/Edge)
        if ('getBattery' in navigator) {
          battery = await (navigator as any).getBattery();
          updateBatteryStatus(battery);

          // Listen for battery events
          battery.addEventListener('chargingchange', () => {
            console.log('Charging status changed:', battery.charging);
            updateBatteryStatus(battery);
          });
          
          battery.addEventListener('levelchange', () => {
            console.log('Battery level changed:', battery.level);
            updateBatteryStatus(battery);
          });
        }
      } catch (error) {
        console.log('Battery API not available:', error);
      }
    };

    setupBatteryAPI();

    return () => {
      if (battery) {
        battery.removeEventListener('chargingchange', updateBatteryStatus);
        battery.removeEventListener('levelchange', updateBatteryStatus);
      }
    };
  }, []);

  return batteryStatus;
} 