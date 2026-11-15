import { SeriesFilter } from './SeriesFilter';
import './FilterPanel.css';

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

    const handlePrint = () => {
        window.print();
    };

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

            {/* Przycisk drukowania dosunięty na prawo */}
            <div className="filter-actions-wrapper">
                <button
                    type="button"
                    className="btn btn-print"
                    onClick={handlePrint}
                    title="Drukuj lub zapisz jako PDF"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Drukuj
                </button>
            </div>
        </>
    );
}