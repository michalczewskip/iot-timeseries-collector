import { useState, useEffect } from 'react';
import { FilterPanel } from "../components/FilterPanel";
import { type SeriesInfo, type MeasurementData, MeasurementsChart } from '../components/MeasurementsChart';


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

// TODO Do usuniecia w docelowej implementacji
const FALLBACK_SERIES: SeriesInfo[] = [
  { id: 1, name: 'Temperatura', color: '#2563eb', unit: '°C' },
  { id: 2, name: 'Wilgotność', color: '#10b981', unit: '%' },
  { id: 3, name: 'Ciśnienie', color: '#f59e0b', unit: 'hPa' },
  { id: 4, name: 'Poziom CO2', color: '#8b5cf6', unit: 'ppm' },
];

export function Dashboard() {
  const [fromDate, setFromDate] = useState(getLocalDateTime(-7, 12));
  const [toDate, setToDate] = useState(getLocalDateTime(7, 12));

  const [seriesList, setSeriesList] = useState<SeriesInfo[]>(FALLBACK_SERIES);

  const [selectedSeries, setSelectedSeries] = useState<string[]>(
    FALLBACK_SERIES.map(s => s.name)
  );

  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);

  useEffect(() => {
    fetch('/api/series')
      .then((res) => {
        if (!res.ok) throw new Error('Błąd API');
        return res.json();
      })
      .then((data: SeriesInfo[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSeriesList(data);
          setSelectedSeries(data.map(s => s.name));
        }
      })
      .catch(() => {
        console.warn('Używam zapasowych serii (fallback)');
      });
  }, []);

  const activeSeriesObjects = seriesList.filter(s =>
    selectedSeries.includes(s.name) || selectedSeries.includes(String(s.id))
  );

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
      .then((data: MeasurementData[]) => setMeasurements(data))
      .catch((err) => console.error(err));
  }, [fromDate, toDate, selectedSeries, seriesList]);

  return (
    <div className="page-content">
      <h1>Wizualizacja danych IoT</h1>
      
      <FilterPanel 
        fromDate={fromDate} 
        setFromDate={setFromDate}
        toDate={toDate} 
        setToDate={setToDate}
        availableSeries={seriesList.map(s => s.name)}
        selectedSeries={selectedSeries}
        onSeriesChange={setSelectedSeries}
      />

      <section className="chart-section" style={{ marginTop: '20px' }}>
        <MeasurementsChart 
          selectedSeriesObjects={activeSeriesObjects}
          measurements={measurements}
        />
      </section>
    </div>
  );
}
