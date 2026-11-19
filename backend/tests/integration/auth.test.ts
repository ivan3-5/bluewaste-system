import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/index'
import { prismaMock } from '../../src/__mocks__/prisma'
import bcrypt from 'bcryptjs'

vi.mock('../../src/services/email-verification.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/services/email-verification.service')>()
  return {
    ...actual,
    EmailVerificationService: {
      ...actual.EmailVerificationService,
      issueCode: vi.fn().mockResolvedValue(undefined),
      verify: vi.fn().mockResolvedValue({
        id: 'user-456', email: 'newuser@example.com', firstName: 'Jane', lastName: 'Smith',
        role: 'CITIZEN', phone: null, avatarUrl: null, address: '', createdAt: new Date(),
      }),
      resend: vi.fn().mockResolvedValue({ accepted: true, retryAfterSeconds: 60 }),
    },
  }
})
import { EmailVerificationService } from '../../src/services/email-verification.service'

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
      
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: 'LGU_ADMIN',
        isActive: true,
        emailVerified: true,
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
      
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: 'LGU_ADMIN',
        isActive: true,
        emailVerified: true,
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
    it.each(['091234567890', '0912345678A'])('rejects invalid phone %s', async (phone) => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Smith',
          phone,
        })

      expect(res.status).toBe(400)
      expect(prismaMock.user.create).not.toHaveBeenCalled()
    })

    it('should register successfully and preserve address', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null)
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
      expect(res.body).toHaveProperty('verificationRequired', true)
      expect(res.body).not.toHaveProperty('token')
      expect(res.headers['set-cookie']).toBeUndefined()
      expect(res.body.user).toHaveProperty('id', 'user-456')
      expect(res.body.user).toHaveProperty('address', '123 Green St, Barangay Clean')
      expect(EmailVerificationService.issueCode).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user-456', email: 'newuser@example.com', firstName: 'Jane',
      }), true)
    })

    it('rejects duplicate email registration', async () => {
      prismaMock.user.findFirst.mockResolvedValue({ id: 'existing-user' } as any)
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'newuser@example.com', password: 'password123', firstName: 'Jane', lastName: 'Smith',
      })
      expect(res.status).toBe(409)
      expect(prismaMock.user.create).not.toHaveBeenCalled()
    })
  })

  describe('Email OTP endpoints', () => {
    it('verifies an email and only then returns a session', async () => {
      const res = await request(app).post('/api/v1/auth/verify-email').send({
        email: 'newuser@example.com', code: '123456',
      })
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('id', 'user-456')
      expect(res.headers['set-cookie']).toBeDefined()
    })

    it('rejects malformed and incorrect OTPs', async () => {
      const malformed = await request(app).post('/api/v1/auth/verify-email').send({ email: 'newuser@example.com', code: '12' })
      expect(malformed.status).toBe(400)
      const { EmailVerificationError } = await import('../../src/services/email-verification.service')
      vi.mocked(EmailVerificationService.verify).mockRejectedValueOnce(new EmailVerificationError('Invalid or expired verification code.', 400, 'INVALID_OTP'))
      const incorrect = await request(app).post('/api/v1/auth/verify-email').send({ email: 'newuser@example.com', code: '999999' })
      expect(incorrect.status).toBe(400)
      expect(incorrect.body.error.code).toBe('INVALID_OTP')
    })

    it('returns resend cooldown details', async () => {
      const { EmailVerificationError } = await import('../../src/services/email-verification.service')
      vi.mocked(EmailVerificationService.resend).mockRejectedValueOnce(new EmailVerificationError('Please wait 42 seconds before requesting another code.', 429, 'OTP_RESEND_COOLDOWN', 42))
      const res = await request(app).post('/api/v1/auth/resend-verification').send({ email: 'newuser@example.com' })
      expect(res.status).toBe(429)
      expect(res.body.retryAfterSeconds).toBe(42)
      expect(res.headers['retry-after']).toBe('42')
    })
  })

  it('blocks login until the email is verified', async () => {
    const passwordHash = await bcrypt.hash('password123', 10)
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user-pending', email: 'pending@example.com', password: passwordHash,
      firstName: 'Pending', lastName: 'User', role: 'CITIZEN', isActive: true,
      emailVerified: false, phone: null, address: '', avatarUrl: null,
      createdAt: new Date(), updatedAt: new Date(),
    } as any)
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'pending@example.com', password: 'password123',
    })
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED')
  })
})
