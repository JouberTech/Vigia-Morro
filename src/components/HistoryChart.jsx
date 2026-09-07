import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useId } from "react";
import { number, time, dateTime } from "../utils/format";
export default function HistoryChart({
  points,
  dataKey = "soilMoisture",
  label = "Umidade",
  unit = "%",
  color = "#318674",
  hours = 24,
  height = 225,
}) {
  const timeline = points.map((point) => ({
    ...point,
    timeMs: new Date(point.timestamp).getTime(),
  }));
  const gradient = `chart-${useId().replace(/:/g, "")}`;
  return (
    <div
      className="history-chart"
      role="img"
      aria-label={`Histórico de ${label.toLowerCase()} nas últimas ${hours} horas. ${points.length} amostras simuladas.`}
    >
      <ResponsiveContainer width="100%" height={height} minWidth={0}>
        <AreaChart
          data={timeline}
          margin={{ top: 14, right: 12, bottom: 0, left: -22 }}
        >
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0.015} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 4"
            vertical={false}
            stroke="#e9edf0"
          />
          <XAxis
            dataKey="timeMs"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) =>
              hours > 24 ? dateTime(value).slice(0, 5) : time(value)
            }
            minTickGap={35}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#7b878b", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            domain={
              dataKey === "soilMoisture" || dataKey === "riskIndex"
                ? [0, 100]
                : [0, "auto"]
            }
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#7b878b", fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={dateTime}
            formatter={(value) => [`${number(value, 1)} ${unit}`, label]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e5ebea",
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradient})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <span className="sr-only">
        Última leitura: {number(points.at(-1)?.[dataKey], 1)} {unit}.
      </span>
    </div>
  );
}
