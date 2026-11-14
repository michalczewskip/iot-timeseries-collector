import React, { useMemo } from 'react';
import { type SeriesInfo, type MeasurementData } from './MeasurementsChart';
import './MeasurementsTable.css';

interface MeasurementsTableProps {
    selectedSeriesObjects: SeriesInfo[];
    measurements: MeasurementData[];
    hoveredTimestamp: string | null;
    onHoverTimestamp: (timestamp: string | null) => void;
    hoveredCell?: { timestamp: string; seriesId: string | number } | null;
    onHoverCell?: (cell: { timestamp: string; seriesId: string | number } | null) => void;
}

export const MeasurementsTable: React.FC<MeasurementsTableProps> = ({
    selectedSeriesObjects,
    measurements,
    hoveredTimestamp,
    onHoverTimestamp,
    hoveredCell,
    onHoverCell,
}) => {
    const tableData = useMemo(() => {
        const map = new Map<string, Record<string, any>>();

        measurements.forEach((m) => {
            if (!map.has(m.timestamp)) {
                map.set(m.timestamp, { timestamp: m.timestamp });
            }
            const entry = map.get(m.timestamp)!;
            entry[m.seriesId] = m.value;
        });

        return Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }, [measurements]);

    if (tableData.length === 0) {
        return (
            <div className="measurements-table-empty">
                Brak danych pomiarowych do wyświetlenia w tabeli.
            </div>
        );
    }

    return (
        <div className="measurements-table-wrapper">
            <table className="measurements-table">
                <thead>
                    <tr>
                        <th className="measurements-th">Czas pomiaru</th>
                        {selectedSeriesObjects.map((series) => (
                            <th key={series.id} className="measurements-th">
                                {series.name} {series.unit ? `(${series.unit})` : ''}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row) => {
                        const isRowHovered = hoveredTimestamp === row.timestamp;
                        return (
                            <tr 
                                key={row.timestamp}
                                className={`measurements-tr ${isRowHovered ? 'row-hovered' : ''}`}
                                onMouseEnter={() => onHoverTimestamp(row.timestamp)}
                                onMouseLeave={() => onHoverTimestamp(null)}
                            >
                                <td className="measurements-td measurements-td-time">
                                    {new Date(row.timestamp).toLocaleString()}
                                </td>
                                {selectedSeriesObjects.map((series) => {
                                    const val = row[series.id];
                                    const isCellHovered = hoveredCell?.timestamp === row.timestamp && hoveredCell?.seriesId === series.id;
                                    return (
                                        <td 
                                            key={series.id}
                                            className={`measurements-td ${isCellHovered ? 'cell-hovered' : ''} ${isRowHovered ? 'row-hovered' : ''}`}
                                            onMouseEnter={() => {
                                                onHoverTimestamp(row.timestamp);
                                                onHoverCell?.({ timestamp: row.timestamp, seriesId: series.id });
                                            }}
                                            onMouseLeave={() => {
                                                onHoverCell?.(null);
                                            }}
                                        >
                                            {val !== undefined ? val : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};