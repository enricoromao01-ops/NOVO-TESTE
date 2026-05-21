/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Clock, 
  Users, 
  Compass,
  AlertCircle
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../types';

interface ReservasProps {
  reservations: Reservation[];
  onAddReservation: (res: Reservation) => void;
  onUpdateReservation: (res: Reservation) => void;
  onDeleteReservation: (resId: string) => void;
  quickOpenCreate: boolean;
  setQuickOpenCreate: (val: boolean) => void;
}

// Define the 12 primary tables of the restaurant hall
const TOTAL_TABLES = [
  { id: 'Mesa 01', seats: 2, zone: 'Salão Principal' },
  { id: 'Mesa 02', seats: 4, zone: 'Salão Principal' },
  { id: 'Mesa 03', seats: 4, zone: 'Janela Panorâmica' },
  { id: 'Mesa 04', seats: 4, zone: 'Janela Panorâmica' },
  { id: 'Mesa 05', seats: 6, zone: 'Espaço VIP' },
  { id: 'Mesa 06', seats: 2, zone: 'Salão Principal' },
  { id: 'Mesa 07', seats: 2, zone: 'Terraço Externo' },
  { id: 'Mesa 08', seats: 4, zone: 'Terraço Externo' },
  { id: 'Mesa 09', seats: 4, zone: 'Terraço Externo' },
  { id: 'Mesa 10', seats: 8, zone: 'Espaço VIP' },
  { id: 'Mesa 11', seats: 2, zone: 'Salão Principal' },
  { id: 'Mesa 12', seats: 4, zone: 'Salão Principal' },
];

