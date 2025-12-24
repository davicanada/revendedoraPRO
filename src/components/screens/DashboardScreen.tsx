import React, { useMemo } from 'react';
import {
  Settings,
  TrendingUp,
  Plus,
  Archive,
  ShoppingBag,
  Package,
  Smartphone,
  PiggyBank
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../../context/AppContext';
import { Card } from '../common';
import { SaleType } from '../../types';
import { formatCurrency } from '../../utils/calculations';

export const DashboardScreen: React.FC = () => {
  const { products, sales, setView, user } = useApp();

  // Extract user profile data from Supabase user metadata
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userAvatar = user?.user_metadata?.avatar_url || 'https://via.placeholder.com/100/2A4535/f9a8d4?text=' + userName.charAt(0).toUpperCase();


  // Cálculos dinâmicos baseados no estado atual
  const metrics = useMemo(() => {
    // 1. Estoque Atual
    const currentStock = products.reduce((acc, p) => acc + (p.stockQuantity * p.costPrice), 0);

    // 2. Vendas Totais
    const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);

    // 3. Lucro Acumulado
    const accumulatedProfit = sales.reduce((acc, s) => acc + s.profit, 0);
    const monthlyProfit = accumulatedProfit;

    // 4. Comissões Digital
    const digitalCommissions = sales
      .filter(s => s.type === SaleType.ONLINE)
      .reduce((acc, s) => acc + s.profit, 0);

    // 5. Sales by Origin
    const physicalSales = sales.filter(s => s.type === SaleType.PHYSICAL);
    const onlineSales = sales.filter(s => s.type === SaleType.ONLINE);

    const physicalTotal = physicalSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const onlineTotal = onlineSales.reduce((acc, s) => acc + s.totalAmount, 0);

    const salesByOrigin = [
      {
        name: 'Físico (Presencial)',
        value: physicalTotal,
        count: physicalSales.length,
        color: '#f9a8d4'
      },
      {
        name: 'Online (Digital)',
        value: onlineTotal,
        count: onlineSales.length,
        color: '#6d4c7d'
      }
    ];

    const totalCount = sales.length;

    return {
      totalSales,
      currentStock,
      digitalCommissions,
      accumulatedProfit,
      monthlyProfit,
      lastMonthProfit: 50.00,
      salesByOrigin,
      totalCount
    };
  }, [products, sales]);

  // Calculate chart data from real sales grouped by month
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const last6Months: { name: string; vendas: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthSales = sales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate.getMonth() === month && saleDate.getFullYear() === year;
      });

      const totalMonthSales = monthSales.reduce((acc, s) => acc + s.totalAmount, 0);

      last6Months.push({
        name: monthNames[month],
        vendas: totalMonthSales
      });
    }

    return last6Months;
  }, [sales]);

  const profitGrowth = metrics.lastMonthProfit > 0
    ? ((metrics.monthlyProfit - metrics.lastMonthProfit) / metrics.lastMonthProfit) * 100
    : 100;

  // Calculate Percentages for Pie Chart Legend (based on Value $)
  const totalOriginValue = metrics.salesByOrigin.reduce((acc, curr) => acc + curr.value, 0);
  const getPercent = (value: number) => totalOriginValue > 0 ? Math.round((value / totalOriginValue) * 100) : 0;

  return (
    <div className="p-6 space-y-6 pb-24 bg-brand-dark min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full border-2 border-brand-surface object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100/2A4535/f9a8d4?text=' + userName.charAt(0).toUpperCase(); }}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-brand-dark rounded-full"></span>
          </div>
          <div>
            <p className="text-brand-muted text-xs font-medium">Bem-vinda de volta,</p>
            <h2 className="text-white font-bold text-lg leading-tight">{userName}</h2>
          </div>
        </div>
        <button
          onClick={() => setView('settings')}
          className="w-10 h-10 bg-brand-surface rounded-full flex items-center justify-center border border-white/5 hover:bg-brand-surface/80 transition-colors"
        >
          <Settings size={20} className="text-gray-300" />
        </button>
      </header>

      {/* Hero Card */}
      <div className="bg-brand-surface rounded-3xl p-5 relative overflow-hidden border border-white/5 shadow-xl">
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className="text-brand-muted text-[10px] font-semibold tracking-widest uppercase">LUCRO DO MÊS</span>
          <span className="bg-[#3e2c40] text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingUp size={12} /> +{profitGrowth.toFixed(0)}%
          </span>
        </div>

        <div className="mb-6 relative z-10">
          <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">{formatCurrency(metrics.monthlyProfit)}</h1>
          <p className="text-gray-500 text-xs font-medium">vs. {formatCurrency(metrics.lastMonthProfit)} mês anterior</p>
        </div>

        <div className="flex gap-3 relative z-10">
          <button
            onClick={() => setView('new-sale')}
            className="flex-1 bg-brand-primary text-brand-dark font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-primaryHover transition-all shadow-lg shadow-brand-primary/25"
          >
            <Plus size={20} strokeWidth={2.5} /> Nova Venda
          </button>
          <button
            onClick={() => setView('stock')}
            className="bg-[#332636] text-gray-300 hover:text-white w-14 rounded-xl flex items-center justify-center transition-colors border border-white/5"
          >
            <Archive size={20} />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      </div>

      {/* Visão Geral Grid */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-white font-bold text-lg">Visão Geral</h3>
          <button className="text-brand-primary text-xs font-medium hover:underline">Ver Relatórios</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-brand-surface p-4 rounded-2xl border border-white/5">
            <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 mb-3">
              <ShoppingBag size={18} />
            </div>
            <p className="text-brand-muted text-[10px] mb-1 font-medium">Vendas Totais</p>
            <p className="text-white font-bold text-lg">{formatCurrency(metrics.totalSales)}</p>
          </div>
          <div className="bg-brand-surface p-4 rounded-2xl border border-white/5">
            <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 mb-3">
              <Package size={18} />
            </div>
            <p className="text-brand-muted text-[10px] mb-1 font-medium">Estoque Atual</p>
            <p className="text-white font-bold text-lg">{formatCurrency(metrics.currentStock)}</p>
          </div>
          <div className="bg-brand-surface p-4 rounded-2xl border border-white/5">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
              <Smartphone size={18} />
            </div>
            <p className="text-brand-muted text-[10px] mb-1 font-medium">Comissões Digital</p>
            <p className="text-white font-bold text-lg">{formatCurrency(metrics.digitalCommissions)}</p>
          </div>
          <div className="bg-brand-surface p-4 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3 relative z-10">
              <PiggyBank size={18} />
            </div>
            <p className="text-brand-muted text-[10px] mb-1 font-medium relative z-10">Lucro Acumulado</p>
            <p className="text-white font-bold text-lg relative z-10">{formatCurrency(metrics.accumulatedProfit)}</p>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Sales Area Chart */}
      <Card className="pt-5 pb-2 px-0 overflow-hidden">
        <div className="px-5 mb-4 flex justify-between items-start">
          <div>
            <p className="text-brand-muted text-xs mb-1">Evolução de Vendas</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-white font-bold text-2xl">{formatCurrency(metrics.totalSales)}</h3>
              <span className="text-gray-500 text-[10px]">média/mês</span>
            </div>
          </div>
          <div className="flex bg-[#1a121d] rounded-lg p-0.5">
            <button className="px-2.5 py-1 rounded-md bg-[#332636] text-white text-[10px] font-medium shadow-sm">6M</button>
            <button className="px-2.5 py-1 rounded-md text-brand-muted text-[10px] font-medium hover:text-white">1A</button>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f9a8d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f9a8d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ backgroundColor: '#251628', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#f9a8d4', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ display: 'none' }}
                cursor={{ stroke: '#f9a8d4', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="#f9a8d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVendas)"
                isAnimationActive={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                dy={10}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Sales Origin Pie Chart */}
      <Card className="p-5">
        <h3 className="text-brand-muted text-xs mb-4">Origem das Vendas</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.salesByOrigin}
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {metrics.salesByOrigin.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-brand-muted">Vendas</span>
              <span className="text-xl font-bold text-white">{metrics.totalCount}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-4">
            {metrics.salesByOrigin.map((item) => (
              <div key={item.name} className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-white text-sm font-medium">{item.name}</span>
                </div>
                <div className="w-full bg-[#1a121d] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${getPercent(item.value)}%`, backgroundColor: item.color }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-white font-bold">{getPercent(item.value)}%</span>
                  <span className="text-[10px] text-brand-muted">{item.count} vendas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
