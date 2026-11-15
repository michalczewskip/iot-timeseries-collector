import { useState, useEffect } from 'react';
import { FilterPanel } from "../components/FilterPanel";
import { type SeriesInfo, type MeasurementData, MeasurementsChart } from '../components/MeasurementsChart';
import { MeasurementsTable } from '../components/MeasurementsTable';

import './Dashboard.css';

const getLocalDateTime = (daysOffset = 0, hours = 12) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, 0, 0, 0);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${h}:${m}`;
};

export function Dashboard() {
  // Inicjalizacja stanu z localStorage lub wartości domyślnych
  const [fromDate, setFromDate] = useState<string>(() => {
    return localStorage.getItem('dashboard_fromDate') || getLocalDateTime(-7, 12);
  });
  
  const [toDate, setToDate] = useState<string>(() => {
    return localStorage.getItem('dashboard_toDate') || getLocalDateTime(7, 12);
  });

  const [seriesList, setSeriesList] = useState<SeriesInfo[]>([]);
  
  const [selectedSeries, setSelectedSeries] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_selectedSeries');
    return saved ? JSON.parse(saved) : [];
  });

  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);

  // Stany dla dwukierunkowego podświetlania (hover)
  const [hoveredTimestamp, setHoveredTimestamp] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ timestamp: string; seriesId: string | number } | null>(null);

  // Zapisywanie filtrów do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem('dashboard_fromDate', fromDate);
  }, [fromDate]);

  useEffect(() => {
    localStorage.setItem('dashboard_toDate', toDate);
  }, [toDate]);

  useEffect(() => {
    localStorage.setItem('dashboard_selectedSeries', JSON.stringify(selectedSeries));
  }, [selectedSeries]);

  // Pobieranie listy serii z API
  useEffect(() => {
    fetch('/api/series')
      .then((res) => {
        if (!res.ok) throw new Error('Błąd API');
        return res.json();
      })
      .then((data: SeriesInfo[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSeriesList(data);
          
          // Jeśli użytkownik nie ma jeszcze zapisanych serii w localStorage, zaznaczamy domyślnie wszystkie
          const saved = localStorage.getItem('dashboard_selectedSeries');
          if (!saved) {
            setSelectedSeries(data.map(s => s.name));
          }
        }
      })
      .catch((err) => {
        console.error('Nie udało się pobrać serii danych:', err);
        setSeriesList([]);
      });
  }, []);

  const activeSeriesObjects = seriesList.filter(s =>
    selectedSeries.includes(s.name) || selectedSeries.includes(String(s.id))
  );

  // Pobieranie pomiarów z API w zależności od wybranego zakresu czasowego i serii
  useEffect(() => {
    if (activeSeriesObjects.length === 0) {
      setMeasurements([]);
      return;
    }

    const seriesIds = activeSeriesObjects.map(s => s.id).join(',');
    const fromIso = new Date(fromDate).toISOString();
    const toIso = new Date(toDate).toISOString();

    const url = `/api/measurements?series=${seriesIds}&from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Błąd podczas pobierania pomiarów');
        return res.json();
      })
      .then((data: MeasurementData[]) => {
        if (Array.isArray(data)) {
          setMeasurements(data);
        }
      })
      .catch((err) => {
        console.error('Nie udało się pobrać pomiarów:', err);
        setMeasurements([]);
      });
  }, [fromDate, toDate, selectedSeries, seriesList]);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">

        {/* Sekcja filtrów */}
        <div className="filter-card">
          <div className="filter-panel-row">
            <FilterPanel
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              availableSeries={seriesList.map(s => s.name)}
              selectedSeries={selectedSeries}
              onSeriesChange={setSelectedSeries}
            />
          </div>
        </div>

        {/* Sekcja wykresu */}
        <section className="chart-section">
          <MeasurementsChart
            selectedSeriesObjects={activeSeriesObjects}
            measurements={measurements}
            hoveredTimestamp={hoveredTimestamp}
            onHoverTimestamp={setHoveredTimestamp}
            hoveredCell={hoveredCell}
            onHoverCell={setHoveredCell}
          />
        </section>

        {/* Sekcja tabeli */}
        <section className="table-section">
          <MeasurementsTable
            selectedSeriesObjects={activeSeriesObjects}
            measurements={measurements}
            hoveredTimestamp={hoveredTimestamp}
            onHoverTimestamp={setHoveredTimestamp}
            hoveredCell={hoveredCell}
            onHoverCell={setHoveredCell}
          />
        </section>

      </div>
    </div>
  );
}