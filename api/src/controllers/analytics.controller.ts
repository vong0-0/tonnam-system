import type { RequestHandler } from 'express'
import * as analyticsService from '@/services/analytics.service.js'
import type {
  SalesSummaryQuery,
  SalesComparisonQuery,
  SalesByCategoryQuery,
  MenuBestSellersQuery,
  MenuDeadItemsQuery,
  MenuMixQuery,
} from '@/schemas/analytics.schema.js'
import { success } from '@/utils/response.js'

export const getSalesSummary: RequestHandler = async (req, res, next) => {
  try {
    const result = await analyticsService.getSalesSummary(req.query as unknown as SalesSummaryQuery)
    res.json(success(result, 'OK'))
  } catch (err) {
    next(err)
  }
}

export const getSalesComparison: RequestHandler = async (req, res, next) => {
  try {
    const result = await analyticsService.getSalesComparison(req.query as unknown as SalesComparisonQuery)
    res.json(success(result, 'OK'))
  } catch (err) {
    next(err)
  }
}

export const getSalesByCategory: RequestHandler = async (req, res, next) => {
  try {
    const result = await analyticsService.getSalesByCategory(req.query as unknown as SalesByCategoryQuery)
    res.json(success(result, 'OK'))
  } catch (err) {
    next(err)
  }
}

export const getMenuBestSellers: RequestHandler = async (req, res, next) => {
  try {
    const result = await analyticsService.getMenuBestSellers(req.query as unknown as MenuBestSellersQuery)
    res.json(success(result, 'OK'))
  } catch (err) {
    next(err)
  }
}

export const getMenuDeadItems: RequestHandler = async (req, res, next) => {
  try {
    const result = await analyticsService.getMenuDeadItems(req.query as unknown as MenuDeadItemsQuery)
    res.json(success(result, 'OK'))
  } catch (err) {
    next(err)
  }
}

export const getMenuMix: RequestHandler = async (req, res, next) => {
  try {
    const result = await analyticsService.getMenuMix(req.query as unknown as MenuMixQuery)
    res.json(success(result, 'OK'))
  } catch (err) {
    next(err)
  }
}
