import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { Input, Button } from '../common';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';

export const AddCustomerScreen: React.FC = () => {
  const { setView, addCustomer } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Função para formatar telefone brasileiro
  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limitedNumbers = numbers.slice(0, 11);

    // Aplica a máscara baseado na quantidade de dígitos
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      // (XX)XXXX
      return `(${limitedNumbers.slice(0, 2)})${limitedNumbers.slice(2)}`;
    } else if (limitedNumbers.length <= 10) {
      // (XX)XXXX-XXXX
      return `(${limitedNumbers.slice(0, 2)})${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
    } else {
      // (XX)XXXXX-XXXX
      return `(${limitedNumbers.slice(0, 2)})${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar nome completo (pelo menos nome e sobrenome)
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length < 2) {
      alert('Por favor, digite o nome completo (nome e sobrenome)');
      return;
    }

    // Validar telefone se foi preenchido
    if (phone.trim()) {
      const phoneNumbers = phone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        alert('Telefone inválido. Use o formato (XX)XXXX-XXXX ou (XX)XXXXX-XXXX');
        return;
      }
    }

    const newCustomer = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: undefined,
      notes: undefined,
      tags: ['Novo'],
      totalSpent: 0,
      lastPurchaseDate: undefined,
      birthDate: undefined
    };

    try {
      await addCustomer(newCustomer);
      setView('customers');
    } catch (err) {
      console.error('Erro ao adicionar cliente:', err);
    }
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
            onChange={handlePhoneChange}
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
