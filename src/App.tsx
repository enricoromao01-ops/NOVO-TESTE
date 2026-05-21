/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShoppingBag, 
  Layers, 
  Calendar, 
  TrendingUp, 
  Check, 
  Utensils, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Order, InventoryItem, Reservation, WeeklyReport, MenuItem, OrderItem } from './types';
import { 
  INITIAL_INVENTORY, 
  INITIAL_MENU, 
  INITIAL_ORDERS, 
  INITIAL_RESERVATIONS, 
  INITIAL_REPORTS 
} from './data/initialData';

// Subcomponents
import { Dashboard } from './components/Dashboard';
import { Pedidos } from './components/Pedidos';
import { Estoque } from './components/Estoque';
import { Reservas } from './components/Reservas';
import { Relatorios } from './components/Relatorios';

export default function App() {
  const [activeTab, setActiveTab330] = useState<string>('dashboard');

  // Core application states
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);

  // Auxiliary triggers for quick actions
  const [quickOpenOrder, setQuickOpenOrder] = useState(false);
  const [quickOpenRes, setQuickOpenRes] = useState(false);

  // Load from localStorage on initialization
  useEffect(() => {
    const savedInventory = localStorage.getItem('rest_inventory');
    const savedOrders = localStorage.getItem('rest_orders');
    const savedReservations = localStorage.getItem('rest_reservations');
    const savedReports = localStorage.getItem('rest_reports');

    setInventory(savedInventory ? JSON.parse(savedInventory) : INITIAL_INVENTORY);
    setOrders(savedOrders ? JSON.parse(savedOrders) : INITIAL_ORDERS);
    setReservations(savedReservations ? JSON.parse(savedReservations) : INITIAL_RESERVATIONS);
    setReports(savedReports ? JSON.parse(savedReports) : INITIAL_REPORTS);
  }, []);

  // Sync to localStorage when state changes
  useEffect(() => {
    if (inventory.length > 0) localStorage.setItem('rest_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    if (orders.length > 0) localStorage.setItem('rest_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (reservations.length > 0) localStorage.setItem('rest_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    if (reports.length > 0) localStorage.setItem('rest_reports', JSON.stringify(reports));
  }, [reports]);

  // Handlers for Pedidos
  const handleAddOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // Automate stock reduction based on menu recipes
  const handleDepleteStock = (orderedItems: OrderItem[]) => {
    setInventory(prevInv => {
      return prevInv.map(invItem => {
        // Calculate total amount consumed of this ingredient
        let totalConsumed = 0;
        orderedItems.forEach(ordItem => {
          const menuItem = menu.find(m => m.id === ordItem.menuItemId);
          if (menuItem && menuItem.inventoryItemId === invItem.id && menuItem.qtyConsumed) {
            totalConsumed += menuItem.qtyConsumed * ordItem.quantity;
          }
        });

        if (totalConsumed > 0) {
          const updatedStock = Math.max(0, parseFloat((invItem.currentStock - totalConsumed).toFixed(2)));
          return {
            ...invItem,
            currentStock: updatedStock,
            lastUpdated: new Date().toISOString()
          };
        }
        return invItem;
      });
    });
  };

  // Handlers for Estoque
  const handleAddInventoryItem = (newItem: InventoryItem) => {
    setInventory(prev => [newItem, ...prev]);
  };

  const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };

  // Handlers for Reservas
  const handleAddReservation = (newRes: Reservation) => {
    setReservations(prev => [newRes, ...prev]);
  };

  const handleUpdateReservation = (updatedRes: Reservation) => {
    setReservations(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
  };

  const handleDeleteReservation = (resId: string) => {
    setReservations(prev => prev.filter(r => r.id !== resId));
  };

  // Handlers for Relatorios
  const handleAddReport = (newReport: WeeklyReport) => {
    setReports(prev => [...prev, newReport]);
  };

  const handleUpdateReport = (updatedReport: WeeklyReport) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between font-sans">
      
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 text-white p-2.5 rounded-xl">
              <Utensils size={20} />
            </div>
            <div>
              <span className="font-mono text-[9px] font-bold text-slate-400 tracking-widest block uppercase">Sala de Controle</span>
              <h1 className="text-sm font-bold text-slate-800 leading-none">Gestão de Restaurante</h1>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-xl" id="nav-central">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
              { id: 'estoque', label: 'Estoque', icon: Layers },
              { id: 'reservas', label: 'Reservas', icon: Calendar },
              { id: 'relatorios', label: 'Financeiro', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab330(tab.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border-none whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Panel Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <Dashboard 
            orders={orders}
            inventory={inventory}
            reservations={reservations}
            reports={reports}
            setActiveTab={setActiveTab330}
            onOpenQuickOrder={() => {
              setActiveTab330('pedidos');
              setQuickOpenOrder(true);
            }}
            onOpenQuickReservation={() => {
              setActiveTab330('reservas');
              setQuickOpenRes(true);
            }}
          />
        )}

        {activeTab === 'pedidos' && (
          <Pedidos 
            orders={orders}
            menu={menu}
            inventory={inventory}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            onDepleteStock={handleDepleteStock}
            quickOpenCreate={quickOpenOrder}
            setQuickOpenCreate={setQuickOpenOrder}
          />
        )}

        {activeTab === 'estoque' && (
          <Estoque 
            inventory={inventory}
            onAddInventoryItem={handleAddInventoryItem}
            onUpdateInventoryItem={handleUpdateInventoryItem}
            onDeleteInventoryItem={handleDeleteInventoryItem}
          />
        )}

        {activeTab === 'reservas' && (
          <Reservas 
            reservations={reservations}
            onAddReservation={handleAddReservation}
            onUpdateReservation={handleUpdateReservation}
            onDeleteReservation={handleDeleteReservation}
            quickOpenCreate={quickOpenRes}
            setQuickOpenCreate={setQuickOpenRes}
          />
        )}

        {activeTab === 'relatorios' && (
          <Relatorios 
            reports={reports}
            orders={orders}
            reservations={reservations}
            onAddReport={handleAddReport}
            onUpdateReport={handleUpdateReport}
            onDeleteReport={handleDeleteReport}
          />
        )}
      </main>

      {/* Elegant Standard Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Painel Administrativo Offline-First persistido localmente</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Gestão de Restaurante. Licença Geral.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
