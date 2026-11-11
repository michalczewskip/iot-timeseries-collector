import React, { useState, useEffect } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { SensorModal } from './SensorModal';
import type { DataSeries } from './SeriesManagement';

export interface Sensor {
    id: string | number;
    name: string;
    seriesId: string | number;
    createdAt?: string;
    lastMeasurementAt?: string | null;
}

interface SensorManagementProps {
    token: string | null;
    seriesList: DataSeries[];
}

export const SensorManagement: React.FC<SensorManagementProps> = ({ token, seriesList }) => {
    const [sensorsList, setSensorsList] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [successMsg, setSuccessMsg] = useState<string>('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [sensorToDelete, setSensorToDelete] = useState<Sensor | null>(null);

    useEffect(() => {
        if (!successMsg) return;

        const timer = setTimeout(() => {
            setSuccessMsg('');
        }, 4000);

        return () => clearTimeout(timer);
    }, [successMsg]);

    const fetchSensors = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/sensors', {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (!response.ok) {
                throw new Error('Nie udało się pobrać listy czujników.');
            }
            const data = await response.json();
            setSensorsList(data);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd sieci.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSensors();
    }, [token]);

    const handleCreateSensor = async (sensorData: { name: string; seriesId: string | number }) => {
        setError('');
        setSuccessMsg('');

        const response = await fetch('/api/sensors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sensorData),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || 'Nie udało się zarejestrować nowego czujnika.');
        }

        const data = await response.json();
        const generatedApiKey = data.apiKey;

        setSuccessMsg('Czujnik został pomyślnie zarejestrowany.');
        fetchSensors();

        return generatedApiKey; 
    };

    const handleDeleteClick = (sensor: Sensor) => {
        setSensorToDelete(sensor);
        setIsDeleteModalOpen(true);
    };

    // Wykonanie wyrejestrowania po potwierdzeniu w modalu (DELETE /api/sensors/{sensorId})
    const handleConfirmDelete = async () => {
        if (!sensorToDelete) return;

        setError('');
        setSuccessMsg('');
        try {
            const response = await fetch(`/api/sensors/${sensorToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Nie udało się wyrejestrować czujnika.');
            }

            setSuccessMsg('Czujnik został pomyślnie wyrejestrowany.');
            fetchSensors();
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas wyrejestrowywania czujnika.');
        } finally {
            setIsDeleteModalOpen(false);
            setSensorToDelete(null);
        }
    };

    return (
        <section className="sensor-management-container" style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '30px' }}>
            <div className="sensor-action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 className="sensor-section-heading" style={{ margin: 0 }}>Zarządzanie Czujnikami IoT</h3>
                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                    + Zarejestruj nowy czujnik
                </button>
            </div>

            {error && <div className="alert error" role="alert">{error}</div>}
            {successMsg && <div className="alert success" role="status">{successMsg}</div>}

            {/* Modal rejestracji czujnika z wyświetlaniem jednorazowego klucza API */}
            <SensorModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateSensor}
                seriesList={seriesList}
            />

            {/* Modal potwierdzenia wyrejestrowania */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Wyrejestruj czujnik IoT"
                message={`Czy na pewno chcesz wyrejestrować czujnik "${sensorToDelete?.name}"? Klucz czujnika natychmiast przestanie działać.`}
                confirmText="Wyrejestruj"
                cancelText="Anuluj"
                onConfirm={handleConfirmDelete}
                onClose={() => setIsDeleteModalOpen(false)}
            />

            {/* Tabela listy czujników */}
            <div className="sensor-list-section">
                {loading ? (
                    <p className="loading-text">Ładowanie czujników...</p>
                ) : sensorsList.length === 0 ? (
                    <p className="empty-text">Brak zarejestrowanych czujników w systemie.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="series-table" aria-label="Lista czujników IoT">
                            <thead>
                                <tr>
                                    <th>Nazwa czujnika</th>
                                    <th>Przypisana seria</th>
                                    <th>Data utworzenia</th>
                                    <th>Ostatni pomiar</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sensorsList.map((sensor) => {
                                    const matchedSeries = seriesList.find(s => String(s.id) === String(sensor.seriesId));
                                    return (
                                        <tr key={sensor.id}>
                                            <td><strong>{sensor.name}</strong></td>
                                            <td>{matchedSeries ? matchedSeries.name : `ID: ${sensor.seriesId}`}</td>
                                            <td>{sensor.createdAt ? new Date(sensor.createdAt).toLocaleString() : '-'}</td>
                                            <td>{sensor.lastMeasurementAt ? new Date(sensor.lastMeasurementAt).toLocaleString() : 'Brak pomiarów'}</td>
                                            <td className="series-actions-cell">
                                                <button 
                                                    onClick={() => handleDeleteClick(sensor)} 
                                                    className="btn btn-sm btn-delete"
                                                >
                                                    Wyrejestruj
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};