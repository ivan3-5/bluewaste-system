import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/index'
import { prismaMock } from '../../src/__mocks__/prisma'
import { ReportStatus, Role, WasteCategory } from '@prisma/client'

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
    authenticate: (req: any, res: any, next: any) => {
      req.user = { id: 'admin-123', role: 'LGU_ADMIN' }
      next()
    },
    optionalAuth: (req: any, res: any, next: any) => next()
  }
})
vi.mock('../../src/services/report-analysis.service', () => ({
  ReportAnalysisService: {
    analyzeReport: vi.fn().mockResolvedValue(true)
  }
}))
vi.mock('../../src/utils/geo-cache', () => ({
  GeoCache: {
    getMapData: vi.fn().mockResolvedValue(null),
    setMapData: vi.fn().mockResolvedValue(true),
    getHeatmapData: vi.fn().mockResolvedValue(null),
    setHeatmapData: vi.fn().mockResolvedValue(true),
    invalidateAll: vi.fn().mockResolvedValue(true),
  }
}))
vi.mock('../../src/services/report-geo.service', () => ({
  ReportGeoService: {
    getMapData: vi.fn().mockResolvedValue([{ id: 'report-1' }])
  }
}))
vi.mock('../../src/services/report-crud.service', () => ({
  ReportCrudService: {
    assignWorker: vi.fn().mockResolvedValue({ id: 'report-123' }),
    updateStatus: vi.fn().mockImplementation((id) => {
      if (id === 'non-existent') throw new Error("Report not found")
      return { id: 'report-123' }
    })
  }
}))

describe('Report Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/v1/reports/map', () => {
    it('should return map data successfully', async () => {
      const res = await request(app).get('/api/v1/reports/map')
      
      expect(res.status).toBe(200)
      expect(res.body).toBeInstanceOf(Array)
      expect(res.body.length).toBe(1)
      expect(res.body[0].id).toBe('report-1')
    })
  })

  describe('PUT /api/v1/reports/:id/status', () => {
    it('should update status and create history log', async () => {
      prismaMock.report.findFirst.mockResolvedValue({
        id: 'report-123',
        status: ReportStatus.PENDING,
        reporterId: 'citizen-1',
      } as any)

      prismaMock.$transaction.mockResolvedValue([
        { id: 'report-123', status: ReportStatus.IN_PROGRESS }, // updated report
        {} // status history
      ])

      const res = await request(app)
        .put('/api/v1/reports/report-123/status')
        .send({
          status: ReportStatus.IN_PROGRESS,
          notes: 'Started work'
        })

      expect(res.status).toBe(200)
    })
    
    it('should return 404 if report not found', async () => {
      prismaMock.report.findFirst.mockResolvedValue(null)
      
      const res = await request(app)
        .put('/api/v1/reports/non-existent/status')
        .send({ status: ReportStatus.IN_PROGRESS })

      expect(res.status).toBe(404)
      expect(res.body.code).toBe('REPORT_NOT_FOUND')
    })
  })

  describe('PUT /api/v1/reports/:id/assign', () => {
    it('should assign a worker to the report', async () => {
      const res = await request(app)
        .put('/api/v1/reports/report-123/assign')
        .send({ assignedToId: 'worker-1' })

      expect(res.status).toBe(200)
    })
  })
})

describe('Anonymous Report Privacy Tests', () => {
  let sanitizeReportForPrivacy: any

  beforeEach(async () => {
    const actual = await vi.importActual<any>('../../src/services/report-crud.service')
    sanitizeReportForPrivacy = actual.sanitizeReportForPrivacy
  })

  it('should return unchanged report if isAnonymous is false', () => {
    const report = { isAnonymous: false, reporterId: 'user-1', reporter: { firstName: 'John' } }
    expect(sanitizeReportForPrivacy(report as any, 'other-user')).toEqual(report)
  })

  it('should mask reporter details for anonymous report when viewer is not reporter', () => {
    const report = {
      isAnonymous: true,
      reporterId: 'user-1',
      reporter: { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      statusHistory: [
        { changedById: 'user-1', changedBy: { id: 'user-1', firstName: 'John', lastName: 'Doe' }, notes: 'Report submitted' }
      ]
    }
    const sanitized = sanitizeReportForPrivacy(report as any, 'admin-123')
    expect(sanitized.reporter.firstName).toBe('Anonymous')
    expect(sanitized.reporter.lastName).toBe('Citizen')
    expect(sanitized.reporter.email).toBeNull()
    expect(sanitized.statusHistory[0].changedBy.firstName).toBe('Anonymous')
  })

  it('should retain reporter details when viewer is the reporter', () => {
    const report = {
      isAnonymous: true,
      reporterId: 'user-1',
      reporter: { id: 'user-1', firstName: 'John', lastName: 'Doe' }
    }
    const sanitized = sanitizeReportForPrivacy(report as any, 'user-1')
    expect(sanitized.reporter.firstName).toBe('John')
  })
})
