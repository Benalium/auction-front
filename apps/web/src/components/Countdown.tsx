import { useEffect, useState } from "react";

interface CountdownProps {
  timeLeftSeconds?: number;
  endTime?: string;
  compact?: boolean;
}

function parseEndTime(endTime: string): number | null {
  const t = new Date(endTime).getTime();
  return isNaN(t) ? null : t;
}

function formatTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days} д. ${hours.toString().padStart(2, "0")} ч. ${minutes.toString().padStart(2, "0")} мин. ${secs.toString().padStart(2, "0")} сек.`;
  }
  if (hours > 0) {
    return `${hours} ч. ${minutes.toString().padStart(2, "0")} мин. ${secs.toString().padStart(2, "0")} сек.`;
  }
  return `${minutes} мин. ${secs.toString().padStart(2, "0")} сек.`;
}

export function Countdown({
  timeLeftSeconds: initialTime,
  endTime,
  compact,
}: CountdownProps) {
  const [seconds, setSeconds] = useState<number>(() => {
    if (typeof initialTime === "number" && initialTime >= 0) return initialTime;
    if (endTime) {
      const end = parseEndTime(endTime);
      if (end) {
        const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
        return left;
      }
    }
    return 0;
  });

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds]);

  if (seconds <= 0) {
    return (
      <span className={compact ? "countdown-compact" : ""}>
        Аукцион завершён
      </span>
    );
  }

  const label = compact ? null : "До конца: ";
  return (
    <span className={compact ? "countdown-compact" : ""}>
      {label}
      {formatTime(seconds)}
    </span>
  );
}