export function Reservas({
  reservations,
  onAddReservation,
  onUpdateReservation,
  onDeleteReservation,
  quickOpenCreate,
  setQuickOpenCreate
}: ReservasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('Mesa 01');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(4);
  const [notes, setNotes] = useState('');

  // Trigger quick open
  React.useEffect(() => {
    if (quickOpenCreate) {
      setIsAddOpen(true);
      setQuickOpenCreate(false);
    }
  }, [quickOpenCreate, setQuickOpenCreate]);

  // Determine actual table states based on reservations today
  const todayStr = new Date().toISOString().split('T')[0];
  const activeReservationsToday = reservations.filter(
    res => res.status === 'Confirmada' && res.date === (dateFilter || todayStr)
  );

  const getTableStatus = (tableId: string) => {
    const res = activeReservationsToday.find(r => r.tableNumber === tableId);
    if (!res) return 'Disponível';
    
    // Simple mock logic: if the reservation hour is close, mark it appropriately
    const currentHour = new Date().getHours();
    const resHour = parseInt(res.time.split(':')[0]);
    if (Math.abs(currentHour - resHour) <= 1) {
      return 'Ocupada';
    }
    return 'Reservada';
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const newRes: Reservation = {
      id: `res_${Date.now()}`,
      customerName,
      phone,
      tableNumber,
      date,
      time,
      guests,
      status: 'Confirmada',
      notes: notes || undefined
    };

    onAddReservation(newRes);
    setIsAddOpen(false);

    // reset Form
    setCustomerName('');
    setPhone('');
    setTableNumber('Mesa 01');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('19:00');
    setGuests(4);
    setNotes('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;

    onUpdateReservation(editingRes);
    setEditingRes(null);
  };

  // Filter reservations
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.phone.includes(searchTerm) ||
      res.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter ? res.date === dateFilter : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header com Lançador de Reservas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reservas de Mesas e Escala do Salão</h2>
          <p className="text-xs text-slate-500 font-sans">Agende clientes, controle o mapa visual de mesas ocupadas em tempo real e alterne as reservas livremente</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border-none shadow-xs shrink-0"
        >
          <Plus size={16} /> Reservar Mesa
        </button>
      </div>

      {/* Grid de Salão Visual (Mapa de Mesas em Tempo Real) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Mapa do Salão do Restaurante</h3>
            <p className="text-xs text-slate-500">Estado de ocupação e reservas para a data de análise: <strong className="font-mono text-indigo-600">{dateFilter || todayStr}</strong></p>
          </div>
          {/* Legenda */}
          <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> Líquido (Disponível)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded" /> Reservada</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded" /> Ocupada</span>
          </div>
        </div>

        {/* Grade de Mesas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3" id="mapa-salao-mesas">
          {TOTAL_TABLES.map(table => {
            const status = getTableStatus(table.id);
            const matchedRes = activeReservationsToday.find(r => r.tableNumber === table.id);

            return (
              <div 
                key={table.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between h-28 leading-none transition-all ${
                  status === 'Disponível' ? 'border-emerald-100 bg-emerald-50/20 text-emerald-900 hover:border-emerald-300' :
                  status === 'Reservada' ? 'border-indigo-100 bg-indigo-50/30 text-indigo-900 hover:border-indigo-300' :
                  'border-amber-100 bg-amber-50/20 text-amber-900 hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs">{table.id}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${
                      status === 'Disponível' ? 'bg-emerald-100 text-emerald-800' :
                      status === 'Reservada' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-1.5">{table.zone}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5 font-mono"><Users size={11} /> {table.seats}</span>
                  {matchedRes && (
                    <span className="text-[9px] text-slate-600 truncate max-w-[80px] font-semibold" title={matchedRes.customerName}>
                      {matchedRes.time} - {matchedRes.customerName.split(' ')[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid de Filtros + Log de Agendamentos */}
      <div className="space-y-4">
        {/* Barra de Filtros */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
              placeholder="Buscar por cliente, mesa ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto self-end">
            <label className="text-[10px] font-bold text-slate-500 block">FILTRAR DATA:</label>
            <input
              type="date"
              className="bg-slate-50 text-xs px-2 py-1 border border-slate-200 rounded-lg focus:outline-none font-bold"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs font-bold text-rose-600 hover:underline border hover:border-slate-300 px-2 py-1 rounded"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Log de reservas */}
        <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-4 px-5">Cliente</th>
                  <th className="py-4 px-4">Mesa</th>
                  <th className="py-4 px-4">Data e Horário</th>
                  <th className="py-4 px-4">Pessoas</th>
                  <th className="py-4 px-4">Observações</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Ações Manuais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block text-[13px]">{res.customerName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{res.phone}</span>
                        </div>
                      </td>

                      {/* Table */}
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {res.tableNumber}
                      </td>

                      {/* Date & Hour */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar size={13} />
                          <span className="font-bold">{res.date}</span>
                          <Clock size={13} className="ml-1.5" />
                          <span className="font-mono">{res.time}</span>
                        </div>
                      </td>

                      {/* Guests */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {res.guests} pessoas
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={res.notes}>
                        {res.notes || <span className="text-[10px] text-slate-350 italic">Sem notas</span>}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-full ${
                          res.status === 'Confirmada' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          res.status === 'Finalizada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {res.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => setEditingRes(res)}
                          className="p-1 px-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 rounded text-xs cursor-pointer inline-flex items-center gap-1 font-semibold"
                          title="Alterar dados manualmente"
                        >
                          <Edit3 size={12} /> Alterar
                        </button>

                        {/* Quick finalize reservation */}
                        {res.status === 'Confirmada' && (
                          <button
                            onClick={() => onUpdateReservation({ ...res, status: 'Finalizada' })}
                            className="p-1 px-1.5 border-none bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-xs cursor-pointer inline-flex items-center justify-center font-semibold"
                            title="Finalizar Mesa / Cliente Atendido"
                          >
                            <Check size={12} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Remover permanentemente agendamento de "${res.customerName}"?`)) {
                              onDeleteReservation(res.id);
                            }
                          }}
                          className="p-1 border-none bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-xs cursor-pointer"
                          title="Excluir agendamento"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 bg-slate-50/50">
                      Nenhum agendamento ativo encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ADD RESERVATION */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" id="modal-adicionar-reserva">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Criar Lançador de Reserva</h3>
                <p className="text-[10px] text-slate-500">Agende e organize o salão</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {/* Cliente Nome */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">NOME DO CLIENTE *</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                  placeholder="Ex: Cláudio Ferreira"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">TELEFONE DE CONTATO *</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                  placeholder="Ex: (11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Mesa & Guests */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">MESA INDICADA</label>
                  <select
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium cursor-pointer"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  >
                    {TOTAL_TABLES.map(t => (
                      <option key={t.id} value={t.id}>{t.id} ({t.seats} Lugares)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">QTD DE PESSOAS</label>
                  <input
                    type="number"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 2)}
                  />
                </div>
              </div>

              {/* Data & Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">DATA AGENDADA *</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">HORÁRIO *</label>
                  <input
                    type="time"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Requisitos especiais */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">REQUISITOS / NOTAS ADICIONAIS</label>
                <textarea
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium h-14 resize-none"
                  placeholder="Ex: Perto do ar condicionado, área externa..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border-none text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Gerar Agendamento de Mesa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUALLY EDIT EXISTING RESERVATION */}
      {editingRes && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" id="modal-editar-reserva">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Editar Reserva Manualmente</h3>
                <p className="text-[10px] text-slate-500">Mude datas, horários, localização e status da mesa reservada</p>
              </div>
              <button onClick={() => setEditingRes(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {/* Status */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">STATUS</label>
                <select
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-bold text-slate-800 cursor-pointer"
                  value={editingRes.status}
                  onChange={(e) => setEditingRes({ ...editingRes, status: e.target.value as ReservationStatus })}
                >
                  <option value="Confirmada">Confirmada</option>
                  <option value="Finalizada">Finalizada (Cancelamento Concluido / Mesa Livre)</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              {/* Cliente Nome */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">ALTERAR NOME</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                  value={editingRes.customerName}
                  onChange={(e) => setEditingRes({ ...editingRes, customerName: e.target.value })}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">ALTERAR TELEFONE</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                  value={editingRes.phone}
                  onChange={(e) => setEditingRes({ ...editingRes, phone: e.target.value })}
                />
              </div>

              {/* Mesa & Guests */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">REMANEJAR MESA</label>
                  <select
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium cursor-pointer"
                    value={editingRes.tableNumber}
                    onChange={(e) => setEditingRes({ ...editingRes, tableNumber: e.target.value })}
                  >
                    {TOTAL_TABLES.map(t => (
                      <option key={t.id} value={t.id}>{t.id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">QTD DE PESSOAS</label>
                  <input
                    type="number"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                    value={editingRes.guests}
                    onChange={(e) => setEditingRes({ ...editingRes, guests: parseInt(e.target.value) || 2 })}
                  />
                </div>
              </div>

              {/* Data & Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">DATA</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none font-bold"
                    value={editingRes.date}
                    onChange={(e) => setEditingRes({ ...editingRes, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">HORÁRIO</label>
                  <input
                    type="time"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none font-bold font-mono"
                    value={editingRes.time}
                    onChange={(e) => setEditingRes({ ...editingRes, time: e.target.value })}
                  />
                </div>
              </div>

              {/* Requisitos especiais */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">OBSERVAÇÕES DO CADASTRADO</label>
                <textarea
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium h-14"
                  value={editingRes.notes || ''}
                  onChange={(e) => setEditingRes({ ...editingRes, notes: e.target.value })}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border-none text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Salvar Definições
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
