import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from 'recharts';
import './MeasurementsChart.css';

export interface SeriesInfo {
    id: string | number;
    name: string;
    unit?: string;
    color?: string;
}

export interface MeasurementData {
    timestamp: string;
    seriesId: string | number;
    value: number | string;
    [key: string]: any;
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
    const chartData = useMemo(() => {
        const map = new Map<string, Record<string, any>>();

        measurements.forEach((m) => {
            if (!map.has(m.timestamp)) {
                map.set(m.timestamp, {
                    timestamp: m.timestamp
                });
            }
            const entry = map.get(m.timestamp)!;
            entry[`series_${m.seriesId}`] = Number(m.value);
        });

        return Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }, [measurements]);

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
        <div className="measurements-chart-wrapper">
            {/* Responsywna legenda */}
            <div className="chart-legend-container">
                <ul className="chart-legend-list">
                    {selectedSeriesObjects.map((series, index) => {
                        const shape = SHAPES[index % SHAPES.length];
                        const labelName = series.unit ? `${series.name} (${series.unit})` : series.name;
                        const seriesColor = series.color || '#006666';

                        return (
                            <li key={series.id} className="chart-legend-item">
                                <svg width="12" height="12" className="chart-legend-svg">
                                    {shape === 'square' && <rect x="1" y="1" width="10" height="10" fill={seriesColor} />}
                                    {shape === 'circle' && <circle cx="6" cy="6" r="5" fill={seriesColor} />}
                                    {shape === 'triangle' && <polygon points="6,1 11,11 1,11" fill={seriesColor} />}
                                    {shape === 'diamond' && <polygon points="6,1 11,6 6,11 1,6" fill={seriesColor} />}
                                    {shape === 'star' && <polygon points="6,1 7,4 11,4 8,6 9,10 6,8 3,10 4,6 1,4 5,4" fill={seriesColor} />}
                                </svg>
                                <span>{labelName}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Wykres z wymuszoną wysokością */}
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 15, right: 15, left: -10, bottom: 35 }}
                        onMouseMove={(e: any) => {
                            if (e && e.activePayload && e.activePayload.length > 0) {
                                onHoverTimestamp?.(e.activePayload[0].payload.timestamp);
                            }
                        }}
                        onMouseLeave={() => onHoverTimestamp?.(null)}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatXAxis}
                            stroke="#64748b"
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            interval="preserveStartEnd"
                            angle={-25}
                            textAnchor="end"
                            height={40}
                            tickLine={{ stroke: '#cbd5e1' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                        />

                        <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            width={45}
                            domain={['auto', 'auto']}
                            tickLine={{ stroke: '#cbd5e1' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                        />

                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload || payload.length === 0) return null;

                                let formattedTime = label;
                                try {
                                    formattedTime = new Date(label).toLocaleString();
                                } catch {}

                                return (
                                    <div className="custom-chart-tooltip">
                                        <div className="tooltip-time">Czas: {formattedTime}</div>
                                        <div className="tooltip-items">
                                            {payload.map((item: any) => {
                                                const dataKey = item.dataKey;
                                                const seriesId = dataKey.replace('series_', '');
                                                const seriesObj = selectedSeriesObjects.find(s => String(s.id) === String(seriesId));
                                                
                                                const seriesName = seriesObj ? seriesObj.name : `Seria ${seriesId}`;
                                                const seriesUnit = seriesObj?.unit ? ` ${seriesObj.unit}` : '';
                                                const seriesColor = item.color || seriesObj?.color || '#006666';

                                                return (
                                                    <div key={dataKey} className="tooltip-item" style={{ color: seriesColor }}>
                                                        <span className="tooltip-series-name">{seriesName}:</span>
                                                        <span className="tooltip-series-value">
                                                            {item.value}{seriesUnit}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }}
                        />

                        {selectedSeriesObjects.map((series, index) => {
                            const shape = SHAPES[index % SHAPES.length];
                            const dataKey = `series_${series.id}`;
                            const seriesColor = series.color || '#006666';

                            return (
                                <Line
                                    key={series.id}
                                    type="linear"
                                    dataKey={dataKey}
                                    stroke={seriesColor}
                                    strokeWidth={2}
                                    dot={renderCustomDot(shape, seriesColor, series.id, hoveredTimestamp, hoveredCell)}
                                    activeDot={{ r: 7, stroke: '#000000', strokeWidth: 1.5, fill: seriesColor }}
                                    connectNulls={true}
                                    isAnimationActive={false}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};