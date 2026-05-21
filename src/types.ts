/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  category: 'Entradas' | 'Pratos Principais' | 'Bebidas' | 'Sobremesas';
  price: number;
  cost: number; // Custo de produção/ingredientes do prato
  description?: string;
  inventoryItemId?: string; // Produto do estoque que é consumido por este prato
  qtyConsumed?: number; // Quantidade consumida do item de estoque por porção
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number; // Preço praticado no momento
  cost: number; // Custo do prato pra calcular lucro
}

export type OrderStatus = 'Pendente' | 'Em Preparo' | 'Pronto' | 'Entregue' | 'Cancelado';

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string; // Ex: "Mesa 1", "Mesa 5", "Balcão", "Delivery"
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  totalCost: number;
  createdAt: string; // ISO String
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number; // Limiar de aviso
  unit: string; // "kg", "unidades", "litros", "g", etc.
  costPerUnit: number;
  supplier: string;
  lastUpdated: string;
}

export type ReservationStatus = 'Confirmada' | 'Cancelada' | 'Finalizada';

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  tableNumber: string; // Ex: "Mesa 01"
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  guests: number;
  status: ReservationStatus;
  notes?: string;
}

export interface WeeklyReport {
  id: string;
  title: string; // Ex: "Semana 20 - Maio 2026"
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
  totalRevenue: number; // Receita Total (pedidos)
  totalCosts: number; // Custo Total (ingredientes/operacional)
  netProfit: number; // Lucro Líquido
  totalOrders: number; // Qtd pedidos
  totalReservations: number; // Qtd reservas atendidas
  manualAdjustment: number; // Ajuste financeiro manual solicitado pelo usuário
  status: 'Fechado' | 'Provisório';
  notes?: string;
}
