// ... (manter tipos existentes)

// Inventory Types
export type InventoryCategory = 'material' | 'ferramenta' | 'consumivel' | 'outro';
export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string; // kg, m, un, etc.
  minStock: number;
  unitCost: number;
  totalValue: number;
  location: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  date: Date;
  userId: string;
}

// ... (resto do arquivo)