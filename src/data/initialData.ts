/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, InventoryItem, Order, Reservation, WeeklyReport } from '../types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv_1',
    name: 'Queijo Mozarela',
    currentStock: 45.5,
    minStock: 10.0,
    unit: 'kg',
    costPerUnit: 38.00,
    supplier: 'Laticínios Sul de Minas',
    lastUpdated: '2026-05-20T10:00:00Z'
  },
  {
    id: 'inv_2',
    name: 'Farinha de Trigo Premium',
    currentStock: 75.0,
    minStock: 15.0,
    unit: 'kg',
    costPerUnit: 6.50,
    supplier: 'Moinho Central',
    lastUpdated: '2026-05-19T14:30:00Z'
  },
  {
    id: 'inv_3',
    name: 'Blend de Carne Bovina (Hamburguer)',
    currentStock: 8.5, // Alerta: Próximo de acabar
    minStock: 10.0,
    unit: 'kg',
    costPerUnit: 42.00,
    supplier: 'Distribuidora Novilho de Prata',
    lastUpdated: '2026-05-21T08:00:00Z'
  },
  {
    id: 'inv_4',
    name: 'Refrigerante Lata 350ml',
    currentStock: 120,
    minStock: 48,
    unit: 'unidades',
    costPerUnit: 2.20,
    supplier: 'Coca-Cola FEMSA',
    lastUpdated: '2026-05-21T11:20:00Z'
  },
  {
    id: 'inv_5',
    name: 'Arroz Arbóreo',
    currentStock: 18.0,
    minStock: 5.0,
    unit: 'kg',
    costPerUnit: 16.00,
    supplier: 'Grãos Nobres',
    lastUpdated: '2026-05-18T09:15:00Z'
  },
  {
    id: 'inv_6',
    name: 'Molho de Tomate Rústico',
    currentStock: 30.0,
    minStock: 8.0,
    unit: 'litros',
    costPerUnit: 14.50,
    supplier: 'Hortifruti Valle Verde',
    lastUpdated: '2026-05-20T15:45:00Z'
  },
  {
    id: 'inv_7',
    name: 'Tomate Italiano',
    currentStock: 3.2, // Baixo estoque!
    minStock: 5.0,
    unit: 'kg',
    costPerUnit: 8.90,
    supplier: 'Hortifruti Valle Verde',
    lastUpdated: '2026-05-21T07:10:00Z'
  },
  {
    id: 'inv_8',
    name: 'Sorvete de Baunilha',
    currentStock: 12.0,
    minStock: 4.0,
    unit: 'litros',
    costPerUnit: 22.00,
    supplier: 'Gelatos Finos',
    lastUpdated: '2026-05-17T11:00:00Z'
  }
];

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'menu_1',
    name: 'Pizza de Calabresa Especial',
    category: 'Pratos Principais',
    price: 52.00,
    cost: 16.50,
    description: 'Molho de tomate rústico, mozarela artesanal, calabresa defumada e cebola roxa marinada.',
    inventoryItemId: 'inv_1',
    qtyConsumed: 0.35 // consome 350g de mozarela
  },
  {
    id: 'menu_2',
    name: 'Hambúrguer Artesanal Supremo',
    category: 'Pratos Principais',
    price: 38.50,
    cost: 12.80,
    description: 'Blend bovino 150g, queijo mozarela derretido, alface, tomate rústico e maionese da casa.',
    inventoryItemId: 'inv_3',
    qtyConsumed: 0.15 // consome 150g de carne
  },
  {
    id: 'menu_3',
    name: 'Risoto de Funghi Secchi',
    category: 'Pratos Principais',
    price: 64.00,
    cost: 21.00,
    description: 'Arroz arbóreo cremoso com cogumelos funghi secchi reidratados, parmesão e azeite trufado.',
    inventoryItemId: 'inv_5',
    qtyConsumed: 0.20 // consome 200g de arroz arbóreo
  },
  {
    id: 'menu_4',
    name: 'Batata Rústica da Casa',
    category: 'Entradas',
    price: 24.00,
    cost: 7.20,
    description: 'Batatas rústicas fritas com ramos de alecrim fresco e dentes de alho confitados.',
  },
  {
    id: 'menu_5',
    name: 'Bruschetta Caprese (2 un)',
    category: 'Entradas',
    price: 21.00,
    cost: 6.00,
    description: 'Pão italiano tostado com tomates frescos marinados no manjericão, alho e mozarela de búfala.',
    inventoryItemId: 'inv_1',
    qtyConsumed: 0.08
  },
  {
    id: 'menu_6',
    name: 'Suco Natural de Laranja 400ml',
    category: 'Bebidas',
    price: 9.50,
    cost: 2.50,
    description: 'Suco de laranja natural espremido na hora, sem adições de conservantes.'
  },
  {
    id: 'menu_7',
    name: 'Refrigerante Lata',
    category: 'Bebidas',
    price: 7.00,
    cost: 2.20,
    description: 'Escolha entre Coca-Cola, Coca-Cola Zero ou Guaraná Antarctica.',
    inventoryItemId: 'inv_4',
    qtyConsumed: 1
  },
  {
    id: 'menu_8',
    name: 'Petit Gâteau Supremo',
    category: 'Sobremesas',
    price: 26.00,
    cost: 8.50,
    description: 'Bolinho quente de chocolate belga, centro cremoso e uma generosa bola de sorvete de baunilha.',
    inventoryItemId: 'inv_8',
    qtyConsumed: 0.15
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'PED-1024',
    tableNumber: 'Mesa 03',
    customerName: 'Aline Souza',
    items: [
      { menuItemId: 'menu_1', name: 'Pizza de Calabresa Especial', quantity: 1, price: 52.00, cost: 16.50 },
      { menuItemId: 'menu_7', name: 'Refrigerante Lata', quantity: 2, price: 7.00, cost: 2.20 }
    ],
    status: 'Entregue',
    totalPrice: 66.00,
    totalCost: 20.90,
    createdAt: '2026-05-21T12:15:00Z',
    notes: 'Pizza bem passada.'
  },
  {
    id: 'ord_2',
    orderNumber: 'PED-1025',
    tableNumber: 'Mesa 08',
    customerName: 'Roberto Mendes',
    items: [
      { menuItemId: 'menu_2', name: 'Hambúrguer Artesanal Supremo', quantity: 2, price: 38.50, cost: 12.80 },
      { menuItemId: 'menu_4', name: 'Batata Rústica da Casa', quantity: 1, price: 24.00, cost: 7.20 },
      { menuItemId: 'menu_6', name: 'Suco Natural de Laranja 400ml', quantity: 2, price: 9.50, cost: 2.50 }
    ],
    status: 'Entregue',
    totalPrice: 120.00,
    totalCost: 37.80,
    createdAt: '2026-05-21T13:02:00Z',
    notes: 'Cortar os hambúrgueres ao meio.'
  },
  {
    id: 'ord_3',
    orderNumber: 'PED-1026',
    tableNumber: 'Mesa 05',
    customerName: 'Bruna Reis',
    items: [
      { menuItemId: 'menu_3', name: 'Risoto de Funghi Secchi', quantity: 1, price: 64.00, cost: 21.00 },
      { menuItemId: 'menu_8', name: 'Petit Gâteau Supremo', quantity: 1, price: 26.00, cost: 8.50 }
    ],
    status: 'Em Preparo',
    totalPrice: 90.00,
    totalCost: 29.50,
    createdAt: '2026-05-21T16:15:00Z'
  },
  {
    id: 'ord_4',
    orderNumber: 'PED-1027',
    tableNumber: 'Delivery',
    customerName: 'Carlos Eduardo',
    items: [
      { menuItemId: 'menu_1', name: 'Pizza de Calabresa Especial', quantity: 2, price: 52.00, cost: 16.50 },
      { menuItemId: 'menu_7', name: 'Refrigerante Lata', quantity: 3, price: 7.00, cost: 2.20 }
    ],
    status: 'Pendente',
    totalPrice: 125.00,
    totalCost: 39.60,
    createdAt: '2026-05-21T16:28:00Z',
    notes: 'Campainha com problema, ligar ao chegar.'
  },
  {
    id: 'ord_5',
    orderNumber: 'PED-1028',
    tableNumber: 'Mesa 01',
    customerName: 'Juliana Torres',
    items: [
      { menuItemId: 'menu_2', name: 'Hambúrguer Artesanal Supremo', quantity: 1, price: 38.50, cost: 12.80 },
      { menuItemId: 'menu_6', name: 'Suco Natural de Laranja 400ml', quantity: 1, price: 9.50, cost: 2.50 }
    ],
    status: 'Pronto',
    totalPrice: 48.00,
    totalCost: 15.30,
    createdAt: '2026-05-21T16:05:00Z'
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res_1',
    customerName: 'Cláudio Ferreira',
    phone: '(11) 98765-4321',
    tableNumber: 'Mesa 02',
    date: '2026-05-21',
    time: '19:30',
    guests: 4,
    status: 'Confirmada',
    notes: 'Aniversário de casamento'
  },
  {
    id: 'res_2',
    customerName: 'Marcela Pinheiro',
    phone: '(11) 99122-3344',
    tableNumber: 'Mesa 06',
    date: '2026-05-21',
    time: '20:00',
    guests: 2,
    status: 'Confirmada',
    notes: 'Prefere mesa no canto da janela se possível.'
  },
  {
    id: 'res_3',
    customerName: 'Thiago Neves',
    phone: '(11) 97722-1100',
    tableNumber: 'Mesa 10',
    date: '2026-05-22',
    time: '12:30',
    guests: 6,
    status: 'Confirmada',
    notes: 'Necessita espaço para cadeirante.'
  },
  {
    id: 'res_4',
    customerName: 'Camila Lima',
    phone: '(11) 99555-8888',
    tableNumber: 'Mesa 04',
    date: '2026-05-20',
    time: '20:15',
    guests: 4,
    status: 'Finalizada',
    notes: 'Tudo perfeito, ótima experiência.'
  },
  {
    id: 'res_5',
    customerName: 'Bruno Alencar',
    phone: '(11) 98111-2222',
    tableNumber: 'Mesa 01',
    date: '2026-05-21',
    time: '13:00',
    guests: 2,
    status: 'Confirmada'
  }
];

