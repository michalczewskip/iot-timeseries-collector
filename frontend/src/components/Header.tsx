import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';

export function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isDashboardActive = location.pathname === '/dashboard' || location.pathname === '/';
    const isAdminActive = location.pathname === '/admin';

    const handleAuthClick = () => {
        if (isAuthenticated) {
            logout();
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <header className="app-header">
                <div className="header-logo">
                    <h2>System IoT</h2>
                </div>
                
                <div className="toggle-container">
                    <button
                        className={`toggle-btn ${isDashboardActive ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard')}
                    >
                        Wizualizacja
                    </button>
                    <button
                        className={`toggle-btn ${isAdminActive ? 'active' : ''}`}
                        onClick={() => navigate('/admin')}
                    >
                        Panel administratora
                    </button>
                </div>

                <div className="auth-action-container">
                    <button className="auth-btn" onClick={handleAuthClick}>
                        {isAuthenticated ? 'Wyloguj' : 'Zaloguj'}
                    </button>
                </div>
            </header>

            <LoginModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
}