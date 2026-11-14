import { SeriesFilter } from './SeriesFilter';
import './FilterPanel.css'

interface FilterPanelProps {
    fromDate: string;
    setFromDate: (value: string) => void;
    toDate: string;
    setToDate: (value: string) => void;
    availableSeries: string[];
    selectedSeries: string[];
    onSeriesChange: (selected: string[]) => void;
}

interface FilterPanelProps {
    fromDate: string;
    setFromDate: (value: string) => void;
    toDate: string;
    setToDate: (value: string) => void;
    availableSeries: string[];
    selectedSeries: string[];
    onSeriesChange: (selected: string[]) => void;
}

export function FilterPanel({
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    availableSeries,
    selectedSeries,
    onSeriesChange
}: FilterPanelProps) {

    return (
        <>
            <div className="from-filter">
                <label htmlFor="from-time">Od:</label>
                <input
                    className="from-calendar"
                    type="datetime-local"
                    id="from-time"
                    name="from-time"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
            </div>

            <div className="to-filter">
                <label htmlFor="to-time">Do:</label>
                <input
                    className="to-calendar"
                    type="datetime-local"
                    id="to-time"
                    name="to-time"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>

            <div className="series-filter-wrapper">
                <SeriesFilter
                    availableSeries={availableSeries}
                    selectedSeries={selectedSeries}
                    onChange={onSeriesChange}
                />
            </div>
        </>
    );
}