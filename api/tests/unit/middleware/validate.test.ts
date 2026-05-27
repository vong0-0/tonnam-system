import express, { type Request, type Response } from 'express'
import request from 'supertest'
import { z } from 'zod'
import { validate } from '@/middleware/validate.js'

const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be greater than 0'),
  email: z.string().email('Invalid email format'),
})

function createTestApp() {
  const app = express()
  app.use(express.json())
  app.post('/test', validate(testSchema), (req: Request, res: Response) => {
    res.status(200).json({ body: req.body })
  })
  return app
}

describe('validate middleware', () => {
  const app = createTestApp()

  it('passes validation and calls next() with valid body', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Pad Thai', price: 120, email: 'test@example.com' })

    expect(res.status).toBe(200)
    expect(res.body.body).toEqual({
      name: 'Pad Thai',
      price: 120,
      email: 'test@example.com',
    })
  })

  it('returns 400 when required field is missing', async () => {
    const res = await request(app)
      .post('/test')
      .send({ price: 120, email: 'test@example.com' })

    expect(res.status).toBe(400)
    expect(res.headers['content-type']).toMatch(/application\/problem\+json/)
    expect(res.body.type).toContain('validation-error')
    expect(res.body.title).toBe('Validation Error')
    expect(Array.isArray(res.body.errors)).toBe(true)
    expect(
      res.body.errors.some((e: { field: string }) => e.field === 'name'),
    ).toBe(true)
  })

  it('returns 400 when field has wrong type', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Pad Thai', price: 'not-a-number', email: 'test@example.com' })

    expect(res.status).toBe(400)
    expect(
      res.body.errors.some((e: { field: string }) => e.field === 'price'),
    ).toBe(true)
  })

  it('returns 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Pad Thai', price: 120, email: 'invalid-email' })

    expect(res.status).toBe(400)
    expect(
      res.body.errors.some((e: { field: string }) => e.field === 'email'),
    ).toBe(true)
  })

  it('returns 400 with all field errors when body is empty', async () => {
    const res = await request(app).post('/test').send({})

    expect(res.status).toBe(400)
    expect(res.body.errors).toHaveLength(3)
    const fields: string[] = res.body.errors.map((e: { field: string }) => e.field)
    expect(fields).toContain('name')
    expect(fields).toContain('price')
    expect(fields).toContain('email')
  })

  it('strips extra fields from parsed body', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Pad Thai', price: 120, email: 'test@example.com', extra: 'should be removed' })

    expect(res.status).toBe(200)
    expect(res.body.body).not.toHaveProperty('extra')
  })
})
