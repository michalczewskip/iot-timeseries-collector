import React, { useState } from 'react';
import type { DataSeries } from './SeriesManagement';

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
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box'
        }}>
            <div style={{
                background: '#fff', padding: '25px', borderRadius: '8px',
                width: '100%', maxWidth: '500px', boxSizing: 'border-box',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Rejestracja nowego czujnika IoT</h3>

                {error && <div className="alert error" role="alert" style={{ marginBottom: '15px' }}>{error}</div>}

                {/* Jednorazowy klucz API (zgodnie z OpenAPI: klucz jest zwracany wyłącznie w tej odpowiedzi) */}
                {generatedApiKey ? (
                    <div>
                        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffeeba', fontSize: '0.9rem' }}>
                            <strong>Ważne!</strong> Klucz API (`X-API-Key`) jest zwracany wyłącznie w tej odpowiedzi. Serwer przechowuje tylko jego skrót. Po zamknięciu okna nie będzie już ponownie ujawniany.
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Jednorazowy Klucz API (X-API-Key):</label>
                            <input
                                type="text"
                                readOnly
                                value={generatedApiKey}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                style={{ width: '100%', padding: '10px', fontFamily: 'monospace', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Nazwa czujnika:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                maxLength={100}
                                placeholder="np. Czujnik temperatury #1"
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Powiązana seria danych:</label>
                            <select
                                value={seriesId}
                                onChange={(e) => setSeriesId(e.target.value)}
                                required
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}
                            >
                                <option value="">-- Wybierz serię --</option>
                                {seriesList.map((series) => (
                                    <option key={series.id} value={series.id}>
                                        {series.name} {series.unit ? `(${series.unit})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="btn"
                                style={{ background: '#6c757d', color: '#fff' }}
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