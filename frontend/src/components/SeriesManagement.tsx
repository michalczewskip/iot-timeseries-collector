import React, { useState, useEffect } from 'react';
import { SeriesModal } from './SeriesModal';
import { ConfirmModal } from './ConfirmModal';
import './SeriesManagement.css';

export interface DataSeries {
    id: string | number;
    name: string;
    unit?: string | null;
    minValue: number;
    maxValue: number;
    color: string;
    icon?: string | null;
}

interface SeriesManagementProps {
    token: string | null;
}

export const SeriesManagement: React.FC<SeriesManagementProps> = ({ token }) => {
    const [seriesList, setSeriesList] = useState<DataSeries[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [successMsg, setSuccessMsg] = useState<string>('');

    // Stany dla modalu edycji/tworzenia
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingSeries, setEditingSeries] = useState<DataSeries | null>(null);

    // Stany dla modalu potwierdzenia usuwania
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [seriesToDelete, setSeriesToDelete] = useState<DataSeries | null>(null);

    // Automatyczne ukrywanie komunikatu sukcesu po 4 sekundach
    useEffect(() => {
        if (!successMsg) return;

        const timer = setTimeout(() => {
            setSuccessMsg('');
        }, 4000);

        return () => clearTimeout(timer);
    }, [successMsg]);

    const fetchSeries = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/series');
            if (!response.ok) {
                throw new Error('Nie udało się pobrać listy serii danych.');
            }
            const data = await response.json();
            setSeriesList(data);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd sieci.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeries();
    }, []);

    const handleSaveSeries = async (seriesData: { name: string; unit: string | null; minValue: number; maxValue: number; color: string }) => {
        setError('');
        setSuccessMsg('');

        const endpoint = editingSeries ? `/api/series/${editingSeries.id}` : '/api/series';
        const method = editingSeries ? 'PUT' : 'POST';

        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(seriesData),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || (editingSeries ? 'Nie udało się zaktualizować serii.' : 'Nie udało się utworzyć nowej serii.'));
        }

        setSuccessMsg(editingSeries ? 'Seria została zaktualizowana.' : 'Seria została pomyślnie utworzona.');
        fetchSeries();
    };

    const handleOpenCreateModal = () => {
        setEditingSeries(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (item: DataSeries) => {
        setEditingSeries(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item: DataSeries) => {
        setSeriesToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!seriesToDelete) return;

        setError('');
        setSuccessMsg('');
        try {
            const response = await fetch(`/api/series/${seriesToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Nie udało się usunąć serii.');
            }

            setSuccessMsg('Seria została pomyślnie usunięta.');
            fetchSeries();
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas usuwania.');
        } finally {
            setIsDeleteModalOpen(false);
            setSeriesToDelete(null);
        }
    };

    return (
        <section className="series-management-container">
            <div className="series-action-bar">
                <h3 className="series-section-heading">Zarządzanie Seriami Pomiarowymi</h3>
                <button onClick={handleOpenCreateModal} className="btn btn-primary">
                    + Dodaj nową serię
                </button>
            </div>

            {error && <div className="alert error" role="alert">{error}</div>}
            {successMsg && <div className="alert success" role="status">{successMsg}</div>}

            {/* Modal dodawania / edycji */}
            <SeriesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSeries}
                initialData={editingSeries}
            />

            {/* Modal potwierdzenia usunięcia */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Usuń serię danych"
                message={`Czy na pewno chcesz usunąć serię "${seriesToDelete?.name}"? Spowoduje to również usunięcie wszystkich powiązanych z nią wyników i czujników.`}
                confirmText="Usuń"
                cancelText="Anuluj"
                onConfirm={handleConfirmDelete}
                onClose={() => setIsDeleteModalOpen(false)}
            />

            {/* Tabela serii danych */}
            <div className="series-list-section">
                {loading ? (
                    <p className="loading-text">Ładowanie serii danych...</p>
                ) : seriesList.length === 0 ? (
                    <p className="empty-text">Brak zdefiniowanych serii pomiarowych.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="series-table" aria-label="Lista serii pomiarowych">
                            <thead>
                                <tr>
                                    <th>Nazwa serii</th>
                                    <th>Zakres (Min - Max)</th>
                                    <th>Jednostka</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seriesList.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {/* Pasek / kropka koloru przed nazwą */}
                                                <span 
                                                    className="series-color-indicator"
                                                    style={{ backgroundColor: item.color }}
                                                    title={`Kolor: ${item.color}`}
                                                />
                                                <strong>{item.name}</strong>
                                            </div>
                                        </td>
                                        <td>{item.minValue} do {item.maxValue}</td>
                                        <td>{item.unit || '-'}</td>
                                        <td className="series-actions-cell">
                                            <button 
                                                onClick={() => handleEditClick(item)} 
                                                className="btn btn-sm btn-edit"
                                            >
                                                Edytuj
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(item)} 
                                                className="btn btn-sm btn-delete"
                                            >
                                                Usuń
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};