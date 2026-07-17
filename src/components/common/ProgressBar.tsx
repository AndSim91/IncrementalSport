interface ProgressBarProps {
  value: number;
  max?: number;
  className: string;
  label?: string;
  ariaHidden?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  label,
  ariaHidden = false,
}: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const boundedValue = Math.min(safeMax, Math.max(0, value));
  const percent = (boundedValue / safeMax) * 100;
  return (
    <div
      className={className}
      role={ariaHidden ? undefined : "progressbar"}
      aria-label={ariaHidden ? undefined : label}
      aria-hidden={ariaHidden || undefined}
      aria-valuemin={ariaHidden ? undefined : 0}
      aria-valuemax={ariaHidden ? undefined : safeMax}
      aria-valuenow={ariaHidden ? undefined : boundedValue}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
