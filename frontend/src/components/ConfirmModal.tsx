import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Usuń',
    cancelText = 'Anuluj',
    onConfirm,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content confirm-modal-content">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-buttons">
                    <button type="button" onClick={onClose} className="btn btn-secondary">
                        {cancelText}
                    </button>
                    <button type="button" onClick={onConfirm} className="btn btn-danger">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};