import React, { useState } from 'react';
import type { DataSeries } from './SeriesManagement';

import './SensorModal.css';

interface SensorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sensorData: { name: string; seriesId: string | number }) => Promise<string>;
    seriesList: DataSeries[];
}

export const SensorModal: React.FC<SensorModalProps> = ({ isOpen, onClose, onSave, seriesList }) => {
    const [name, setName] = useState('');
    const [seriesId, setSeriesId] = useState<string | number>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Stan przechowujący wygenerowany klucz jednorazowy (zwracany przy rejestracji)
    const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiKey = await onSave({ name, seriesId });
            setGeneratedApiKey(apiKey);
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas rejestracji czujnika.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setName('');
        setSeriesId('');
        setGeneratedApiKey(null);
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className="modal-title">Rejestracja nowego czujnika IoT</h3>

                {error && <div className="alert error" role="alert">{error}</div>}

                {/* Jednorazowy klucz API (zgodnie z OpenAPI: klucz jest zwracany wyłącznie w tej odpowiedzi) */}
                {generatedApiKey ? (
                    <div>
                        <div className="api-key-warning-box">
                            <strong>Ważne!</strong> Klucz API (`X-API-Key`) jest zwracany wyłącznie w tej odpowiedzi. Serwer przechowuje tylko jego skrót. Po zamknięciu okna nie będzie już ponownie ujawniany.
                        </div>

                        <div className="form-group">
                            <label>Jednorazowy Klucz API (X-API-Key):</label>
                            <input
                                type="text"
                                className="form-input api-key-input"
                                readOnly
                                value={generatedApiKey}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                        </div>

                        <div className="modal-buttons">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="btn btn-primary"
                            >
                                Rozumiem i zapisałem klucz
                            </button>
                        </div>
                    </div>
                ) : (
                    // Formularz rejestracji zgodny z SensorInput (name, seriesId)
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nazwa czujnika:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                maxLength={100}
                                placeholder="np. Czujnik temperatury #1"
                            />
                        </div>

                        <div className="form-group">
                            <label>Powiązana seria danych:</label>
                            <select
                                className="form-select"
                                value={seriesId}
                                onChange={(e) => setSeriesId(e.target.value)}
                                required
                            >
                                <option value="">-- Wybierz serię --</option>
                                {seriesList.map((series) => (
                                    <option key={series.id} value={series.id}>
                                        {series.name} {series.unit ? `(${series.unit})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-buttons">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Rejestrowanie...' : 'Zarejestruj czujnik'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};