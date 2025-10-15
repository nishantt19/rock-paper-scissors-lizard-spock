import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

type StatusVariant = "info" | "success" | "warning" | "error";

interface StatusMessageProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantConfig = {
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    icon: Info,
    iconColor: "text-blue-500",
  },
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
};

export function StatusMessage({
  variant,
  children,
  className = "",
}: StatusMessageProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const classes = `rounded-lg border p-4 ${config.bg} ${config.border} ${config.text} ${className}`;

  return (
    <div className={classes}>
      <div className="flex items-center justify-center gap-3">
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
        <div>{children}</div>
      </div>
    </div>
  );
}
