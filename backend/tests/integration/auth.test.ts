import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/index'
import { prismaMock } from '../../src/__mocks__/prisma'
import bcrypt from 'bcryptjs'

// Need to mock redis/cache to avoid actual Redis connections in tests
vi.mock('../../src/middleware/rateLimiter', () => ({
  generalLimiter: (req: any, res: any, next: any) => next(),
  authLimiter: (req: any, res: any, next: any) => next(),
  uploadLimiter: (req: any, res: any, next: any) => next(),
}))
vi.mock('../../src/middleware/auth', async () => {
  const actual = await vi.importActual('../../src/middleware/auth')
  return {
    ...actual,
    AuthCache: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(true),
      delete: vi.fn().mockResolvedValue(true),
    }
  }
})

describe('Auth Integration Tests', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: 'LGU_ADMIN',
        isActive: true,
        phone: null,
        address: '',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('id', 'user-123')
      expect(res.body.user).toHaveProperty('role', 'LGU_ADMIN')
      expect(res.body.user).toHaveProperty('address', '')
      // Note: Access token may also be sent in a cookie
      expect(res.headers['set-cookie']).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: 'LGU_ADMIN',
        isActive: true,
        phone: null,
        address: '',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED')
      expect(res.body.error).toHaveProperty('message', 'Invalid email or password')
    })
  })

  describe('POST /api/v1/auth/register', () => {
    it('should register successfully and preserve address', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)
      prismaMock.user.create.mockResolvedValue({
        id: 'user-456',
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'CITIZEN',
        phone: '09123456789',
        avatarUrl: null,
        address: '123 Green St, Barangay Clean',
        createdAt: new Date(),
      } as any)

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '09123456789',
          address: '123 Green St, Barangay Clean',
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('id', 'user-456')
      expect(res.body.user).toHaveProperty('address', '123 Green St, Barangay Clean')
    })
  })
})
