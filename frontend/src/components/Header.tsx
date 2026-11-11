import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { ChangePasswordModal } from './ChangePasswordModal';

export function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, username } = useAuth(); // Pobieramy też username z kontekstu

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    const userMenuRef = useRef(null);

    const isDashboardActive = location.pathname === '/dashboard' || location.pathname === '/';
    const isAdminActive = location.pathname === '/admin';

    // Automatyczne zamykanie menu po kliknięciu poza jego obszar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !(userMenuRef.current as HTMLElement).contains(event.target as Node)) {
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
                        /* Rozwijane menu z ikoną, nazwą użytkownika i strzałką */
                        <div className="user-menu-container" ref={userMenuRef} style={{ position: 'relative', display: 'inline-block' }}>
                            <button 
                                className="auth-btn user-dropdown-toggle"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>👤</span>
                                <span style={{ fontWeight: 500 }}>{username || 'Użytkownik'}</span>
                                <span style={{ fontSize: '0.8rem' }}>{isUserMenuOpen ? '▲' : '▼'}</span>
                            </button>

                            {isUserMenuOpen && (
                                <div className="user-dropdown-menu" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ccc', zIndex: 100, minWidth: '150px' }}>
                                    <button 
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            setIsPasswordModalOpen(true);
                                        }}
                                        style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        Zmień hasło
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            logout();
                                        }}
                                        style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #eee' }}
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