import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { Input, Button } from '../common';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';

export const AddCustomerScreen: React.FC = () => {
  const { setView, addCustomer } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: undefined,
      notes: undefined,
      tags: ['Novo'],
      totalSpent: 0,
      lastPurchaseDate: undefined,
      birthDate: undefined
    };

    addCustomer(newCustomer);
    setView('customers');
  };

  return (
    <div className="h-screen flex flex-col bg-brand-dark">
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <button
          onClick={() => setView('customers')}
          className="text-brand-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-white">Novo Cliente</h2>
        <div className="w-6"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
        <div className="space-y-5">
          <Input
            label="Nome Completo*"
            icon={User}
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Ex: Maria Silva"
            required
          />

          <Input
            label="Telefone"
            icon={Phone}
            type="tel"
            value={phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
            placeholder="(11) 98765-4321"
          />
        </div>
      </form>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-dark to-transparent">
        <Button type="submit" onClick={handleSubmit}>
          Salvar Cliente
        </Button>
      </div>
    </div>
  );
};
