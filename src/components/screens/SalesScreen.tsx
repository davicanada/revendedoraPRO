import React, { useMemo } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { Button, Card } from '../common';
import { useApp } from '../../context/AppContext';
import { SaleType } from '../../types';
import { formatCurrency } from '../../utils/calculations';

export const SalesScreen: React.FC = () => {
  const { sales, setView } = useApp();

  // Calculate monthly totals from real sales data
  const { totalMonth, toReceive } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const salesThisMonth = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    const totalMonth = salesThisMonth.reduce((acc, s) => acc + s.totalAmount, 0);
    const toReceive = salesThisMonth.reduce((acc, s) => acc + s.profit, 0);

    return { totalMonth, toReceive };
  }, [sales]);

  return (
    <div className="h-screen flex flex-col bg-brand-dark pb-20">
      <div className="sticky top-0 bg-brand-dark/95 backdrop-blur-sm z-10 border-b border-brand-secondary/20">
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-bold text-white leading-none">Vendas</h2>
            <p className="text-brand-muted text-xs mt-1">Histórico de transações</p>
          </div>
          <Button
            variant="ghost"
            className="!w-auto text-brand-primary"
            onClick={() => setView('new-sale')}
          >
            <Plus size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="!p-3">
            <p className="text-brand-muted text-xs mb-1">Total do Mês</p>
            <p className="text-white font-bold text-lg">{formatCurrency(totalMonth)}</p>
          </Card>
          <Card className="!p-3">
            <p className="text-brand-muted text-xs mb-1">Lucro do Mês</p>
            <p className="text-brand-primary font-bold text-lg">{formatCurrency(toReceive)}</p>
          </Card>
        </div>

        <div className="space-y-3">
          {sales.length === 0 ? (
            <Card className="text-center py-12">
              <ShoppingBag size={48} className="text-brand-muted mx-auto mb-4 opacity-50" />
              <p className="text-brand-muted">Nenhuma venda registrada</p>
              <p className="text-brand-muted text-sm mt-2">Clique no botão + para criar sua primeira venda</p>
            </Card>
          ) : (
            sales
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((sale) => (
                <Card key={sale.id} className="!p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{sale.customerName}</h4>
                      <p className="text-brand-muted text-xs mt-1">
                        {new Date(sale.date).toLocaleDateString('pt-BR')} •{' '}
                        <span
                          className={`${sale.type === SaleType.ONLINE ? 'text-purple-400' : 'text-blue-400'
                            }`}
                        >
                          {sale.type}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-pink-400 font-bold text-sm">
                        R$ {sale.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-green-400 text-xs mt-1">
                        +R$ {sale.profit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
