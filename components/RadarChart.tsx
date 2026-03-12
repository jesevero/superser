import { View, Text, StyleSheet } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";

type RadarDataPoint = {
  label: string;
  value: number; // 0-5
  color: string;
};

type Props = {
  data: RadarDataPoint[];
  size?: number;
  maxValue?: number;
};

export default function RadarChart({ data, size = 320, maxValue = 5 }: Props) {
  if (data.length < 3) return null;

  const center = size / 2;
  const radius = size * 0.28;
  const labelRadius = radius + 40;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2; // start from top

  function getPoint(index: number, value: number): [number, number] {
    const angle = startAngle + index * angleStep;
    const r = (value / maxValue) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  }

  // Grid levels (1-5)
  const levels = [1, 2, 3, 4, 5];

  // Data polygon points
  const dataPoints = data.map((d, i) => getPoint(i, d.value || 0));
  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(" ");

  // Average
  const validValues = data.filter((d) => d.value > 0);
  const avg = validValues.length > 0 ? validValues.reduce((s, d) => s + d.value, 0) / validValues.length : 0;
  const avgColor = avg >= 4 ? "#2E7D32" : avg >= 3 ? "#C37800" : avg >= 2 ? "#E65100" : "#CC0000";

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Grid polygons */}
        {levels.map((level) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const [x, y] = getPoint(i, level);
            return `${x},${y}`;
          }).join(" ");
          return (
            <Polygon
              key={`grid-${level}`}
              points={pts}
              fill="none"
              stroke={level === 5 ? "#CCC" : "#E8E8E8"}
              strokeWidth={level === 5 ? 1.5 : 0.8}
            />
          );
        })}

        {/* Axis lines */}
        {data.map((_, i) => {
          const [x, y] = getPoint(i, maxValue);
          return <Line key={`axis-${i}`} x1={center} y1={center} x2={x} y2={y} stroke="#DDD" strokeWidth={0.8} />;
        })}

        {/* Data polygon */}
        {validValues.length > 0 && (
          <Polygon
            points={dataPolygon}
            fill="rgba(30, 58, 95, 0.15)"
            stroke="#1E3A5F"
            strokeWidth={2.5}
          />
        )}

        {/* Data points */}
        {data.map((d, i) => {
          if (d.value <= 0) return null;
          const [x, y] = getPoint(i, d.value);
          const dotColor = d.value >= 4 ? "#2E7D32" : d.value >= 3 ? "#C37800" : "#CC0000";
          return <Circle key={`dot-${i}`} cx={x} cy={y} r={4} fill={dotColor} stroke="#FFF" strokeWidth={2} />;
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const angle = startAngle + i * angleStep;
          const lx = center + labelRadius * Math.cos(angle);
          const ly = center + labelRadius * Math.sin(angle);
          const anchor = Math.abs(Math.cos(angle)) < 0.1 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
          return (
            <SvgText
              key={`label-${i}`}
              x={lx}
              y={ly + 4}
              textAnchor={anchor}
              fontSize={11}
              fontWeight="600"
              fill={d.value > 0 ? "#1E3A5F" : "#BBB"}
            >
              {d.label}
            </SvgText>
          );
        })}

        {/* Center score */}
        {validValues.length > 0 && (
          <>
            <Circle cx={center} cy={center} r={20} fill="#FFF" stroke={avgColor} strokeWidth={2} />
            <SvgText
              x={center}
              y={center + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight="800"
              fill={avgColor}
            >
              {avg.toFixed(1)}
            </SvgText>
          </>
        )}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {data.map((d, i) => {
          const valColor = d.value >= 4 ? "#2E7D32" : d.value >= 3 ? "#C37800" : d.value > 0 ? "#CC0000" : "#CCC";
          return (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: d.color }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>{d.label}</Text>
              <Text style={[styles.legendValue, { color: valColor }]}>
                {d.value > 0 ? d.value.toFixed(1) : "—"}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 8 },
  legend: { width: "100%", marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { flex: 1, fontSize: 13, color: "#444" },
  legendValue: { fontSize: 14, fontWeight: "700", minWidth: 32, textAlign: "right" },
});
