import React, { useState, useEffect } from 'react';
import type { DataSeries } from './SeriesManagement';
import './SeriesModal.css'

interface SeriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (seriesData: { name: string; unit: string | null; minValue: number; maxValue: number; color: string }) => Promise<void>;
    initialData?: DataSeries | null;
}

export const SeriesModal: React.FC<SeriesModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [minValue, setMinValue] = useState('-50');
    const [maxValue, setMaxValue] = useState('60');
    const [color, setColor] = useState('#E74C3C');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (initialData) {
                setName(initialData.name);
                setUnit(initialData.unit || '');
                setMinValue(String(initialData.minValue));
                setMaxValue(String(initialData.maxValue));
                setColor(initialData.color || '#E74C3C');
            } else {
                setName('');
                setUnit('');
                setMinValue('-50');
                setMaxValue('60');
                setColor('#E74C3C');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const minNum = parseFloat(minValue);
        const maxNum = parseFloat(maxValue);
        if (minNum >= maxNum) {
            setError('Minimalna wartość musi być mniejsza od maksymalnej.');
            return;
        }

        setLoading(true);
        try {
            await onSave({
                name,
                unit: unit.trim() ? unit : null,
                minValue: minNum,
                maxValue: maxNum,
                color
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas zapisu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{initialData ? 'Edytuj serię' : 'Dodaj nową serię'}</h3>
                {error && <p className="error-text">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nazwa serii:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Min wartość:</label>
                            <input
                                type="number"
                                step="any"
                                value={minValue}
                                onChange={(e) => setMinValue(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Max wartość:</label>
                            <input
                                type="number"
                                step="any"
                                value={maxValue}
                                onChange={(e) => setMaxValue(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Jednostka:</label>
                            <input
                                type="text"
                                maxLength={20}
                                placeholder="np. °C"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Kolor (HEX):</label>
                            <div className="color-picker-wrapper">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Zapisywanie...' : (initialData ? 'Zapisz zmiany' : 'Utwórz')}
                        </button>
                        <button type="button" onClick={onClose}>
                            Anuluj
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};