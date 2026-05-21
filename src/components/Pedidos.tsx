/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ShoppingBag, 
  X, 
  Check, 
  Search, 
  AlertCircle, 
  DollarSign, 
  UtensilsCrossed, 
  ListChecks, 
  ArrowRight
} from 'lucide-react';
import { Order, OrderItem, MenuItem, OrderStatus, InventoryItem } from '../types';

interface PedidosProps {
  orders: Order[];
  menu: MenuItem[];
  inventory: InventoryItem[];
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onDepleteStock: (items: OrderItem[]) => void;
  quickOpenCreate: boolean;
  setQuickOpenCreate: (val: boolean) => void;
}

export function Pedidos({
  orders,
  menu,
  inventory,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onDepleteStock,
  quickOpenCreate,
  setQuickOpenCreate
}: PedidosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Create state
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('Mesa 01');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [customTotalPrice, setCustomTotalPrice] = useState<string>(''); // For manual overrides!
  
  // Edit state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editTableNumber, setEditTableNumber] = useState('');
  const [editOrderNotes, setEditOrderNotes] = useState('');
  const [editSelectedItems, setEditSelectedItems] = useState<OrderItem[]>([]);
  const [editCustomTotalPrice, setEditCustomTotalPrice] = useState<string>('');
  const [editStatus, setEditStatus] = useState<OrderStatus>('Pendente');

  // Trigger quick open
  React.useEffect(() => {
    if (quickOpenCreate) {
      setIsCreateOpen(true);
      setQuickOpenCreate(false);
    }
  }, [quickOpenCreate, setQuickOpenCreate]);

  // Helpers for Create Order
  const handleAddItemToOrder = (menuItem: MenuItem) => {
    const existing = selectedItems.find(x => x.menuItemId === menuItem.id);
    if (existing) {
      setSelectedItems(selectedItems.map(x => 
        x.menuItemId === menuItem.id ? { ...x, quantity: x.quantity + 1 } : x
      ));
    } else {
      setSelectedItems([...selectedItems, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price,
        cost: menuItem.cost
      }]);
    }
  };

  const handleUpdateItemQty = (menuItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setSelectedItems(selectedItems.filter(x => x.menuItemId !== menuItemId));
    } else {
      setSelectedItems(selectedItems.map(x => 
        x.menuItemId === menuItemId ? { ...x, quantity: newQty } : x
      ));
    }
  };

  // Helper to change custom item price manually in current order creator
  const handleUpdateItemPrice = (menuItemId: string, newPrice: number) => {
    setSelectedItems(selectedItems.map(x =>
      x.menuItemId === menuItemId ? { ...x, price: newPrice } : x
    ));
  };

  const calculatedSubtotal = selectedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const calculatedCost = selectedItems.reduce((acc, it) => acc + (it.cost * it.quantity), 0);
  const actualTotalPrice = customTotalPrice !== '' ? parseFloat(customTotalPrice) || 0 : calculatedSubtotal;

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }

    const orderNumber = `PED-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      tableNumber,
      customerName,
      items: selectedItems,
      status: 'Pendente',
      totalPrice: actualTotalPrice,
      totalCost: calculatedCost,
      createdAt: new Date().toISOString(),
      notes: orderNotes
    };

    // Auto deplete stock on creating pending order
    onDepleteStock(selectedItems);
    onAddOrder(newOrder);

    // Reset fields
    setCustomerName('');
    setTableNumber('Mesa 01');
    setOrderNotes('');
    setSelectedItems([]);
    setCustomTotalPrice('');
    setIsCreateOpen(false);
  };

  // Helpers for Edit Order
  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setEditCustomerName(order.customerName);
    setEditTableNumber(order.tableNumber);
    setEditOrderNotes(order.notes || '');
    setEditSelectedItems(order.items);
    setEditCustomTotalPrice(order.totalPrice.toString());
    setEditStatus(order.status);
    setIsEditOpen(true);
  };

  const handleEditAddItem = (menuItem: MenuItem) => {
    const existing = editSelectedItems.find(x => x.menuItemId === menuItem.id);
    if (existing) {
      setEditSelectedItems(editSelectedItems.map(x => 
        x.menuItemId === menuItem.id ? { ...x, quantity: x.quantity + 1 } : x
      ));
    } else {
      setEditSelectedItems([...editSelectedItems, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price,
        cost: menuItem.cost
      }]);
    }
  };

  const handleEditUpdateItemQty = (menuItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setEditSelectedItems(editSelectedItems.filter(x => x.menuItemId !== menuItemId));
    } else {
      setEditSelectedItems(editSelectedItems.map(x => 
        x.menuItemId === menuItemId ? { ...x, quantity: newQty } : x
      ));
    }
  };

  const handleEditUpdateItemPrice = (menuItemId: string, newPrice: number) => {
    setEditSelectedItems(editSelectedItems.map(x =>
      x.menuItemId === menuItemId ? { ...x, price: newPrice } : x
    ));
  };

  const editCalculatedSubtotal = editSelectedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const editCalculatedCost = editSelectedItems.reduce((acc, it) => acc + (it.cost * it.quantity), 0);
  const editActualTotalPrice = editCustomTotalPrice !== '' ? parseFloat(editCustomTotalPrice) || 0 : editCalculatedSubtotal;

  const handleSaveEditOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (!editCustomerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }
    if (editSelectedItems.length === 0) {
      alert('O pedido precisa ter pelo menos um item.');
      return;
    }

    const updatedOrder: Order = {
      ...editingOrder,
      customerName: editCustomerName,
      tableNumber: editTableNumber,
      notes: editOrderNotes,
      items: editSelectedItems,
      status: editStatus,
      totalPrice: editActualTotalPrice,
      totalCost: editCalculatedCost
    };

    onUpdateOrder(updatedOrder);
    setIsEditOpen(false);
    setEditingOrder(null);
  };

  const advanceOrderStatus = (order: Order) => {
    let nextStatus: OrderStatus = order.status;
    if (order.status === 'Pendente') nextStatus = 'Em Preparo';
    else if (order.status === 'Em Preparo') nextStatus = 'Pronto';
    else if (order.status === 'Pronto') nextStatus = 'Entregue';

    onUpdateOrder({
      ...order,
      status: nextStatus
    });
  };

  // Filtering Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (statusFilter === 'todos') return matchesSearch;
    if (statusFilter === 'ativos') return matchesSearch && order.status !== 'Entregue' && order.status !== 'Cancelado';
    if (statusFilter === 'concluidos') return matchesSearch && order.status === 'Entregue';
    if (statusFilter === 'cancelados') return matchesSearch && order.status === 'Cancelado';
    return matchesSearch && order.status === statusFilter;
  });

  return (
    <div className="space-y-6 text-slate-300">
      {/* Header com Lançador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121214] p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white">Fila de Pedidos</h2>
          <p className="text-xs text-slate-400">Controle pratos encaminhados, andamento da cozinha e faça ajustes nos valores e itens</p>
        </div>
        <button
          onClick={() => {
            setSelectedItems([]);
            setCustomerName('');
            setTableNumber('Mesa 01');
            setOrderNotes('');
            setCustomTotalPrice('');
            setIsCreateOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border-none shadow-md shadow-emerald-900/10 shrink-0 transition"
        >
          <Plus size={16} /> Lançar Novo Pedido
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#121214] p-4 rounded-xl border border-slate-800 shadow-md flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-550 text-slate-500 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#0A0A0B] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
            placeholder="Buscar por cliente, pedido ou mesa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'ativos', label: 'Ativos' },
            { id: 'Pendente', label: 'Pendentes' },
            { id: 'Em Preparo', label: 'Na Cozinha' },
            { id: 'Pronto', label: 'Prontos' },
            { id: 'concluidos', label: 'Entregues' },
            { id: 'cancelados', label: 'Cancelados' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 cursor-pointer border transition ${
                statusFilter === tab.id 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/15 hover:border-emerald-600' 
                  : 'bg-[#0A0A0B] text-slate-300 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards dos Pedidos */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className={`bg-[#121214] rounded-2xl border transition-all shadow-md flex flex-col justify-between relative overflow-hidden ${
                order.status === 'Cancelado' ? 'border-red-900/40 bg-red-950/5' : 'border-slate-800 hover:border-emerald-500/10'
              }`}
            >
              {/* Top Banner de Status do Card */}
              <div className={`h-1.5 w-full ${
                order.status === 'Pendente' ? 'bg-amber-400' :
                order.status === 'Em Preparo' ? 'bg-indigo-500' :
                order.status === 'Pronto' ? 'bg-emerald-500' :
                order.status === 'Entregue' ? 'bg-slate-500' : 'bg-red-500'
              }`} />

              <div className="p-4 flex-1 space-y-4">
                {/* Cabeçalho do Pedido */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
                      <span className="text-slate-600 shrink-0 select-none">•</span>
                      <span className="text-xs bg-[#0A0A0B] border border-slate-800 font-bold px-2 py-0.5 rounded text-emerald-400 font-mono">
                        {order.tableNumber}
                      </span>
                    </div>
                    <h3 className="text-xs text-slate-500 font-semibold mt-1">
                      Cliente: <span className="text-slate-300 font-bold">{order.customerName}</span>
                    </h3>
                  </div>
                  
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    order.status === 'Pendente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    order.status === 'Em Preparo' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                    order.status === 'Pronto' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    order.status === 'Entregue' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Itens do Pedido */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-300 font-medium font-sans">
                        {item.quantity}x <strong className="font-semibold text-white">{item.name}</strong>
                      </span>
                      <span className="font-mono text-slate-400 font-bold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notas/Observações */}
                {order.notes && (
                  <div className="bg-[#0A0A0B] p-2 rounded-lg text-[10px] text-slate-400 italic border border-slate-800/60">
                    <span className="font-bold text-[9px] not-italic text-slate-500 block mb-0.5 uppercase tracking-wide">Observações</span>
                    {order.notes}
                  </div>
                )}
              </div>

              {/* Rodapé do Card com Valores e Ações */}
              <div className="bg-[#121214]/65 px-4 py-3 rounded-b-2xl border-t border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-550 text-slate-500 font-mono">
                    {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block leading-none mb-0.5">Faturamento total</span>
                    <span className="font-mono font-bold text-white text-xs">
                      R$ {order.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Ações operacionais do pedido */}
                <div className="flex justify-between gap-1.5 pt-1.5 border-t border-slate-800/50">
                  <div className="flex gap-1.5">
                    {/* Botão de Excluir */}
                    <button 
                      onClick={() => {
                        if (confirm('Deseja excluir permanentemente este pedido do banco de dados?')) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="p-1 px-2 border-none bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 text-rose-400 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center"
                      title="Excluir do sistema"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Botão de Editar Manualmente */}
                    <button 
                      onClick={() => handleOpenEdit(order)}
                      className="p-1 px-2.5 border border-slate-800 bg-[#0A0A0B] hover:bg-slate-850 bg-opacity-70 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                      title="Editar Valores Manualmente"
                    >
                      <Edit3 size={13} /> Alterar
                    </button>
                  </div>

                  {/* Botão de Avanço de Status */}
                  {order.status !== 'Entregue' && order.status !== 'Cancelado' && (
                    <button
                      onClick={() => advanceOrderStatus(order)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/10 text-white rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 border-none"
                    >
                      {order.status === 'Pendente' && <>Iniciar Preparo <ArrowRight size={10} /></>}
                      {order.status === 'Em Preparo' && <>Concluir Prato <Check size={11} /></>}
                      {order.status === 'Pronto' && <>Entregar <Check size={11} /></>}
                    </button>
                  )}

                  {/* Se cancelado ou entregue, pode haver reverter */}
                  {(order.status === 'Entregue' || order.status === 'Cancelado') && (
                    <button
                      onClick={() => {
                        onUpdateOrder({ ...order, status: 'Pendente' });
                      }}
                      className="px-2.5 py-1 bg-[#0A0A0B] hover:bg-[#121214] text-slate-300 border border-slate-800 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                    >
                      Reabrir Pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#121214] p-12 text-center rounded-2xl border border-slate-800 shadow-md space-y-2">
          <ShoppingBag className="mx-auto text-slate-650 text-slate-600" size={40} />
          <h3 className="font-bold text-white">Nenhum Pedido Encontrado</h3>
          <p className="text-xs text-slate-450 text-slate-400 max-w-sm mx-auto">
            Não há registros correspondentes aos filtros selecionados. Considere redefinir os filtros ou criar um novo pedido na cozinha.
          </p>
        </div>
      )}

      {/* MODAL: MANUALLY CREATE ORDER */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#121214] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95" id="modal-criar-pedido">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800/80 flex justify-between items-center bg-[#0d0d0f]">
              <div>
                <h3 className="font-bold text-white text-base">Lançar Novo Pedido de Clientes</h3>
                <p className="text-xs text-slate-400">Adicione pratos, configure quantidades e realize ajustes manuais nos preços</p>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-8050 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content (Scrollable Grid) */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#121214]">
              
              {/* Coluna Esquerda: Itens do Menu Seleção (7 colunas) */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-slate-550 text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <UtensilsCrossed size={12} /> Menu do Restaurante
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {menu.map((menuItem) => {
                    const matchedInv = inventory.find(inv => inv.id === menuItem.inventoryItemId);
                    const isOutOfStock = matchedInv && matchedInv.currentStock <= 0;

                    return (
                      <button
                        key={menuItem.id}
                        type="button"
                        onClick={() => !isOutOfStock && handleAddItemToOrder(menuItem)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                          isOutOfStock 
                            ? 'border-slate-900 bg-slate-900/30 opacity-40 cursor-not-allowed' 
                            : 'border-slate-800 bg-[#0A0A0B] hover:border-slate-700 hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-semibold font-mono">
                            {menuItem.category}
                          </span>
                          <h5 className="text-xs font-bold text-white line-clamp-1 mt-1">{menuItem.name}</h5>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{menuItem.description}</p>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/60 w-full">
                          <span className="font-mono text-xs font-bold text-slate-350 text-slate-300">R$ {menuItem.price.toFixed(2)}</span>
                          {isOutOfStock ? (
                            <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
                              Indisponível (Sem Estoque)
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              + Adicionar
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coluna Direita: Dados de Cadastro & Itens Selecionados (5 colunas) */}
              <div className="lg:col-span-5 border-l border-slate-800 lg:pl-6 space-y-4 flex flex-col">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ListChecks size={12} /> Detalhes do Pedido
                </h4>

                <form onSubmit={handleSaveOrder} className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Nome do Cliente */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1">CADASTRAR CLIENTE *</label>
                      <input
                        type="text"
                        required
                        className="w-full text-xs px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:border-slate-700 bg-[#0A0A0B] text-white font-medium"
                        placeholder="Nome para entrega ou mesa"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>

                    {/* Local (Mesa / Delivery) */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1">MESA / LOCALIZAÇÃO</label>
                      <select
                        className="w-full text-xs px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:border-slate-700 bg-[#0A0A0B] text-white font-medium cursor-pointer"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                      >
                        <option value="Mesa 01">Mesa 01</option>
                        <option value="Mesa 02">Mesa 02</option>
                        <option value="Mesa 03">Mesa 03</option>
                        <option value="Mesa 04">Mesa 04</option>
                        <option value="Mesa 05">Mesa 05</option>
                        <option value="Mesa 06">Mesa 06</option>
                        <option value="Mesa 07">Mesa 07</option>
                        <option value="Mesa 08">Mesa 08</option>
                        <option value="Mesa 09">Mesa 09</option>
                        <option value="Mesa 10">Mesa 10</option>
                        <option value="Balcão">Balcão Secundário</option>
                        <option value="Delivery">Entrega (Delivery)</option>
                      </select>
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1">REQUISÍTOS DA COZINHA (NOTAS)</label>
                      <textarea
                        className="w-full text-xs px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:border-slate-700 bg-[#0A0A0B] text-white font-medium h-12 resize-none"
                        placeholder="Ex: sem cebola, ponto da carne mal passado..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                      />
                    </div>

                    {/* Itens do Pedido Atuais */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1">ITENS DO PEDIDO</label>
                      {selectedItems.length > 0 ? (
                        <div className="bg-[#0A0A0B] border border-slate-803 border-slate-800 rounded-xl p-2 max-h-[160px] overflow-y-auto space-y-2">
                          {selectedItems.map((item) => (
                            <div key={item.menuItemId} className="flex justify-between items-center text-xs bg-[#121214] p-2 rounded-lg border border-slate-800">
                              <div className="space-y-0.5 max-w-[130px] truncate">
                                <span className="font-bold text-white text-[11px] block truncate">{item.name}</span>
                                <input
                                  type="number"
                                  className="w-16 text-[10px] px-1 py-0.5 border border-slate-800 bg-[#0A0A0B] text-slate-200 rounded font-mono"
                                  value={item.price}
                                  onChange={(e) => handleUpdateItemPrice(item.menuItemId, parseFloat(e.target.value) || 0)}
                                  title="Clique para alterar preço manualmente"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 border border-slate-800 rounded-lg bg-[#0A0A0B] overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQty(item.menuItemId, item.quantity - 1)}
                                    className="px-2 py-0.5 bg-slate-800 text-slate-350 hover:bg-slate-700 transition text-[10px] font-bold cursor-pointer border-none"
                                  >
                                    -
                                  </button>
                                  <span className="w-5 text-center font-mono font-bold text-[11px] text-white">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQty(item.menuItemId, item.quantity + 1)}
                                    className="px-2 py-0.5 bg-slate-800 text-slate-350 hover:bg-slate-700 transition text-[10px] font-bold cursor-pointer border-none"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500 bg-[#0A0A0B] rounded-xl text-xs flex flex-col items-center gap-1 border border-slate-800">
                          <AlertCircle size={16} /> Adicione pratos do menu à esquerda
                        </div>
                      )}
                    </div>

                    {/* Espaços para alterar manualmente o Valor Total */}
                    <div className="border-t border-slate-800 pt-2.5">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-semibold">Valor dos Pratos:</span>
                        <span className="font-mono font-bold text-slate-300">R$ {calculatedSubtotal.toFixed(2)}</span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center bg-[#0A0A0B] p-2 rounded-lg border border-dashed border-slate-800">
                          <label className="text-[10px] font-bold text-slate-500 block">ALTERAR VALOR TOTAL MANUALLY:</label>
                          <div className="relative w-28">
                            <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-xs font-bold text-slate-500">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              className="w-full text-right font-mono font-bold text-xs bg-[#121214] text-white border border-slate-800 rounded p-1 pl-6 focus:outline-none focus:border-slate-700"
                              placeholder={calculatedSubtotal.toFixed(2)}
                              value={customTotalPrice}
                              onChange={(e) => setCustomTotalPrice(e.target.value)}
                            />
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 italic mt-1">Dica: Deixe em branco para usar o subtotal somado automaticamente.</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Pedido */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Final Lançado</span>
                      <span className="font-mono font-bold text-base text-white">
                        R$ {actualTotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-none transition cursor-pointer shadow-lg shadow-emerald-950/20"
                    >
                      Processar Pedido
                    </button>
                  </div>
                </form>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUALLY EDIT EXISTING ORDER AND COST */}
      {isEditOpen && editingOrder && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#121214] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95" id="modal-alterar-pedido">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800/80 flex justify-between items-center bg-[#0d0d0f]">
              <div>
                <h3 className="font-bold text-white text-base">Alterar Detalhes do Pedido {editingOrder.orderNumber}</h3>
                <p className="text-xs text-slate-400">Substitua pratos, altere o status manualmente ou aplique descontos no valor global</p>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content  */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#121214]">
              
              {/* Menu */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <UtensilsCrossed size={12} /> Menu do Restaurante
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {menu.map((menuItem) => (
                    <button
                      key={menuItem.id}
                      type="button"
                      onClick={() => handleEditAddItem(menuItem)}
                      className="text-left p-3 rounded-xl border border-slate-800 bg-[#0A0A0B] hover:border-slate-700 hover:bg-slate-900/40 transition duration-150 cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-semibold font-mono">
                          {menuItem.category}
                        </span>
                        <h5 className="text-xs font-bold text-white line-clamp-1 mt-1">{menuItem.name}</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{menuItem.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/60 w-full">
                        <span className="font-mono text-xs font-bold text-slate-350 text-slate-300">R$ {menuItem.price.toFixed(2)}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          + Adicionar
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Inputs */}
              <div className="lg:col-span-5 border-l border-slate-800 lg:pl-6 space-y-4 flex flex-col">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ListChecks size={12} /> Alterar Valores e Cadastro
                </h4>

                <form onSubmit={handleSaveEditOrder} className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Status Manually Override */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1">STATUS DO PEDIDO</label>
                      <select
                        className="w-full text-xs px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:border-slate-700 bg-[#0A0A0B] font-bold cursor-pointer text-slate-200"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Em Preparo">Em Preparo (Na Cozinha)</option>
                        <option value="Pronto">Pronto (Balcão de Saída)</option>
                        <option value="Entregue">Entregue / Pago</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>

                    {/* Cliente */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1">ALTERAR CLIENTE</label>
                      <input
                        type="text"
                        required
                        className="w-full text-xs px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:border-slate-700 bg-[#0A0A0B] text-white font-medium"
                        value={editCustomerName}
                        onChange={(e) => setEditCustomerName(e.target.value)}
                      />
                    </div>

                    {/* Mesa */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1">ALTERAR LOCALIZAÇÃO</label>
                      <input
                        type="text"
                        required
                        className="w-full text-xs px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:border-slate-700 bg-[#0A0A0B] text-white font-medium"
                        value={editTableNumber}
                        onChange={(e) => setEditTableNumber(e.target.value)}
                      />
                    </div>

                    {/* Notas */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1">NOTAS DO PEDIDO</label>
                      <textarea
                        className="w-full text-xs px-3 py-1.5 border border-slate-800 rounded-lg focus:outline-none focus:border-slate-700 bg-[#0A0A0B] text-white font-medium h-12"
                        value={editOrderNotes}
                        onChange={(e) => setEditOrderNotes(e.target.value)}
                      />
                    </div>

                    {/* Items Current List */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 tracking-wider block mb-1">ITENS SELECIONADOS NO PEDIDO</label>
                      <div className="bg-[#0A0A0B] border border-slate-800 rounded-xl p-2 max-h-[140px] overflow-y-auto space-y-2">
                        {editSelectedItems.map((item) => (
                          <div key={item.menuItemId} className="flex justify-between items-center text-xs bg-[#121214] p-2 rounded-lg border border-slate-800">
                            <div className="space-y-0.5 max-w-[130px] truncate">
                              <span className="font-bold text-white text-[11px] block truncate">{item.name}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] font-semibold text-slate-500">Preço:</span>
                                <input
                                  type="number"
                                  className="w-14 text-[9px] px-1 py-0 px-0.5 border border-slate-800 bg-[#0A0A0B] text-slate-200 rounded font-mono"
                                  value={item.price}
                                  onChange={(e) => handleEditUpdateItemPrice(item.menuItemId, parseFloat(e.target.value) || 0)}
                                  title="Clique para editar valor"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 border border-slate-800 rounded bg-[#0A0A0B]">
                                <button
                                  type="button"
                                  onClick={() => handleEditUpdateItemQty(item.menuItemId, item.quantity - 1)}
                                  className="px-1.5 py-0.5 bg-slate-800 text-slate-300 hover:bg-slate-700 text-[10px] font-bold cursor-pointer border-none"
                                >
                                  -
                                </button>
                                <span className="w-5 text-center font-mono text-[10px] font-bold text-white">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleEditUpdateItemQty(item.menuItemId, item.quantity + 1)}
                                  className="px-1.5 py-0.5 bg-slate-800 text-slate-300 hover:bg-slate-700 text-[10px] font-bold cursor-pointer border-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom Pricing block */}
                    <div className="border-t border-slate-800 pt-2.5">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-semibold">Valor dos Pratos:</span>
                        <span className="font-mono font-bold text-slate-300">R$ {editCalculatedSubtotal.toFixed(2)}</span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center bg-[#0A0A0B] p-2 rounded-lg border border-dashed border-slate-800">
                          <label className="text-[10px] font-bold text-slate-500 block">FORÇAR VALOR TOTAL (MODIFICAÇÃO):</label>
                          <div className="relative w-28">
                            <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-xs font-bold text-slate-505 font-sans">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              className="w-full text-right font-mono font-bold text-xs bg-[#121214] text-white border border-slate-800 rounded p-1 pl-6 focus:outline-none focus:border-slate-700"
                              placeholder={editCalculatedSubtotal.toFixed(2)}
                              value={editCustomTotalPrice}
                              onChange={(e) => setEditCustomTotalPrice(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Lançado</span>
                      <span className="font-mono font-bold text-base text-white">
                        R$ {editActualTotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-none transition cursor-pointer shadow-lg shadow-emerald-900/10 font-sans"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
