import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-2 rounded-lg">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="text-brand-muted hover:text-white">
            <X size={24} />
          </button>
        </div>
        <p className="text-brand-muted mb-6">{description}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="!bg-red-500 hover:!bg-red-600 !text-white"
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
};
