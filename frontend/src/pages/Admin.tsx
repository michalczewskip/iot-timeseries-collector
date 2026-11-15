import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SeriesManagement } from '../components/SeriesManagement';
import { SensorManagement } from '../components/SensorManagement';
import { LoginModal } from '../components/LoginModal';
import type { DataSeries } from '../components/SeriesManagement';

import './Admin.css';

export function Admin() {
    const { isAuthenticated, token } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    
    const [seriesList, setSeriesList] = useState<DataSeries[]>([]);

    // Pobieranie listy serii w komponencie nadrzędnym
    const fetchSeries = async () => {
        try {
            const response = await fetch('/api/series');
            if (response.ok) {
                const data = await response.json();
                setSeriesList(data);
            }
        } catch (err) {
            console.error('Nie udało się pobrać listy serii w Admin:', err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSeries();
        }
    }, [isAuthenticated]);

    // Jeśli użytkownik nie jest zalogowany, pokazujemy dopracowaną kartę braku dostępu
    if (!isAuthenticated) {
        return (
            <div className="page-content admin-unauthorized">
                <div className="unauthorized-icon" aria-hidden="true">🔒</div>
                <h2>Brak dostępu</h2>
                <p>Do przeglądania panelu administratora oraz zarządzania systemem potrzebne są uprawnienia administratora.</p>
                <p>Zaloguj się na konto z odpowiednimi uprawnieniami, aby kontynuować.</p>
                
                <button 
                    className="auth-btn" 
                    onClick={() => setIsLoginModalOpen(true)}
                >
                    Zaloguj się
                </button>

                {/* Modal logowania wywoływany z poziomu strony admina */}
                <LoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setIsLoginModalOpen(false)}
                />
            </div>
        );
    }

    // Jeśli użytkownik jest zalogowany, wyświetlamy normalny panel administratora
    return (
        <div className="page-content admin-dashboard">
            <SeriesManagement token={token} />

            {/* Zarządzanie czujnikami IoT z przekazaną listą serii do selecta */}
            <SensorManagement token={token} seriesList={seriesList} />
        </div>
    );
}