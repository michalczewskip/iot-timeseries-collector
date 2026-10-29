import { useState } from 'react';
import { FilterPanel } from "../components/FilterPanel";

const getLocalDateTime = (daysOffset = 0, hours = 12) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset); // np. -7 na tydzień w przód/tył
  d.setHours(hours, 0, 0, 0);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${h}:${m}`;
};


export function Dashboard() {

  const [fromDate, setFromDate] = useState(getLocalDateTime(-7, 12));
  const [toDate, setToDate] = useState(getLocalDateTime(7, 12));

  return (
    <div className="page-content">
      <h1>Wizualizacja danych IoT</h1>
      <FilterPanel fromDate={fromDate} setFromDate={setFromDate}
        toDate={toDate} setToDate={setToDate} />
      <p>Tu będą wykresy i statusy sensorów w czasie rzeczywistym.</p>

    </div>
  );
}