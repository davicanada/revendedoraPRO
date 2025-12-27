import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Search, ShoppingBag, Users, DollarSign, TrendingUp, UserCheck } from 'lucide-react';
import { Button, Card } from '../common';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateBR } from '../../utils/calculations';

export const CustomersScreen: React.FC = () => {
  const { customers, sales, setView } = useApp();
  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  // Calculate customer metrics
  const customerMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Total de clientes
    const totalCustomers = customers.length;

    // Total gasto por todos os clientes
    const totalSpent = customers.reduce((acc, c) => acc + c.totalSpent, 0);

    // Ticket médio por cliente
    const averageTicket = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

    // Clientes ativos no mês (que compraram no mês atual)
    const salesThisMonth = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    const activeCustomerIds = new Set(salesThisMonth.map(s => s.customerId).filter(Boolean));
    const activeCustomers = activeCustomerIds.size;

    return {
      totalCustomers,
      totalSpent,
      averageTicket,
      activeCustomers
    };
  }, [customers, sales]);

  return (
    <div className="h-screen flex flex-col bg-brand-dark pb-20">
      <div className="sticky top-0 bg-brand-dark/95 backdrop-blur-sm z-10 border-b border-brand-secondary/20">
        <div className="flex items-center justify-between p-6">
          <button
            onClick={() => setView('dashboard')}
            className="text-white hover:text-brand-primary md:hidden"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white leading-none">Clientes</h2>
            <p className="text-brand-muted text-xs mt-1">Gerencie seus relacionamentos</p>
          </div>
          <Button
            variant="ghost"
            className="!w-auto text-brand-primary"
            onClick={() => setView('add-customer')}
          >
            <Plus size={20} />
          </Button>
        </div>
        <div className="mb-6 px-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              className="w-full bg-brand-surface border border-transparent focus:border-brand-primary/50 text-white rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4">
        {/* KPIs de Clientes */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users size={16} className="text-blue-400" />
              </div>
              <p className="text-brand-muted text-[10px] font-medium">Total de Clientes</p>
            </div>
            <p className="text-white font-bold text-xl">{customerMetrics.totalCustomers}</p>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign size={16} className="text-green-400" />
              </div>
              <p className="text-brand-muted text-[10px] font-medium">Total Gasto</p>
            </div>
            <p className="text-white font-bold text-xl">{formatCurrency(customerMetrics.totalSpent)}</p>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-brand-primary" />
              </div>
              <p className="text-brand-muted text-[10px] font-medium">Ticket Médio</p>
            </div>
            <p className="text-brand-primary font-bold text-xl">{formatCurrency(customerMetrics.averageTicket)}</p>
          </Card>

          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <UserCheck size={16} className="text-purple-400" />
              </div>
              <p className="text-brand-muted text-[10px] font-medium">Ativos no Mês</p>
            </div>
            <p className="text-white font-bold text-xl">{customerMetrics.activeCustomers}</p>
          </Card>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-brand-muted">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-brand-surface rounded-2xl p-4 border border-white/5 hover:border-brand-primary/30 transition-colors"
              >
                <div className="flex gap-3 items-start">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-primary font-bold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-white font-semibold text-sm truncate">{customer.name}</h4>
                      {customer.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            tag === 'Inativo'
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : tag === 'Novo'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              : 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-brand-muted text-xs mb-2">
                      {customer.phone || customer.email || 'Sem contato'}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-muted">
                        Total gasto:{' '}
                        <span className="text-brand-primary font-bold">
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </span>
                      {customer.lastPurchaseDate && (
                        <span className="text-brand-muted">
                          Última compra: {formatDateBR(customer.lastPurchaseDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
