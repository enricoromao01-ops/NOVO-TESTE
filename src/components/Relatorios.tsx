/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Plus, 
  X, 
  Check, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Calendar, 
  Lock, 
  Unlock,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { WeeklyReport, Order, Reservation } from '../types';

interface RelatoriosProps {
  reports: WeeklyReport[];
  orders: Order[];
  reservations: Reservation[];
  onAddReport: (report: WeeklyReport) => void;
  onUpdateReport: (report: WeeklyReport) => void;
  onDeleteReport: (reportId: string) => void;
}

export function Relatorios({
  reports,
  orders,
  reservations,
  onAddReport,
  onUpdateReport,
  onDeleteReport
}: RelatoriosProps) {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[reports.length - 1]?.id || '');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // New report form states (Altered manually)
  const [newTitle, setNewTitle] = useState('');
  const [newStartDate, setNewStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [newEndDate, setNewEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newRevenue, setNewRevenue] = useState<number>(0);
  const [newCosts, setNewCosts] = useState<number>(0);
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const [newReservationsCount, setNewReservationsCount] = useState<number>(0);
  const [newAdjustment, setNewAdjustment] = useState<number>(0);
  const [newNotes, setNewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'Fechado' | 'Provisório'>('Fechado');

  // Edit report states
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);

  // Selected Report for breakdown view
  const activeReport = reports.find(r => r.id === selectedReportId) || reports[reports.length - 1];

  // Helper to auto-calculate values based on selected dates FROM state
  // to give them a baseline, but STILL letting them alter everthing manually
  const handleAutoCalculateFromState = () => {
    const start = new Date(newStartDate + 'T00:00:00');
    const end = new Date(newEndDate + 'T23:59:59');

    // Filter orders & reservations in range
    const filteredOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= start && orderDate <= end && o.status === 'Entregue';
    });

    const filteredReservations = reservations.filter(r => {
      const resDate = new Date(r.date + 'T00:00:00');
      return resDate >= start && resDate <= end && r.status === 'Finalizada';
    });

    const sumRevenue = filteredOrders.reduce((total, o) => total + o.totalPrice, 0);
    const sumCosts = filteredOrders.reduce((total, o) => total + o.totalCost, 0);

    setNewRevenue(parseFloat(sumRevenue.toFixed(2)));
    setNewCosts(parseFloat(sumCosts.toFixed(2)));
    setNewOrdersCount(filteredOrders.length);
    setNewReservationsCount(filteredReservations.length);
    
    // Set a matching Title
    const weekNum = Math.floor(Math.random() * 52) + 1;
    setNewTitle(`Semana ${weekNum} - Fechamento Real`);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Por favor, defina um título para o relatório.');
      return;
    }

    const calculatedProfit = newRevenue - newCosts;

    const newReport: WeeklyReport = {
      id: `rep_${Date.now()}`,
      title: newTitle,
      weekStartDate: newStartDate,
      weekEndDate: newEndDate,
      totalRevenue: newRevenue,
      totalCosts: newCosts,
      netProfit: calculatedProfit,
      totalOrders: newOrdersCount,
      totalReservations: newReservationsCount,
      manualAdjustment: newAdjustment,
      status: newStatus,
      notes: newNotes || undefined
    };

    onAddReport(newReport);
    setIsCreateOpen(false);
    setSelectedReportId(newReport.id);

    // reset fields
    setNewTitle('');
    setNewRevenue(0);
    setNewCosts(0);
    setNewOrdersCount(0);
    setNewReservationsCount(0);
    setNewAdjustment(0);
    setNewNotes('');
  };

  const handleOpenEdit = (report: WeeklyReport) => {
    setEditingReport({ ...report });
    setIsEditOpen(true);
  };

  const handleSaveEditReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    const calculatedProfit = editingReport.totalRevenue - editingReport.totalCosts;
    const updatedReport: WeeklyReport = {
      ...editingReport,
      netProfit: calculatedProfit
    };

    onUpdateReport(updatedReport);
    setIsEditOpen(false);
    setEditingReport(null);
  };

  // Chart Data preparation
  const barChartData = reports.map(r => ({
    name: r.title.split(' - ')[0],
    Receita: r.totalRevenue,
    Custos: r.totalCosts + Math.max(0, -r.manualAdjustment),
    Lucro: r.totalRevenue - r.totalCosts + r.manualAdjustment
  }));

  return (
    <div className="space-y-6">
      {/* Header com Lançador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Relatórios Financeiros Semanais</h2>
          <p className="text-xs text-slate-500 font-sans">Gere fechamentos financeiros, visualize balanços acumulados e altere manualmente valores de receitas, custos e de ajustes operacionais</p>
        </div>
        <button
          onClick={() => {
            setNewTitle('');
            setNewStatus('Fechado');
            setIsCreateOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border-none shadow-xs shrink-0"
        >
          <Plus size={16} /> Lançar Relatório Manual
        </button>
      </div>

      {/* Seção Balanço Visual com Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Gráfico de Barras Financeiras Semanal (2 colunas) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Comparação de Desempenho Semanal</h3>
            <p className="text-xs text-slate-500">Fluxos financeiros de Receita Líquida, Gastos Operacionais e Margem Bruta acumulada por semana</p>
          </div>

          <div className="h-[270px] w-full" id="grafico-relatorios-barras">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                  contentStyle={{ fontSize: '11px', borderRadius: '10px', fontFamily: 'sans-serif', border: '1px solid #e2e8f0' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} name="Receita Bruta" />
                <Bar dataKey="Custos" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Custos Totais" />
                <Bar dataKey="Lucro" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Balanço Final" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coluna Direita: Seletor de Semanas Cadastradas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3 flex-1">
            <h3 className="font-bold text-slate-800 text-sm">Relatórios Cadastrados</h3>
            <p className="text-xs text-slate-500">Selecione uma semana abaixo para abrir e auditar o demonstrativo detalhado das contas</p>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1" id="lista-seletas-relatorios">
              {reports.map((rep) => {
                const totalFinal = rep.totalRevenue - rep.totalCosts + rep.manualAdjustment;

                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      (selectedReportId === rep.id || (!selectedReportId && activeReport?.id === rep.id))
                        ? 'border-indigo-500 bg-indigo-50/20 text-indigo-950 font-bold' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-bold line-clamp-1">{rep.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {rep.weekStartDate} a {rep.weekEndDate}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="font-mono text-xs font-bold block">
                        R$ {totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${
                        rep.status === 'Fechado' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detalhamento do Relatório Selecionado */}
      {activeReport ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="detalhe-relatorio-financeiro">
          {/* Header Detalhado */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base">{activeReport.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-full ${
                  activeReport.status === 'Fechado' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  Demonstrativo {activeReport.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Competência: {activeReport.weekStartDate} até {activeReport.weekEndDate}
              </p>
            </div>

            <div className="flex gap-2">
              {/* Botão de Editar Relatório Selecionado */}
              <button
                onClick={() => handleOpenEdit(activeReport)}
                className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                title="Editar manualmente todos estes campos"
              >
                <Edit3 size={14} /> Alterar Valores Manualmente
              </button>

              {/* Botão de Excluir */}
              <button
                onClick={() => {
                  if (confirm('Excluir este fechamento de relatório financeiro?')) {
                    onDeleteReport(activeReport.id);
                  }
                }}
                className="p-2 bg-rose-50 hover:bg-rose-100 border-none text-rose-600 hover:text-rose-800 rounded-xl cursor-pointer"
                title="Remover relatório do histórico"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Cards Demonstrativo numérico */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Receita faturada */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Receita Bruto de Pedidos</span>
              <span className="font-mono text-xl font-bold text-slate-800 block mt-1">R$ {activeReport.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <p className="text-[10px] text-slate-400 mt-2">Faturado em {activeReport.totalOrders} pedidos entregues.</p>
            </div>

            {/* 2. Custos faturados */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Custo Operacional de Insumos</span>
              <span className="font-mono text-xl font-bold text-rose-700 block mt-1">R$ {activeReport.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <p className="text-[10px] text-slate-400 mt-2">Processamentos de gastos cadastrados na cozinha.</p>
            </div>

            {/* 3. Ajuste manual */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ajuste Financeiro Manual</span>
              <span className={`font-mono text-xl font-bold block mt-1 ${
                activeReport.manualAdjustment >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {activeReport.manualAdjustment >= 0 ? '+' : ''}R$ {activeReport.manualAdjustment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-slate-400 mt-2">Diferença aplicada diretamente pelo usuário.</p>
            </div>

            {/* 4. Lucro Liquido */}
            <div className="bg-slate-900 text-white p-4 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Resultado Financeiro (Lucro)</span>
              <span className="font-mono text-xl font-bold text-sky-400 block mt-1">
                R$ {(activeReport.totalRevenue - activeReport.totalCosts + activeReport.manualAdjustment).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-slate-300 mt-2">Margem final real: <strong className="text-emerald-300">
                {activeReport.totalRevenue > 0 ? `${Math.round(((activeReport.totalRevenue - activeReport.totalCosts + activeReport.manualAdjustment) / activeReport.totalRevenue) * 100)}%` : '0%'}
              </strong> do total.</p>
            </div>
          </div>

          {/* Notas explicativas */}
          <div className="px-6 pb-6 pt-2 border-t border-slate-50">
            <h4 className="text-xs font-bold text-slate-700 mb-1 leading-none uppercase tracking-wide">Notas Fiscais / Comentários Adicionais</h4>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 text-xs text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
              {activeReport.notes || "Não há anotações adicionais anexadas a este demonstrativo de relatório semanal."}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <p className="text-slate-400 text-xs">Selecione ou clique para gerar um relatório semanal na barra para análise financeira.</p>
        </div>
      )}

      {/* MODAL: MANUALLY LAUNCH NEW REPORT */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" id="modal-adicionar-relatorio">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Lançar Balanço Semanal</h3>
                <p className="text-[10px] text-slate-500">Configure livremente e altere cada campo manualmente para o fechamento</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Opção Auto preencher de apoio */}
              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase">Sugestão Automática</span>
                  <p className="text-[9px] text-indigo-700">Preencha os campos usando o acumulador do sistema para as datas selecionadas</p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoCalculateFromState}
                  className="bg-indigo-600 hover:bg-indigo-700 border-none text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Calculator size={13} /> Processar Sistema
                </button>
              </div>

              {/* Título de Referência */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">CÓDIGO / TÍTULO DO RELATÓRIO *</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                  placeholder="Ex: Semana 20 - Final de Maio"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              {/* Competência de Datas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">DATA DE INÍCIO *</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none font-bold"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">DATA DE TÉRMINO *</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none font-bold"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Faturamento e Custos Manuais */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">FATURAMENTO TOTAL *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 text-xs flex items-center font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full text-xs pr-3 pl-7 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold font-mono"
                      value={newRevenue}
                      onChange={(e) => setNewRevenue(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">CUSTOS OPERACIONAIS *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 text-xs flex items-center font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full text-xs pr-3 pl-7 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold font-mono"
                      value={newCosts}
                      onChange={(e) => setNewCosts(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {/* Quantitativo de Pedidos e Ajuste */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">AJUSTE ADICIONAL DE BALANÇO</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 text-xs flex items-center font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full text-xs pr-3 pl-7 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold font-mono"
                      placeholder="0.00"
                      value={newAdjustment}
                      onChange={(e) => setNewAdjustment(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">QTD DE PEDIDOS ENREGUES</label>
                  <input
                    type="number"
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                    value={newOrdersCount}
                    onChange={(e) => setNewOrdersCount(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Reservas e Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">SITUAÇÃO DO FECHAMENTO</label>
                  <select
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none cursor-pointer font-bold"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                  >
                    <option value="Fechado">Fechado (Concluido)</option>
                    <option value="Provisório">Provisório (Parcial)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">QTD RESERVAS FINALIZADAS</label>
                  <input
                    type="number"
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                    value={newReservationsCount}
                    onChange={(e) => setNewReservationsCount(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">MOTIVO DO AJUSTE / COMENTÁRIOS</label>
                <textarea
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium h-16 resize-none"
                  placeholder="Ex: Aluguel descontado no fechamento, taxas extras de descarte..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              {/* Lucro de Fechamento Simulado */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-slate-350 uppercase">Resultado Acumulado</span>
                <span className="font-mono text-base font-bold text-sky-400">
                  R$ {(newRevenue - newCosts + newAdjustment).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 border-none text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Anexar demonstrativo financeiro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUALLY EDIT EXISTING WEEKLY REPORT */}
      {isEditOpen && editingReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" id="modal-editar-relatorio">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-sans">Alterar Dados do Fechamento Financeiro</h3>
                <p className="text-[10px] text-slate-500 font-sans">Altere livremente receitas, custos de cozimento e anotações</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditReport} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Título */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1 font-sans">TÍTULO DA CONTA</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold"
                  value={editingReport.title}
                  onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })}
                />
              </div>

              {/* Linha Competência */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">INÍCIO DA COMPETÊNCIA</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none font-bold"
                    value={editingReport.weekStartDate}
                    onChange={(e) => setEditingReport({ ...editingReport, weekStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1 font-sans">FIM DA COMPETÊNCIA</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none font-bold"
                    value={editingReport.weekEndDate}
                    onChange={(e) => setEditingReport({ ...editingReport, weekEndDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Valores de Receita e Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1 font-mono">RECEITA BRUTA (PEDIDOS)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 text-xs flex items-center font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full text-xs pr-3 pl-7 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold font-mono"
                      value={editingReport.totalRevenue}
                      onChange={(e) => setEditingReport({ ...editingReport, totalRevenue: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1 font-sans">CUSTOS OPERACIONAIS (INSUMOS/ETC)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 text-xs flex items-center font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full text-xs pr-3 pl-7 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold font-mono"
                      value={editingReport.totalCosts}
                      onChange={(e) => setEditingReport({ ...editingReport, totalCosts: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Quantidade e Ajuste */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">AJUSTE DIRETO REALIZADO</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 text-xs flex items-center font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full text-xs pr-3 pl-7 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold font-mono"
                      value={editingReport.manualAdjustment}
                      onChange={(e) => setEditingReport({ ...editingReport, manualAdjustment: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">CADASTRADO PEDIDOS TOTAL</label>
                  <input
                    type="number"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold font-mono"
                    value={editingReport.totalOrders}
                    onChange={(e) => setEditingReport({ ...editingReport, totalOrders: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Reservas e Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">SITUAÇÃO DO FECHAMENTO</label>
                  <select
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none cursor-pointer font-bold text-slate-800 bg-slate-50"
                    value={editingReport.status}
                    onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value as any })}
                  >
                    <option value="Fechado">Fechado</option>
                    <option value="Provisório">Provisório</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">RESERVAS TOTAL</label>
                  <input
                    type="number"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold font-mono"
                    value={editingReport.totalReservations}
                    onChange={(e) => setEditingReport({ ...editingReport, totalReservations: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">NOTAS EXPLICATIVAS DO FECHAMENTO</label>
                <textarea
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 p-2 h-16 resize-none"
                  value={editingReport.notes || ''}
                  onChange={(e) => setEditingReport({ ...editingReport, notes: e.target.value })}
                />
              </div>

              {/* Demonstrativo final */}
              <div className="bg-slate-900 text-white p-3 flex justify-between items-center rounded-xl">
                <span className="text-xs font-bold text-slate-350 uppercase">Novo Saldo Líquido</span>
                <span className="font-mono text-base font-bold text-sky-400">
                  R$ {(editingReport.totalRevenue - editingReport.totalCosts + editingReport.manualAdjustment).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border-none text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Salvar Definições Alteradas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
