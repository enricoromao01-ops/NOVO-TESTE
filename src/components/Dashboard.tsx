/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  CalendarCheck, 
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Order, InventoryItem, Reservation, WeeklyReport } from '../types';

interface DashboardProps {
  orders: Order[];
  inventory: InventoryItem[];
  reservations: Reservation[];
  reports: WeeklyReport[];
  setActiveTab: (tab: string) => void;
  onOpenQuickOrder: () => void;
  onOpenQuickReservation: () => void;
}

export function Dashboard({ 
  orders, 
  inventory, 
  reservations, 
  reports, 
  setActiveTab,
  onOpenQuickOrder,
  onOpenQuickReservation
}: DashboardProps) {
  
  // Real-time calculations from state
  const activeOrders = orders.filter(o => o.status !== 'Entregue' && o.status !== 'Cancelado');
  const deliveredToday = orders.filter(o => o.status === 'Entregue');
  
  const todayRevenue = deliveredToday.reduce((total, o) => total + o.totalPrice, 0);
  const todayCosts = deliveredToday.reduce((total, o) => total + o.totalCost, 0);
  const todayProfit = todayRevenue - todayCosts;

  // Stock alerts
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);
  
  // Active reservations for today
  const todayStr = new Date().toISOString().split('T')[0];
  const activeReservationsToday = reservations.filter(
    res => res.date === todayStr && res.status === 'Confirmada'
  );

  // Financial Chart Data based on the Weekly Reports
  const chartData = reports.map(rep => ({
    name: rep.title.split(' - ')[0], // Ex: "Semana 17"
    Receita: rep.totalRevenue,
    Custo: rep.totalCosts + Math.max(0, -rep.manualAdjustment),
    Lucro: rep.netProfit + rep.manualAdjustment
  }));

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-lg font-sans">
          <p className="font-semibold text-slate-800 mb-1.5">{label}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-6 text-xs mb-1">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-mono font-medium text-slate-800">
                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas & Tempo Real */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-400 text-xs px-2.5 py-1 rounded-full border border-sky-400/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            Sincronizado em Tempo Real
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Suas Operações de Hoje</h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl">
            Bem-vindo ao centro de comando. Gerencie pedidos ativos, mesas, controle o estoque e audite o faturamento semanal acumulado.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/8">
          <CalendarCheck size={320} />
        </div>
      </div>

      {/* Grid de KPIs de Operação Local */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento do Dia */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="kpi-faturamento">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faturamento Hoje</span>
              <h3 className="text-xl md:text-2xl font-bold font-mono text-slate-800">
                R$ {todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Lucro Líquido: <strong className="font-mono text-emerald-600">R$ {todayProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
              {todayRevenue > 0 ? `${Math.round((todayProfit / todayRevenue) * 100)}% margem` : '0%'}
            </span>
          </div>
        </div>

        {/* KPI 2: Pedidos Pendentes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="kpi-pedidos">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fila em Tempo Real</span>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-baseline gap-2">
                {activeOrders.length} <span className="text-xs font-normal text-slate-500 font-sans">pedidos ativos</span>
              </h3>
            </div>
            <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl animate-pulse">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
            <button 
              onClick={() => setActiveTab('pedidos')} 
              className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              Ir para Pedidos <ArrowRight size={12} />
            </button>
            <span className="text-slate-400 flex items-center gap-1 font-mono">
              <Clock size={12} /> {orders.filter(o => o.status === 'Pendente').length} pd. pendentes
            </span>
          </div>
        </div>

        {/* KPI 3: Reservas para Hoje */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="kpi-reservas">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reservas do Dia</span>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                {activeReservationsToday.length} <span className="text-xs font-normal text-slate-400">mesas</span>
              </h3>
            </div>
            <div className="bg-sky-50 text-sky-600 p-2.5 rounded-xl">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
            <button 
              onClick={() => setActiveTab('reservas')} 
              className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              Organizar Salão <ArrowRight size={12} />
            </button>
            <span className="text-slate-500">Total: {reservations.length} agendamentos</span>
          </div>
        </div>

        {/* KPI 4: Alertas de Estoque */}
        <div className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all ${
          lowStockItems.length > 0 
            ? 'bg-rose-50/50 border-rose-100 text-rose-900' 
            : 'bg-white border-slate-100'
        }`} id="kpi-estoque">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alertas de Estoque</span>
              <h3 className="text-xl md:text-2xl font-bold flex items-center gap-1.5 text-slate-800">
                {lowStockItems.length > 0 ? (
                  <>
                    <span className="text-rose-600 font-mono">{lowStockItems.length}</span>
                    <span className="text-xs font-normal text-rose-600">itens críticos</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-600 font-mono">0</span>
                    <span className="text-xs font-normal text-slate-400">alertas ativos</span>
                  </>
                )}
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl ${
              lowStockItems.length > 0 ? 'bg-rose-100 text-rose-600 animate-bounce' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button 
              onClick={() => setActiveTab('estoque')} 
              className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              Repor Estoque <ArrowRight size={12} />
            </button>
            <span className="text-slate-400 shrink-0 select-none">
              {lowStockItems.length > 0 ? 'Reposição necessária!' : 'Tudo abastecido'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Central: Gráfico de Receita vs Gastos + Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Financeiro Semanal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="font-bold text-slate-800">Histórico de Relatórios Financeiros</h3>
              <p className="text-xs text-slate-500">Gráfico consolidado de desempenho por agrupamento semanal de faturamento</p>
            </div>
            <button 
              onClick={() => setActiveTab('relatorios')} 
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 shrink-0 self-start"
            >
              Ver Detalhes Financeiros
            </button>
          </div>

          <div className="h-[280px] w-full" id="grafico-financeiro-dashboard">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `R$${v}`} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReceita)" name="Receita Bruta" />
                <Area type="monotone" dataKey="Lucro" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLucro)" name="Lucro Líquido" />
                <Area type="monotone" dataKey="Custo" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorCusto)" name="Custos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Painel Lateral: Ações Rápidas & Resumo do Salão */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3" id="dashboard-acoes-rapidas">
              <button 
                onClick={onOpenQuickOrder}
                className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-all text-emerald-800 text-center gap-2 group cursor-pointer"
              >
                <div className="bg-emerald-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <Plus size={18} />
                </div>
                <span className="text-xs font-semibold">Lançar Pedido</span>
              </button>

              <button 
                onClick={onOpenQuickReservation}
                className="flex flex-col items-center justify-center p-4 bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-xl transition-all text-sky-800 text-center gap-2 group cursor-pointer"
              >
                <div className="bg-sky-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <Plus size={18} />
                </div>
                <span className="text-xs font-semibold">Nova Reserva</span>
              </button>
            </div>
            
            <button
              onClick={() => setActiveTab('relatorios')}
              className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border-none text-white text-xs font-semibold rounded-xl transition-colors inline-flex justify-center items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp size={14} /> Registrar Novo Relatório
            </button>
          </div>

          {/* Seção Alertas de Estoque Rápido */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Alertas de Reposição</h3>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-600 font-medium">
                {lowStockItems.length} itens
              </span>
            </div>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3 max-h-[145px] overflow-y-auto pr-1">
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/30">
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                        Abaixo do Mín.
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-800">
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 space-y-1">
                <p className="text-xs font-semibold text-slate-600">Nenhum alerta crítico</p>
                <p className="text-[10px]">Todo os itens do estoque estão com as quantidades adequadas.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Detalhes Adicionais: Fila Diária Ativa */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Pedidos Próximos na Fila</h3>
            <p className="text-xs text-slate-500">Pedidos em preparação ativa ou aguardando entrega imediata</p>
          </div>
          <button 
            onClick={() => setActiveTab('pedidos')} 
            className="text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1"
          >
            Ver Cozinha ({activeOrders.length}) <ArrowRight size={14} />
          </button>
        </div>

        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.slice(0, 3).map(order => (
              <div key={order.id} className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 font-mono">{order.orderNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      order.status === 'Pendente' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'Em Preparo' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'Pronto' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-500">{order.tableNumber} • Mestre: {order.customerName}</h4>
                </div>
                
                <div className="border-t border-slate-200/50 pt-2.5">
                  <div className="space-y-1 text-xs">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-slate-600">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="font-mono text-slate-500">R$ {(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200/50 pt-2.5 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">Lançado às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-xs font-bold font-mono text-slate-800">Total: R$ {order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-1">
            <ShoppingBag size={28} className="mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">Cozinha tranquila neste momento</p>
            <p className="text-[10px]">Não há pedidos pendentes ou em preparo ativo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
