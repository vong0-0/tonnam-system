import { Router } from 'express'
import * as publicMenuController from '@/controllers/public-menu.controller.js'

const router = Router()

router.get('/menu-items', publicMenuController.listPublicMenuItems)
router.get('/menu-categories', publicMenuController.listPublicMenuCategories)

export default router
