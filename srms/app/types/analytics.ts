export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface HourlyBreakdown {
  hour:    number
  revenue: number
  bills:   number
}

export interface DailyBreakdown {
  date:    string
  day:     string
  revenue: number
  bills:   number
}

export interface MonthlyBreakdown {
  month:   string
  revenue: number
  bills:   number
}

export interface SalesSummary {
  period:              AnalyticsPeriod
  date:                string
  total_revenue:       number
  total_bills:         number
  total_orders:        number
  average_bill_amount: number
  payment_breakdown:   { cash: number; qr_promptpay: number }
  peak:                { label: string; revenue: number; bills: number }
  breakdown:           HourlyBreakdown[] | DailyBreakdown[] | MonthlyBreakdown[]
}

export interface SalesComparison {
  period:   AnalyticsPeriod
  current:  { date: string; total_revenue: number; total_bills: number; total_orders: number }
  previous: { date: string; total_revenue: number; total_bills: number; total_orders: number }
  changes: {
    revenue_change:         number
    revenue_change_percent: number
    bills_change:           number
    bills_change_percent:   number
    orders_change:          number
    orders_change_percent:  number
  }
}

export interface SalesByCategory {
  period:        AnalyticsPeriod
  date:          string
  total_revenue: number
  categories: Array<{
    category_id:      string
    category_name:    string
    revenue:          number
    percentage:       number
    total_items_sold: number
  }>
}

export interface MenuBestSellers {
  period: AnalyticsPeriod
  date:   string
  items: Array<{
    menu_item_id:        string
    name:                string
    category_name:       string
    total_quantity_sold: number
    total_revenue:       number
    rank:                number
  }>
}

export interface MenuDeadItems {
  period:    AnalyticsPeriod
  date:      string
  threshold: number
  items: Array<{
    menu_item_id:        string
    name:                string
    category_name:       string
    total_quantity_sold: number
    total_revenue:       number
    unit_price:          number
    is_available:        boolean
    is_sold_out:         boolean
  }>
}

export interface MenuMix {
  period:           AnalyticsPeriod
  date:             string
  total_items_sold: number
  total_revenue:    number
  items: Array<{
    menu_item_id:        string
    name:                string
    category_name:       string
    total_quantity_sold: number
    total_revenue:       number
    quantity_percentage: number
    revenue_percentage:  number
  }>
}
