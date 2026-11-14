import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css'; // Wspólne style modali

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const { token } = useAuth();

    const modalContentRef = useRef<HTMLDivElement>(null);

    // Czyszczenie pól i komunikatów przy każdym otwarciu modalu
    useEffect(() => {
        if (isOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
            setSuccessMessage('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Walidacja 1: Nowe hasło min. 8 znaków
        if (newPassword.length < 8) {
            setError('Nowe hasło musi mieć co najmniej 8 znaków.');
            return;
        }

        // Walidacja 2: Czy nowe hasło i powtórzone hasło są takie same
        if (newPassword !== confirmPassword) {
            setError('Nowe hasła muszą się zgadzać.');
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
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content" ref={modalContentRef}>
                <h3>Zmiana hasła</h3>
                {error && <p className="error-text">{error}</p>}
                {successMessage && <p className="success-text">{successMessage}</p>}
                
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
                    <div>
                        <label>Powtórz nowe hasło:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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

