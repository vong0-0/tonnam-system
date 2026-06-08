import type { NextFunction, Request, Response } from 'express'
import * as authService from '@/services/auth.service.js'
import * as userService from '@/services/user.service.js'
import { type AuthRequest } from '@/types/index.js'
import { PROBLEM_CONTENT_TYPE, problem } from '@/utils/problem.js'
import { success } from '@/utils/response.js'

function asAuth(req: Request): AuthRequest {
  return req as AuthRequest
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken, refreshToken, user } = await authService.login(
      req.body.username,
      req.body.password,
    )
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.json(success({ access_token: accessToken, user }, 'Login successful'))
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  const refreshToken = req.cookies.refreshToken as string | undefined

  if (!refreshToken) {
    res
      .status(401)
      .type(PROBLEM_CONTENT_TYPE)
      .json(
        problem({
          type: 'unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Refresh token is missing.',
          instance: req.path,
        }),
      )
    return
  }

  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(refreshToken)
    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.json(success({ access_token: accessToken }, 'Token refreshed'))
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  res.clearCookie('refreshToken', cookieOptions)
  try {
    await authService.logout(asAuth(req).user.userId)
    res.json(success(null, 'Logged out successfully'))
  } catch (err) {
    next(err)
  }
}

export async function wsTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, role, name } = asAuth(req).user
    const payload = await authService.generateWsTicket(userId, role, name)
    res.json(success(payload, 'WebSocket ticket generated'))
  } catch (err) {
    next(err)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getUserById(asAuth(req).user.userId)
    res.status(200).json(success(user, 'User retrieved successfully'))
  } catch (err) {
    next(err)
  }
}
