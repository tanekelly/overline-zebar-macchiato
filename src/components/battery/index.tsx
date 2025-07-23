import { BatteryOutput } from "zebar";
import { Battery } from "./Battery";

interface BatteryProps {
  battery: BatteryOutput | null;
}

export default function BatteryComponent({ battery }: BatteryProps) {
  if (!battery) return null;

  return <Battery battery={battery} />;
} 