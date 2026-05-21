/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingDown, 
  Trash2, 
  X, 
  Check, 
  Edit3, 
  Layers, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { InventoryItem } from '../types';

interface EstoqueProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onDeleteInventoryItem: (itemId: string) => void;
}

export function Estoque({
  inventory,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem
}: EstoqueProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'crítico' | 'ok'>('todos');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states to create inventory item
  const [name, setName] = useState('');
  const [currentStock, setCurrentStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(3);
  const [unit, setUnit] = useState('kg');
  const [costPerUnit, setCostPerUnit] = useState<number>(10);
  const [supplier, setSupplier] = useState('');

  // Helpers to adjust quantities in place
  const handleQuickAdjustStock = (item: InventoryItem, delta: number) => {
    const updatedVal = Math.max(0, parseFloat((item.currentStock + delta).toFixed(2)));
    onUpdateInventoryItem({
      ...item,
      currentStock: updatedVal,
      lastUpdated: new Date().toISOString()
    });
  };

  const handleManualValueInput = (item: InventoryItem, valueStr: string) => {
    const val = parseFloat(valueStr);
    if (!isNaN(val) && val >= 0) {
      onUpdateInventoryItem({
        ...item,
        currentStock: val,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name,
      currentStock,
      minStock,
      unit,
      costPerUnit,
      supplier: supplier || 'Fornecedor Local',
      lastUpdated: new Date().toISOString()
    };

    onAddInventoryItem(newItem);
    setIsAddOpen(false);

    // reset fields
    setName('');
    setCurrentStock(10);
    setMinStock(3);
    setUnit('kg');
    setCostPerUnit(10);
    setSupplier('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    onUpdateInventoryItem({
      ...editingItem,
      lastUpdated: new Date().toISOString()
    });
    setEditingItem(null);
  };

  // Filters
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'todos') return matchesSearch;
    
    const isCritical = item.currentStock <= item.minStock;
    if (filterType === 'crítico') return matchesSearch && isCritical;
    if (filterType === 'ok') return matchesSearch && !isCritical;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header com Lançador de Estoque */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans">Cadastros de Estoque e Insumos</h2>
          <p className="text-xs text-slate-500">Insira ingredientes, acompanhe quantitativos físicos em tempo real e realize a alteração manual do estoque disponível</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border-none shadow-xs shrink-0"
        >
          <Plus size={16} /> Cadastrar Insumo
        </button>
      </div>

      {/* Alertas de Insumos Críticos no topo para ação imediata */}
      {inventory.filter(item => item.currentStock <= item.minStock).length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 text-rose-700 p-2 rounded-xl shrink-0 animate-pulse">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900">Estoque Crítico Detectado</h4>
              <p className="text-[11px] text-rose-700">Há ingredientes operacionais abaixo do nível mínimo tolerável. Reponha a quantidade ou contate os distribuidores.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setFilterType('crítico')}
            className="text-xs font-bold text-rose-800 hover:underline bg-white/50 border border-rose-200/50 px-3 py-1.5 rounded-lg whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            Filtrar Críticos ({inventory.filter(item => item.currentStock <= item.minStock).length})
          </button>
        </div>
      )}

      {/* Grid de Busca e Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
            placeholder="Pesquisar ingrediente ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {[
            { id: 'todos', label: 'Todos os Insumos' },
            { id: 'crítico', label: 'Estoque Crítico' },
            { id: 'ok', label: 'Estoque em Conformidade' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 cursor-pointer border hover:border-slate-300 transition ${
                filterType === tab.id 
                  ? 'bg-slate-900 text-white border-slate-900 hover:border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista Principal de Estoque */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-4 px-5">Insumo</th>
                <th className="py-4 px-4 text-center">Quantitativo Físico</th>
                <th className="py-4 px-4">Estoque de Alerta</th>
                <th className="py-4 px-4 text-center">Custo Unitário</th>
                <th className="py-4 px-4">Fornecedor</th>
                <th className="py-4 px-4">Última Atualização</th>
                <th className="py-4 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInventory.length > 0 ? (
                filteredInventory.map(item => {
                  const isCritical = item.currentStock <= item.minStock;

                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/40 transition-colors ${
                      isCritical ? 'bg-rose-50/10' : ''
                    }`}>
                      {/* Name Col */}
                      <td className="py-3 px-5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block text-[13px]">{item.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {item.id}</span>
                        </div>
                      </td>

                      {/* Stock Col (Espaço para alterar manualmente direto na tabela) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Decrementar */}
                          <button
                            onClick={() => handleQuickAdjustStock(item, -1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold transition flex items-center justify-center cursor-pointer border-none text-slate-700 font-mono text-xs"
                            title="Remover 1 unidade fisica"
                          >
                            -
                          </button>

                          {/* Input manual centralizado */}
                          <div className="relative w-20">
                            <input
                              type="number"
                              step="0.01"
                              value={item.currentStock}
                              onChange={(e) => handleManualValueInput(item, e.target.value)}
                              className={`w-full text-center font-mono font-bold text-xs p-1 border rounded focus:outline-none focus:ring-1 ${
                                isCritical 
                                  ? 'border-rose-300 bg-rose-50 text-rose-800 focus:ring-rose-400' 
                                  : 'border-slate-200 bg-slate-50 text-slate-800 focus:ring-slate-400'
                              }`}
                              title="Altere manual o quantitativo físico"
                            />
                            <span className="absolute right-1 bottom-1.5 text-[9px] text-slate-400 font-semibold select-none bg-white p-0.5 rounded leading-none">{item.unit}</span>
                          </div>

                          {/* Incrementar */}
                          <button
                            onClick={() => handleQuickAdjustStock(item, 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold transition flex items-center justify-center cursor-pointer border-none text-slate-700 font-mono text-xs"
                            title="Acrescentar 1 unidade fisica"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Min stock col */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-600">
                            {item.minStock} {item.unit}
                          </span>
                          {isCritical && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 font-semibold px-1 rounded uppercase tracking-wide">
                              Comprar
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cost per unit */}
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                        R$ {item.costPerUnit.toFixed(2)}
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]" title={item.supplier}>
                        {item.supplier}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        {new Date(item.lastUpdated).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-5 text-right space-x-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 px-2 border-none bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs inline-flex items-center gap-1 font-semibold cursor-pointer"
                          title="Alterar cadastro completo"
                        >
                          <Edit3 size={12} /> Editar
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o insumo "${item.name}" do estoque?`)) {
                              onDeleteInventoryItem(item.id);
                            }
                          }}
                          className="p-1 border-none bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-xs cursor-pointer"
                          title="Remover insumo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 bg-slate-50/50">
                    Nenhum insumo encontrado correspondente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD INGREDIENT INVENTARIO */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" id="modal-adicionar-insumo">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Adicionar Novo Insumo</h3>
                <p className="text-[10px] text-slate-500">Cadastre ingrediente para automatizar a cozinha</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {/* Nome */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">DESIGNAÇÃO DO INSUMO *</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                  placeholder="Ex: Queijo Muçarela, Carne Blend..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Linha Físicos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">VOLUME INICIAL *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">LIMIAR DE ALERTA *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                    value={minStock}
                    onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Linha Unidade & Custos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">UNIDADE *</label>
                  <select
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium cursor-pointer"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="kg">kg (Quilogramas)</option>
                    <option value="unidades">unidades (Unid)</option>
                    <option value="litros">litros (L)</option>
                    <option value="g">g (Gramas)</option>
                    <option value="caixas">caixas</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">VALOR UNITÁRIO (CUSTO) *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 text-[11px] flex items-center text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full text-xs pr-3 pl-7 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                      value={costPerUnit}
                      onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {/* Fornecedor */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">DISTRIBUIDOR / FORNECEDOR</label>
                <input
                  type="text"
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                  placeholder="Nome do fornecedor comercial"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border-none text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cadastrar Insumo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT REGISTERED INGREDIENT */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" id="modal-editar-insumo">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Editar Cadastro do Insumo</h3>
                <p className="text-[10px] text-slate-500">Mude limiares, custos e fornecedor do ingrediente cadastrado</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {/* Nome */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">NOME DO INGREDIENTE</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>

              {/* Linha quantidades (Permite alteração manual direta) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">ESTOQUE FÍSICO ATUAL</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                    value={editingItem.currentStock}
                    onChange={(e) => setEditingItem({ ...editingItem, currentStock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">MÍNIMO DE ALERTA</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                    value={editingItem.minStock}
                    onChange={(e) => setEditingItem({ ...editingItem, minStock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Unidade & Custos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">UNIDADE EXIBIÇÃO</label>
                  <input
                    type="text"
                    required
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">CUSTO UNITÁRIO</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2 text-[11px] flex items-center text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full text-xs pr-3 pl-7 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium font-mono"
                      value={editingItem.costPerUnit}
                      onChange={(e) => setEditingItem({ ...editingItem, costPerUnit: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* Fornecedor */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 tracking-wider block mb-1">FORNECEDOR</label>
                <input
                  type="text"
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50 font-medium"
                  value={editingItem.supplier}
                  onChange={(e) => setEditingItem({ ...editingItem, supplier: e.target.value })}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border-none text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Salvar Insumo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
