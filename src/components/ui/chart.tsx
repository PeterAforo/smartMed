import React from "react";
import { cn } from "@/lib/utils";

// Chart configuration for consistent theming
export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
    theme?: {
      light: string;
      dark: string;
    };
  };
}

// Chart container component
interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  config?: ChartConfig;
}

export function ChartContainer({ children, className = "", config }: ChartContainerProps) {
  const chartColors = React.useMemo(() => {
    if (!config) return {};
    
    const colors: Record<string, string> = {};
    Object.entries(config).forEach(([key, value]) => {
      colors[`--chart-${key}`] = `hsl(${value.color})`;
    });
    
    return colors;
  }, [config]);

  return (
    <div 
      className={cn("w-full", className)} 
      style={chartColors}
      data-config={JSON.stringify(config)}
    >
      {children}
    </div>
  );
}

// Chart tooltip components
interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  config?: ChartConfig;
}

export function ChartTooltip({ active, payload, label, config }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      {label && (
        <p className="font-medium text-foreground mb-2">{label}</p>
      )}
      {payload.map((entry, index) => {
        const configItem = config?.[entry.dataKey];
        return (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {configItem?.label || entry.dataKey}:
            </span>
            <span className="font-medium text-foreground">
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString() 
                : entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ChartTooltipContent() {
  return ChartTooltip;
}

// Chart legend components
interface ChartLegendProps {
  payload?: any[];
  config?: ChartConfig;
}

export function ChartLegend({ payload, config }: ChartLegendProps) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {payload.map((entry, index) => {
        const configItem = config?.[entry.dataKey];
        return (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {configItem?.label || entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ChartLegendContent() {
  return ChartLegend;
}

// Healthcare-themed chart colors using design system
export const healthcareChartColors = {
  primary: "214 88% 27%",      // Primary blue
  secondary: "159 42% 35%",    // Mint green  
  success: "142 69% 35%",      // Medical green
  warning: "38 92% 50%",       // Medical amber
  destructive: "0 84% 60%",    // Medical red
  muted: "215 25% 45%",        // Muted foreground
  accent: "214 88% 50%",       // Lighter blue
  info: "200 85% 45%",         // Info blue
};

// Predefined chart configurations for common healthcare metrics
export const appointmentChartConfig: ChartConfig = {
  total: {
    label: "Total Appointments",
    color: healthcareChartColors.primary,
  },
  completed: {
    label: "Completed",
    color: healthcareChartColors.success,
  },
  cancelled: {
    label: "Cancelled",
    color: healthcareChartColors.destructive,
  },
  noShow: {
    label: "No Show",
    color: healthcareChartColors.warning,
  },
};

export const revenueChartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: healthcareChartColors.primary,
  },
  paid: {
    label: "Paid",
    color: healthcareChartColors.success,
  },
  pending: {
    label: "Pending",
    color: healthcareChartColors.warning,
  },
};

export const patientChartConfig: ChartConfig = {
  new: {
    label: "New Patients",
    color: healthcareChartColors.primary,
  },
  returning: {
    label: "Returning Patients",
    color: healthcareChartColors.secondary,
  },
  pediatric: {
    label: "Pediatric",
    color: healthcareChartColors.info,
  },
  senior: {
    label: "Senior",
    color: healthcareChartColors.accent,
  },
};

// Chart context hook for accessing configuration
const ChartContext = React.createContext<{ config?: ChartConfig }>({});

export function useChart() {
  const context = React.useContext(ChartContext);
  return context;
}