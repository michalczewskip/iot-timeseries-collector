
import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

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
}

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star'] as const;

const renderCustomDot = (shapeType: typeof SHAPES[number], color: string) => {
    return (props: any) => {
        const { cx, cy, payload } = props;
        if (cx === undefined || cy === undefined) return null;

        const size = 5;
        const key = `${payload?.timestamp}-${cx}-${cy}`;

        switch (shapeType) {
            case 'square':
                return (
                    <rect
                        key={key}
                        x={cx - size}
                        y={cy - size}
                        width={size * 2}
                        height={size * 2}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                    />
                );
            case 'triangle':
                return (
                    <polygon
                        key={key}
                        points={`${cx},${cy - size - 1} ${cx - size},${cy + size} ${cx + size},${cy + size}`}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                    />
                );
            case 'diamond':
                return (
                    <polygon
                        key={key}
                        points={`${cx},${cy - size - 2} ${cx + size + 1},${cy} ${cx},${cy + size + 2} ${cx - size - 1},${cy}`}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                    />
                );
            case 'star':
                return (
                    <polygon
                        key={key}
                        points={`${cx},${cy - 6} ${cx + 2},${cy - 2} ${cx + 6},${cy - 2} ${cx + 3},${cy + 1} ${cx + 4},${cy + 5} ${cx},${cy + 3} ${cx - 4},${cy + 5} ${cx - 3},${cy + 1} ${cx - 6},${cy - 2} ${cx - 2},${cy - 2}`}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                    />
                );
            case 'circle':
            default:
                return (
                    <circle
                        key={key}
                        cx={cx}
                        cy={cy}
                        r={size}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                    />
                );
        }
    };
};

export const MeasurementsChart: React.FC<MeasurementsChartProps> = ({
    selectedSeriesObjects,
    measurements,
    onHoverTimestamp,
}) => {
    const chartData = useMemo(() => {
        const map = new Map<string, Record<string, any>>();

        measurements.forEach((m) => {
            if (!map.has(m.timestamp)) {
                map.set(m.timestamp, { timestamp: m.timestamp });
            }
            const entry = map.get(m.timestamp)!;
            entry[`series_${m.seriesId}`] = m.value;
        });

        return Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }, [measurements]);

    const formatXAxis = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return isoString;
        }
    };

    return (
        <div className="chart-wrapper" style={{ width: '100%', height: '380px', minHeight: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 15, right: 30, left: 0, bottom: 25 }}
                    onMouseMove={(e: any) => {
                        if (e && e.activePayload && e.activePayload.length > 0) {
                            onHoverTimestamp?.(e.activePayload[0].payload.timestamp);
                        }
                    }}
                    onMouseLeave={() => onHoverTimestamp?.(null)}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatXAxis}
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Czas pomiaru', position: 'insideBottom', offset: -15, fill: '#64748b' }}
                    />

                    <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Wartość', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                    />
                    <Tooltip
                        labelFormatter={(label) => {
                            if (typeof label === 'string' || typeof label === 'number') {
                                return `Czas: ${new Date(label).toLocaleString()}`;
                            }
                            return '';
                        }}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />


                    <Legend
                        wrapperStyle={{ top: 0, left: 0, right: 0, paddingBottom: '15px', textAlign: 'center' }}
                        content={(props) => {
                            const { payload } = props;

                            return (
                                <ul style={{ display: 'flex', justifyContent: 'center', listStyle: 'none', padding: 0, margin: 0, gap: '20px', flexWrap: 'wrap' }}>
                                    {payload?.map((entry: any, index: number) => {
                                        const shape = SHAPES[index % SHAPES.length];
                                        const color = entry.color;

                                        return (
                                            <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                                                <svg width="12" height="12" style={{ display: 'inline-block' }}>
                                                    {shape === 'square' && (
                                                        <rect x="1" y="1" width="10" height="10" fill={color} />
                                                    )}
                                                    {shape === 'circle' && (
                                                        <circle cx="6" cy="6" r="5" fill={color} />
                                                    )}
                                                    {shape === 'triangle' && (
                                                        <polygon points="6,1 11,11 1,11" fill={color} />
                                                    )}
                                                    {shape === 'diamond' && (
                                                        <polygon points="6,1 11,6 6,11 1,6" fill={color} />
                                                    )}
                                                    {shape === 'star' && (
                                                        <polygon points="6,1 7,4 11,4 8,6 9,10 6,8 3,10 4,6 1,4 5,4" fill={color} />
                                                    )}
                                                </svg>
                                                <span style={{ color: '#334155' }}>{entry.value}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            );
                        }}
                    />
                    {selectedSeriesObjects.map((series, index) => {
                        const shape = SHAPES[index % SHAPES.length];
                        const dataKey = `series_${series.id}`;
                        const labelName = series.unit ? `${series.name} (${series.unit})` : series.name;

                        return (
                            <Line
                                key={series.id}
                                type="monotone"
                                dataKey={dataKey}
                                name={labelName}
                                stroke={series.color || '#2563eb'}
                                strokeWidth={2.5}
                                connectNulls={true}
                                dot={renderCustomDot(shape, series.color || '#2563eb')}
                                activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
