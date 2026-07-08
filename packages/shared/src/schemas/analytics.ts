/**
 * Analytics DTOs shared between the API and the seller web dashboard.
 *
 * These describe the shape of the aggregate metrics returned by
 * `GET /api/v1/analytics/summary`. Monetary values are strings (see the
 * money-as-string convention); counts are plain numbers.
 */

export interface ProductsByStatus {
  DRAFT: number;
  ACTIVE: number;
  ARCHIVED: number;
}

export interface CategoryProductCount {
  /** Null represents products with no category assigned. */
  categoryId: string | null;
  name: string;
  productCount: number;
}

export interface CurrencyValue {
  /** ISO-4217 currency code. */
  currency: string;
  /** Total on-hand inventory value in this currency, as a fixed-precision string. */
  value: string;
}

export interface AnalyticsSummary {
  products: {
    total: number;
    byStatus: ProductsByStatus;
  };
  categories: {
    total: number;
  };
  variants: {
    total: number;
  };
  inventory: {
    /** Total units on hand across all variants. */
    totalUnits: number;
    /** Number of variants at or below their low-stock threshold. */
    lowStockCount: number;
    /** On-hand inventory value, grouped by product currency. */
    valueByCurrency: CurrencyValue[];
  };
  /** Product counts per category, highest first (includes an "Uncategorized" bucket). */
  productsByCategory: CategoryProductCount[];
}
