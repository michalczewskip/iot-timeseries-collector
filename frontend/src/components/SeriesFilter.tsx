import { useState } from 'react';
import './SeriesFilter.css';

interface SeriesFilterProps {
    availableSeries: string[];
    selectedSeries: string[];
    onChange: (selected: string[]) => void;
}

export function SeriesFilter({ availableSeries, selectedSeries, onChange }: SeriesFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectAll = () => {
        onChange(availableSeries);
    };

    const handleClearAll = () => {
        onChange([]);
    };

    const handleToggleSeries = (series: string) => {
        if (selectedSeries.includes(series)) {
            onChange(selectedSeries.filter(s => s !== series));
        } else {
            onChange([...selectedSeries, series]);
        }
    };

    return (
        <div className="series-filter-container">
            <button
                type="button"
                className="series-filter-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                Serie danych ({selectedSeries.length}/{availableSeries.length}) ▾
            </button>

            {isOpen && (
                <div className="series-dropdown-menu">
                    <div className="series-dropdown-actions">
                        <button
                            type="button"
                            className="select-all-btn"
                            onClick={handleSelectAll}
                        >
                            Zaznacz wszystkie
                        </button>
                        <button
                            type="button"
                            className="clear-all-btn"
                            onClick={handleClearAll}
                        >
                            Wyczyść
                        </button>
                    </div>

                    <div className="series-checkbox-list">
                        {availableSeries.length === 0 ? (
                            <p className="no-series-text">Brak dostępnych serii</p>
                        ) : (
                            availableSeries.map((series) => {
                                const isChecked = selectedSeries.includes(series);
                                return (
                                    <label key={series} className="series-checkbox-label">
                                        <input
                                            type="checkbox"
                                            className="series-checkbox-input"
                                            checked={isChecked}
                                            onChange={() => handleToggleSeries(series)}
                                        />
                                        {series}
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}