export const INITIAL_REPORTS: WeeklyReport[] = [
  {
    id: 'rep_1',
    title: 'Semana 17 - Inicial de Maio',
    weekStartDate: '2026-04-27',
    weekEndDate: '2026-05-03',
    totalRevenue: 13450.00,
    totalCosts: 4850.00,
    netProfit: 8600.00,
    totalOrders: 184,
    totalReservations: 18,
    manualAdjustment: -120.00, // Ajuste para taxa de lixo / pequenos imprevistos
    status: 'Fechado',
    notes: 'Semana excelente com alta saída de risotos. Ajuste manual de -R$120 devido a taxa extra de descarte de resíduos cadastrada.'
  },
  {
    id: 'rep_2',
    title: 'Semana 18 - Dia das Mães Pré',
    weekStartDate: '2026-05-04',
    weekEndDate: '2026-05-10',
    totalRevenue: 18920.50,
    totalCosts: 5620.00,
    netProfit: 13300.50,
    totalOrders: 236,
    totalReservations: 29,
    manualAdjustment: 350.00, // Ajuste manual (bonificação de patrocínio de vinhos)
    status: 'Fechado',
    notes: 'Recorde de faturamento devido ao almoço do Dia das Mães no domingo. Bonificação de patrocínio adicionada (+R$350).'
  },
  {
    id: 'rep_3',
    title: 'Semana 19 - Meio de Maio',
    weekStartDate: '2026-05-11',
    weekEndDate: '2026-05-17',
    totalRevenue: 14120.00,
    totalCosts: 5120.00,
    netProfit: 9000.00,
    totalOrders: 195,
    totalReservations: 15,
    manualAdjustment: 0,
    status: 'Fechado',
    notes: 'Faturamento normal da metade do mês. Custos operacionais dentro do previsto.'
  },
  {
    id: 'rep_4',
    title: 'Semana 20 - Semana Atual',
    weekStartDate: '2026-05-18',
    weekEndDate: '2026-05-24',
    totalRevenue: 8540.00,
    totalCosts: 2980.00,
    netProfit: 5560.00,
    totalOrders: 112,
    totalReservations: 12,
    manualAdjustment: 0.00,
    status: 'Provisório',
    notes: 'Relatório acumulado da semana corrente (provisório) integrado em tempo real.'
  }
];
