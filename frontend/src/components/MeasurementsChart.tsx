import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import './MeasurementsChart.css';

export interface SeriesInfo {
    id: number | string;
    name: string;
    color: string;
    unit?: string | null;
}

export interface MeasurementData {
    id?: number | string;
    seriesId: number | string;
    value: number;
    timestamp: string;
}

interface MeasurementsChartProps {
    selectedSeriesObjects: SeriesInfo[];
    measurements: MeasurementData[];
    onHoverTimestamp?: (timestamp: string | null) => void;
    hoveredTimestamp?: string | null;
    hoveredCell?: { timestamp: string; seriesId: string | number } | null;
    onHoverCell?: (cell: { timestamp: string; seriesId: string | number } | null) => void;
}

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star'] as const;

const renderCustomDot = (
    shapeType: typeof SHAPES[number],
    color: string,
    seriesId: number | string,
    hoveredTimestamp?: string | null,
    hoveredCell?: { timestamp: string; seriesId: string | number } | null
) => {
    return (props: any) => {
        const { cx, cy, payload } = props;
        if (cx === undefined || cy === undefined) return null;

        const isRowHovered = hoveredTimestamp && payload?.timestamp === hoveredTimestamp;
        const isCellHovered = hoveredCell?.timestamp === payload?.timestamp && hoveredCell?.seriesId === seriesId;
        const isHighlighted = isCellHovered || isRowHovered;

        const size = isHighlighted ? 7 : 4;
        const key = `${payload?.timestamp}-${cx}-${cy}`;

        switch (shapeType) {
            case 'square':
                return (
                    <rect key={key} x={cx - size} y={cy - size} width={size * 2} height={size * 2} fill={color} stroke={isHighlighted ? '#000000' : '#ffffff'} strokeWidth={isHighlighted ? 2 : 1} />
                );
            case 'triangle':
                return (
                    <polygon
                        key={key}
                        points={`${cx},${cy - size} ${cx + size},${cy + size} ${cx - size},${cy + size}`}
                        fill={color}
                        stroke={isHighlighted ? '#000000' : '#ffffff'}
                        strokeWidth={isHighlighted ? 2 : 1}
                    />
                );
            case 'diamond':
                return (
                    <polygon
                        key={key}
                        points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
                        fill={color}
                        stroke={isHighlighted ? '#000000' : '#ffffff'}
                        strokeWidth={isHighlighted ? 2 : 1}
                    />
                );
            case 'star':
                // Corrected star offsets relative to center (cx, cy)
                return (
                    <polygon
                        key={key}
                        points={`${cx},${cy - 6} ${cx + 2},${cy - 2} ${cx + 6},${cy - 2} ${cx + 3},${cy + 1} ${cx + 5},${cy + 5} ${cx},${cy + 3} ${cx - 5},${cy + 5} ${cx - 3},${cy + 1} ${cx - 6},${cy - 2} ${cx - 2},${cy - 2}`}
                        fill={color}
                        stroke={isHighlighted ? '#000000' : '#ffffff'}
                        strokeWidth={isHighlighted ? 2 : 1}
                    />
                );
            case 'circle':
            default:
                return (
                    <circle key={key} cx={cx} cy={cy} r={size} fill={color} stroke={isHighlighted ? '#000000' : '#ffffff'} strokeWidth={isHighlighted ? 2 : 1} />
                );
        }
    };
};
export const MeasurementsChart: React.FC<MeasurementsChartProps> = ({
    selectedSeriesObjects,
    measurements,
    onHoverTimestamp,
    hoveredTimestamp,
    hoveredCell,
}) => {
    // Przetwarzanie danych: grupujemy pomiary po timestampie
    const chartData = useMemo(() => {
        const map = new Map<string, Record<string, any>>();

        measurements.forEach((m) => {
            if (!map.has(m.timestamp)) {
                map.set(m.timestamp, {
                    timestamp: m.timestamp
                });
            }
            const entry = map.get(m.timestamp)!;
            entry[`series_${m.seriesId}`] = Number(m.value); // Upewniamy się, że wartość to liczba
        });

        return Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }, [measurements]);

    // Formatowanie pełnej daty i godziny na osi X (np. "24.10, 14:30")
    const formatXAxis = (isoString: string) => {
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            return date.toLocaleString([], {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return isoString;
        }
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Responsywna legenda */}
            <div style={{ marginBottom: '10px' }}>
                <ul style={{ display: 'flex', justifyContent: 'center', listStyle: 'none', padding: 0, margin: 0, gap: '16px', flexWrap: 'wrap' }}>
                    {selectedSeriesObjects.map((series, index) => {
                        const shape = SHAPES[index % SHAPES.length];
                        const labelName = series.unit ? `${series.name} (${series.unit})` : series.name;

                        return (
                            <li key={series.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <svg width="12" height="12" style={{ display: 'inline-block' }}>
                                    {shape === 'square' && <rect x="1" y="1" width="10" height="10" fill={series.color} />}
                                    {shape === 'circle' && <circle cx="6" cy="6" r="5" fill={series.color} />}
                                    {shape === 'triangle' && <polygon points="6,1 11,11 1,11" fill={series.color} />}
                                    {shape === 'diamond' && <polygon points="6,1 11,6 6,11 1,6" fill={series.color} />}
                                    {shape === 'star' && <polygon points="6,1 7,4 11,4 8,6 9,10 6,8 3,10 4,6 1,4 5,4" fill={series.color} />}
                                </svg>
                                <span>{labelName}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Wykres */}
            <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -10, bottom: 35 }}
                        onMouseMove={(e: any) => {
                            if (e && e.activePayload && e.activePayload.length > 0) {
                                onHoverTimestamp?.(e.activePayload[0].payload.timestamp);
                            }
                        }}
                        onMouseLeave={() => onHoverTimestamp?.(null)}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                        {/* OŚ X: Pełna data i godzina z rotacją dla responsywności na 360px */}
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatXAxis}
                            stroke="#64748b"
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                            angle={-25}
                            textAnchor="end"
                            height={40}
                        />

                        {/* OŚ Y: Prawidłowe wartości numeryczne pomiarów */}
                        <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 11 }}
                            width={45}
                            domain={['auto', 'auto']}
                        />

                        <Tooltip
                            labelFormatter={(label) => {
                                try {
                                    return `Czas: ${new Date(label as string | number).toLocaleString()}`;
                                } catch {
                                    return `Czas: ${String(label)}`;
                                }
                            }}
                        />

                        {selectedSeriesObjects.map((series, index) => {
                            const shape = SHAPES[index % SHAPES.length];
                            const dataKey = `series_${series.id}`;

                            return (
                                <Line
                                    key={series.id}
                                    type="linear"
                                    dataKey={dataKey}
                                    stroke={series.color}
                                    strokeWidth={2}
                                    connectNulls={true}
                                    isAnimationActive={false}
                                    dot={renderCustomDot(shape, series.color, series.id, hoveredTimestamp, hoveredCell)}
                                    activeDot={{ r: 6, stroke: '#000', strokeWidth: 1 }}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};