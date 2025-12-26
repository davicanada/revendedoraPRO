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
  const [chartMode, setChartMode] = React.useState<'revenue' | 'profit' | 'count'>('revenue');
  const [pieChartMode, setPieChartMode] = React.useState<'revenue' | 'profit' | 'count'>('revenue');

  // Extract user profile data from Supabase user metadata
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userAvatar = user?.user_metadata?.avatar_url || 'https://via.placeholder.com/100/2A4535/f9a8d4?text=' + userName.charAt(0).toUpperCase();


  // Cálculos dinâmicos baseados no estado atual
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calcular mês anterior
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filtrar vendas do mês atual
    const currentMonthSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    // Filtrar vendas do mês anterior
    const lastMonthSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
    });

    // 1. Lucro do mês atual
    const monthlyProfit = currentMonthSales.reduce((acc, s) => acc + s.profit, 0);

    // 2. Lucro do mês anterior
    const lastMonthProfit = lastMonthSales.reduce((acc, s) => acc + s.profit, 0);

    // 3. Vendas Totais (retorno bruto de todos os tempos)
    const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);

    // 4. Total Investido (soma de todos os custos de compra históricos)
    // Para vendas físicas: pegamos o custo que foi vendido
    // Para estoque atual: somamos o custo do que ainda está em estoque
    const physicalSales = sales.filter(s => s.type === SaleType.PHYSICAL);
    const totalSoldCost = physicalSales.reduce((acc, s) => acc + (s.totalAmount - s.profit), 0);
    const currentStockCost = products.reduce((acc, p) => acc + (p.stockQuantity * p.costPrice), 0);
    const totalInvested = totalSoldCost + currentStockCost;

    // 5. Sales by Origin (com lucro)
    const onlineSales = sales.filter(s => s.type === SaleType.ONLINE);

    const physicalTotal = physicalSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const physicalProfit = physicalSales.reduce((acc, s) => acc + s.profit, 0);

    const onlineTotal = onlineSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const onlineProfit = onlineSales.reduce((acc, s) => acc + s.profit, 0);

    // 6. Calcular valores do mês anterior para indicadores de tendência
    const lastMonthPhysicalSales = lastMonthSales.filter(s => s.type === SaleType.PHYSICAL);
    const lastMonthOnlineSales = lastMonthSales.filter(s => s.type === SaleType.ONLINE);

    const lastMonthPhysicalTotal = lastMonthPhysicalSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const lastMonthOnlineTotal = lastMonthOnlineSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const lastMonthTotalSales = lastMonthSales.reduce((acc, s) => acc + s.totalAmount, 0);

    const salesByOrigin = [
      {
        name: 'Físico (Presencial)',
        revenue: physicalTotal,
        profit: physicalProfit,
        count: physicalSales.length,
        color: '#f9a8d4'
      },
      {
        name: 'Online (Digital)',
        revenue: onlineTotal,
        profit: onlineProfit,
        count: onlineSales.length,
        color: '#6d4c7d'
      }
    ];

    const totalCount = sales.length;

    return {
      totalSales,
      totalProfit,
      physicalTotal,
      physicalProfit,
      onlineTotal,
      onlineProfit,
      totalInvested,
      monthlyProfit,
      lastMonthProfit,
      lastMonthPhysicalTotal,
      lastMonthOnlineTotal,
      lastMonthTotalSales,
      salesByOrigin,
      totalCount
    };
  }, [products, sales]);

  // Calculate chart data from real sales grouped by month
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const last6Months: { name: string; value: number; count: number; profit: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthSales = sales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate.getMonth() === month && saleDate.getFullYear() === year;
      });

      const totalRevenue = monthSales.reduce((acc, s) => acc + s.totalAmount, 0);
      const totalProfit = monthSales.reduce((acc, s) => acc + s.profit, 0);
      const count = monthSales.length;

      last6Months.push({
        name: monthNames[month],
        value: totalRevenue,
        count: count,
        profit: totalProfit
      });
    }

    return last6Months;
  }, [sales]);

  const getChartData = () => {
    return chartData.map(item => ({
      name: item.name,
      value: chartMode === 'revenue' ? item.value : chartMode === 'profit' ? item.profit : item.count
    }));
  };

  const getChartLabel = () => {
    if (chartMode === 'revenue') return 'Faturamento';
    if (chartMode === 'profit') return 'Lucro Líquido';
    return 'Quantidade';
  };

  const getPieChartData = () => {
    return metrics.salesByOrigin.map(item => ({
      ...item,
      value: pieChartMode === 'revenue' ? item.revenue : pieChartMode === 'profit' ? item.profit : item.count
    }));
  };

  const getPieChartLabel = () => {
    if (pieChartMode === 'revenue') return 'Faturamento';
    if (pieChartMode === 'profit') return 'Lucro';
    return 'Vendas';
  };

  const profitGrowth = metrics.lastMonthProfit > 0
    ? ((metrics.monthlyProfit - metrics.lastMonthProfit) / metrics.lastMonthProfit) * 100
    : metrics.monthlyProfit > 0 ? 100 : 0;

  const profitGrowthPositive = profitGrowth >= 0;

  // Calcular crescimento mensal para outros KPIs
  const currentMonthSales = sales.filter(s => {
    const saleDate = new Date(s.date);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
  });

  const currentMonthPhysicalSales = currentMonthSales.filter(s => s.type === SaleType.PHYSICAL);
  const currentMonthOnlineSales = currentMonthSales.filter(s => s.type === SaleType.ONLINE);

  const currentMonthTotalRevenue = currentMonthSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const currentMonthPhysicalRevenue = currentMonthPhysicalSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const currentMonthOnlineRevenue = currentMonthOnlineSales.reduce((acc, s) => acc + s.totalAmount, 0);

  const totalRevenueGrowth = metrics.lastMonthTotalSales > 0
    ? ((currentMonthTotalRevenue - metrics.lastMonthTotalSales) / metrics.lastMonthTotalSales) * 100
    : currentMonthTotalRevenue > 0 ? 100 : 0;

  const physicalGrowth = metrics.lastMonthPhysicalTotal > 0
    ? ((currentMonthPhysicalRevenue - metrics.lastMonthPhysicalTotal) / metrics.lastMonthPhysicalTotal) * 100
    : currentMonthPhysicalRevenue > 0 ? 100 : 0;

  const onlineGrowth = metrics.lastMonthOnlineTotal > 0
    ? ((currentMonthOnlineRevenue - metrics.lastMonthOnlineTotal) / metrics.lastMonthOnlineTotal) * 100
    : currentMonthOnlineRevenue > 0 ? 100 : 0;

  // Top 5 Produtos Mais Vendidos
  const topProducts = useMemo(() => {
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.unitPrice * item.quantity;
        } else {
          productSales.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.unitPrice * item.quantity
          });
        }
      });
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Calculate Percentages for Pie Chart Legend (based on selected mode)
  const pieData = getPieChartData();
  const totalOriginValue = pieData.reduce((acc, curr) => acc + curr.value, 0);
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
          <span className={`${profitGrowthPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border ${profitGrowthPositive ? 'border-green-500/20' : 'border-red-500/20'}`}>
            {profitGrowthPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
            {profitGrowthPositive ? '+' : ''}{profitGrowth.toFixed(0)}%
          </span>
        </div>

        <div className="mb-6 relative z-10">
          <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">{formatCurrency(metrics.monthlyProfit)}</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-xs font-medium">vs. {formatCurrency(metrics.lastMonthProfit)} mês anterior</p>
            {profitGrowthPositive && profitGrowth > 0 && (
              <span className="text-green-400 text-xs font-bold">↑ {formatCurrency(metrics.monthlyProfit - metrics.lastMonthProfit)}</span>
            )}
            {!profitGrowthPositive && (
              <span className="text-red-400 text-xs font-bold">↓ {formatCurrency(Math.abs(metrics.monthlyProfit - metrics.lastMonthProfit))}</span>
            )}
          </div>
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
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                <ShoppingBag size={18} />
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[8px] text-brand-muted uppercase tracking-wider bg-brand-dark px-2 py-0.5 rounded-full">Acumulado</span>
                {totalRevenueGrowth !== 0 && (
                  <span className={`${totalRevenueGrowth >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border`}>
                    {totalRevenueGrowth >= 0 ? '↑' : '↓'}{Math.abs(totalRevenueGrowth).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <p className="text-brand-muted text-[10px] mb-1 font-medium">Faturamento Total</p>
            <p className="text-white font-bold text-lg mb-2">{formatCurrency(metrics.totalSales)}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-brand-muted uppercase">Lucro</p>
                <p className="text-xs text-green-400 font-semibold">{formatCurrency(metrics.totalProfit)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-brand-muted uppercase">Margem</p>
                <p className="text-xs text-purple-400 font-semibold">{metrics.totalSales > 0 ? ((metrics.totalProfit / metrics.totalSales) * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <TrendingUp size={18} />
              </div>
              <span className="text-[8px] text-brand-muted uppercase tracking-wider bg-brand-dark px-2 py-0.5 rounded-full">Retorno</span>
            </div>
            <p className="text-brand-muted text-[10px] mb-1 font-medium">ROI do Negócio</p>
            <p className="text-white font-bold text-lg mb-2">{metrics.totalInvested > 0 ? ((metrics.totalProfit / metrics.totalInvested) * 100).toFixed(1) : 0}%</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-brand-muted uppercase">Lucro</p>
                <p className="text-xs text-green-400 font-semibold">{formatCurrency(metrics.totalProfit)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-brand-muted uppercase">Investido</p>
                <p className="text-xs text-orange-400 font-semibold">{formatCurrency(metrics.totalInvested)}</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <Package size={18} />
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[8px] text-brand-muted uppercase tracking-wider bg-brand-dark px-2 py-0.5 rounded-full">Acumulado</span>
                {physicalGrowth !== 0 && (
                  <span className={`${physicalGrowth >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border`}>
                    {physicalGrowth >= 0 ? '↑' : '↓'}{Math.abs(physicalGrowth).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <p className="text-brand-muted text-[10px] mb-1 font-medium">Vendas Físicas</p>
            <p className="text-white font-bold text-lg mb-2">{formatCurrency(metrics.physicalTotal)}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-brand-muted uppercase">Lucro</p>
                <p className="text-xs text-green-400 font-semibold">{formatCurrency(metrics.physicalProfit)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-brand-muted uppercase">Margem</p>
                <p className="text-xs text-purple-400 font-semibold">{metrics.physicalTotal > 0 ? ((metrics.physicalProfit / metrics.physicalTotal) * 100).toFixed(1) : 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Smartphone size={18} />
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[8px] text-brand-muted uppercase tracking-wider bg-brand-dark px-2 py-0.5 rounded-full">Acumulado</span>
                {onlineGrowth !== 0 && (
                  <span className={`${onlineGrowth >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border`}>
                    {onlineGrowth >= 0 ? '↑' : '↓'}{Math.abs(onlineGrowth).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <p className="text-brand-muted text-[10px] mb-1 font-medium">Comissões Online</p>
            <p className="text-white font-bold text-lg mb-2">{formatCurrency(metrics.onlineTotal)}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-brand-muted uppercase">Lucro Líq.</p>
                <p className="text-xs text-green-400 font-semibold">{formatCurrency(metrics.onlineProfit)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-brand-muted uppercase">Taxa</p>
                <p className="text-xs text-purple-400 font-semibold">15%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Area Chart */}
      <Card className="pt-5 pb-2 px-0 overflow-hidden">
        <div className="px-5 mb-4 flex justify-between items-start">
          <div>
            <p className="text-brand-muted text-xs mb-1">Evolução - {getChartLabel()}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-white font-bold text-2xl">
                {chartMode === 'count'
                  ? `${metrics.totalCount} vendas`
                  : chartMode === 'profit'
                    ? formatCurrency(metrics.totalProfit)
                    : formatCurrency(metrics.totalSales)
                }
              </h3>
              <span className="text-gray-500 text-[10px]">total</span>
            </div>
          </div>
          <div className="flex bg-[#1a121d] rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setChartMode('revenue')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${chartMode === 'revenue' ? 'bg-[#332636] text-white shadow-sm' : 'text-brand-muted hover:text-white'
                }`}
            >
              R$
            </button>
            <button
              onClick={() => setChartMode('profit')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${chartMode === 'profit' ? 'bg-[#332636] text-white shadow-sm' : 'text-brand-muted hover:text-white'
                }`}
            >
              Lucro
            </button>
            <button
              onClick={() => setChartMode('count')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${chartMode === 'count' ? 'bg-[#332636] text-white shadow-sm' : 'text-brand-muted hover:text-white'
                }`}
            >
              Qtd
            </button>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getChartData()} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
                formatter={(value: number) => {
                  if (chartMode === 'count') return value;
                  return formatCurrency(value);
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
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

      {/* Top 5 Produtos Mais Vendidos */}
      {topProducts.length > 0 && (
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-white font-bold text-base">Top 5 Produtos</h3>
              <p className="text-brand-muted text-[10px] mt-0.5">Mais vendidos por faturamento</p>
            </div>
            <button
              onClick={() => setView('stock')}
              className="text-brand-primary text-xs font-medium hover:underline"
            >
              Ver Estoque
            </button>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, index) => {
              const maxRevenue = topProducts[0]?.revenue || 1;
              const percentage = (product.revenue / maxRevenue) * 100;
              const rankColors = ['#f9a8d4', '#e879f9', '#a78bfa', '#60a5fa', '#34d399'];
              const rankColor = rankColors[index] || '#6b7280';

              return (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: `${rankColor}20`, color: rankColor }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm truncate mb-1">{product.name}</h4>
                    <div className="w-full bg-[#1a121d] h-1.5 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: rankColor }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-brand-muted">
                        {product.quantity} {product.quantity === 1 ? 'unidade' : 'unidades'}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: rankColor }}>
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Sales Origin Pie Chart */}
      <Card className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-brand-muted text-xs mb-1">Origem das Vendas</h3>
            <p className="text-white font-bold text-lg">
              {pieChartMode === 'count'
                ? `${totalOriginValue} vendas`
                : formatCurrency(totalOriginValue)
              }
            </p>
          </div>
          <div className="flex bg-[#1a121d] rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setPieChartMode('revenue')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${pieChartMode === 'revenue' ? 'bg-[#332636] text-white shadow-sm' : 'text-brand-muted hover:text-white'
                }`}
            >
              R$
            </button>
            <button
              onClick={() => setPieChartMode('profit')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${pieChartMode === 'profit' ? 'bg-[#332636] text-white shadow-sm' : 'text-brand-muted hover:text-white'
                }`}
            >
              Lucro
            </button>
            <button
              onClick={() => setPieChartMode('count')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${pieChartMode === 'count' ? 'bg-[#332636] text-white shadow-sm' : 'text-brand-muted hover:text-white'
                }`}
            >
              Qtd
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={60}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
              <span className="text-[8px] text-brand-muted mb-0.5 uppercase tracking-tighter">{getPieChartLabel()}</span>
              {(() => {
                const formatted = pieChartMode === 'count' ? totalOriginValue.toString() : formatCurrency(totalOriginValue);
                const isCurrency = formatted.includes('R$');
                const cleanValue = isCurrency ? formatted.replace('R$', '').trim() : formatted;
                const valueLength = cleanValue.length;
                const fontSize = valueLength > 10 ? 'text-[13px]' : valueLength > 7 ? 'text-sm' : 'text-base';

                return (
                  <div className="flex flex-col items-center">
                    {isCurrency && (
                      <span className="text-[7px] font-bold text-brand-muted leading-none mb-0.5">R$</span>
                    )}
                    <span className={`${fontSize} font-bold text-white leading-none text-center`}>
                      {cleanValue}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-4">
            {pieData.map((item) => (
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
                  <span className="text-[10px] text-brand-muted">
                    {pieChartMode === 'count'
                      ? `${item.value} vendas`
                      : formatCurrency(item.value)
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
