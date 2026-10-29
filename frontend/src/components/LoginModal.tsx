import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    // Clear username, password and error every before every opening of login pop up
    useEffect(() => {
        if (isOpen) {
            setUsername('');
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null; // Render nothing if pop up not open

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Błędne dane logowania');
            }

            const data = await response.json();
            login(data.accessToken);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Wystąpił błąd podczas logowania');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Logowanie do Systemu IoT</h3>
                {error && <p className="error-text">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Login:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Hasło:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-buttons">
                        <button type="submit">Zaloguj się</button>
                        <button type="button" onClick={onClose}>Anuluj</button>
                    </div>
                </form>
            </div>
        </div>
    );
};