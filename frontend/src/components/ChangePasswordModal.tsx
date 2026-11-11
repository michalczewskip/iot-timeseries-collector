import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const { token } = useAuth();

    // Czyszczenie pól i komunikatów przy każdym otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setError('');
            setSuccessMessage('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Walidacja front-end: nowe hasło min. 8 znaków (brak wysyłania do backendu jeśli za krótkie)
        if (newPassword.length < 8) {
            setError('Nowe hasło musi mieć co najmniej 8 znaków.');
            return;
        }

        try {
            const response = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Nie udało się zmienić hasła. Sprawdź poprawność obecnego hasła.');
            }

            setSuccessMessage('Hasło zostało pomyślnie zmienione!');
            
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas zmiany hasła');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Zmiana hasła</h3>
                {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p className="success-text" style={{ color: 'green' }}>{successMessage}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Obecne hasło:</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Nowe hasło (min. 8 znaków):</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-buttons">
                        <button type="submit">Zmień hasło</button>
                        <button type="button" onClick={onClose}>Anuluj</button>
                    </div>
                </form>
            </div>
        </div>
    );
};