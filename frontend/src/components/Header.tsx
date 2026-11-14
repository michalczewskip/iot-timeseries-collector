import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { ChangePasswordModal } from './ChangePasswordModal';

import './Header.css'

export function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, username } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    const userMenuRef = useRef<HTMLDivElement>(null);

    const isDashboardActive = location.pathname === '/dashboard' || location.pathname === '/';
    const isAdminActive = location.pathname === '/admin';

    // Automatyczne zamykanie menu po kliknięciu poza jego obszar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAuthClick = () => {
        setIsModalOpen(true);
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
                    {isAuthenticated ? (
                        <div className="user-menu-container" ref={userMenuRef}>
                            <button 
                                className="auth-btn user-dropdown-toggle"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <span>👤</span>
                                <span className="username-text">{username || 'Użytkownik'}</span>
                                <span className="dropdown-arrow">{isUserMenuOpen ? '▲' : '▼'}</span>
                            </button>

                            {isUserMenuOpen && (
                                <div className="user-dropdown-menu">
                                    <button 
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            setIsPasswordModalOpen(true);
                                        }}
                                    >
                                        Zmień hasło
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            logout();
                                        }}
                                    >
                                        Wyloguj
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="auth-btn" onClick={handleAuthClick}>
                            Zaloguj
                        </button>
                    )}
                </div>
            </header>

            <LoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </>
    );
}