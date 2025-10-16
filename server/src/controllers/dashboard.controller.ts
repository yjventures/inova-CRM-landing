import { Request, Response, NextFunction } from 'express';
import Deal from '../models/Deal';
import { Contact } from '../models/Contact';
import { Activity } from '../models/Activity';

export const dashboardController = {
  async getKpis(_req: Request, res: Response, next: NextFunction) {
    try {
      const QUOTA = Number(process.env.QUOTA_TARGET ?? 2500000);

      const deletedNull = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] };

      const [
        totalDeals,
        wonDeals,
        totalContacts,
        openActivities,
        pipelineAgg,
        wonValueAgg,
      ] = await Promise.all([
        Deal.countDocuments({ deletedAt: null }),
        Deal.countDocuments({ deletedAt: null, stage: 'Closed Won' }),
        Contact.countDocuments(deletedNull as any),
        Activity.countDocuments({ deletedAt: null, status: 'open' }),
        Deal.aggregate([
          { $match: { deletedAt: null, isActive: true } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Deal.aggregate([
          { $match: { deletedAt: null, stage: 'Closed Won' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

      const pipelineValue = (pipelineAgg[0]?.total as number) ?? 0;
      const wonValue = (wonValueAgg[0]?.total as number) ?? 0;

      const quotaAchievement = QUOTA > 0 ? (wonValue / QUOTA) * 100 : 0;
      const winRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

      return res.json({
        ok: true,
        data: {
          totalDeals,
          wonDeals,
          totalContacts,
          openActivities,
          pipelineValue,
          quotaAchievement,
          winRate,
        },
      });
    } catch (err) {
      return next(err);
    }
  },
  
  async getPipelineSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const STAGE_ORDER = ['Lead','Qualified','Proposal','Negotiation','Closed Won'] as const;

      const match: any = { deletedAt: null };

      const { ownerId, from, to, q } = req.query as {
        ownerId?: string;
        from?: string;
        to?: string;
        q?: string;
      };

      if (ownerId) {
        try {
          // lazy import to avoid top-level Types import
          const { Types } = await import('mongoose');
          match.ownerId = new Types.ObjectId(ownerId);
        } catch {}
      }

      if (from || to) {
        match.createdAt = {} as any;
        if (from) match.createdAt.$gte = new Date(from);
        if (to) match.createdAt.$lte = new Date(to);
      }

      if (q && String(q).trim()) {
        const rx = new RegExp(String(q).trim(), 'i');
        // Our schema uses `title` as the deal name
        match.$or = [{ title: rx }];
      }

      const agg = await Deal.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
            totalValue: { $sum: '$amount' },
            avgProbability: { $avg: '$probability' },
            weightedValue: { $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] } },
          },
        },
        {
          $project: {
            _id: 0,
            stage: '$_id',
            count: 1,
            totalValue: 1,
            avgProbability: 1,
            weightedValue: 1,
          },
        },
      ]);

      const byStage = new Map<string, { stage: string; count: number; totalValue: number; avgProbability: number; weightedValue: number }>();
      for (const row of agg) {
        byStage.set(row.stage, {
          stage: row.stage,
          count: row.count ?? 0,
          totalValue: row.totalValue ?? 0,
          avgProbability: row.avgProbability ?? 0,
          weightedValue: row.weightedValue ?? 0,
        });
      }

      const stages = STAGE_ORDER.map((s) =>
        byStage.get(s) || { stage: s, count: 0, totalValue: 0, avgProbability: 0, weightedValue: 0 }
      );

      const totals = stages.reduce(
        (acc, s) => {
          acc.count += s.count;
          acc.totalValue += s.totalValue;
          acc.weightedValue += s.weightedValue;
          return acc;
        },
        { count: 0, totalValue: 0, weightedValue: 0 }
      );

      return res.json({ ok: true, data: { stages, totals } });
    } catch (err) {
      return next(err);
    }
  },

  async getActivityOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { ownerId, from, to } = req.query as { ownerId?: string; from?: string; to?: string };
      const now = new Date();

      const match: any = { deletedAt: null };
      if (ownerId) {
        try {
          const { Types } = await import('mongoose');
          match.ownerId = new Types.ObjectId(ownerId);
        } catch {}
      }
      if (from || to) {
        match.dueAt = {} as any;
        if (from) match.dueAt.$gte = new Date(from);
        if (to) match.dueAt.$lte = new Date(to);
      }

      const facets = await Activity.aggregate([
        { $match: match },
        {
          $facet: {
            totalsOpen: [
              { $match: { status: 'open' } },
              { $count: 'count' },
            ],
            totalsCompleted: [
              { $match: { status: 'completed' } },
              { $count: 'count' },
            ],
            totalsOverdue: [
              { $match: { status: 'open', dueAt: { $lt: now } } },
              { $count: 'count' },
            ],
            totalsUpcoming: [
              { $match: { status: 'open', dueAt: { $gte: now } } },
              { $count: 'count' },
            ],
            byType: [
              {
                $group: {
                  _id: '$type',
                  open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
                  completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                  overdue: {
                    $sum: {
                      $cond: [{ $and: [{ $eq: ['$status', 'open'] }, { $lt: ['$dueAt', now] }] }, 1, 0],
                    },
                  },
                },
              },
              { $project: { _id: 0, type: '$_id', open: 1, completed: 1, overdue: 1 } },
            ],
            byPriority: [
              {
                $group: {
                  _id: '$priority',
                  open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
                  completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                  overdue: {
                    $sum: {
                      $cond: [{ $and: [{ $eq: ['$status', 'open'] }, { $lt: ['$dueAt', now] }] }, 1, 0],
                    },
                  },
                },
              },
              { $project: { _id: 0, priority: '$_id', open: 1, completed: 1, overdue: 1 } },
            ],
            next5: [
              { $match: { status: 'open', dueAt: { $gte: now } } },
              { $sort: { dueAt: 1 } },
              { $limit: 5 },
              { $project: { _id: 1, title: 1, type: 1, priority: 1, dueAt: 1, ownerId: 1 } },
            ],
          },
        },
      ]);

      const f = facets[0] || {} as any;
      const open = f.totalsOpen?.[0]?.count ?? 0;
      const completed = f.totalsCompleted?.[0]?.count ?? 0;
      const overdue = f.totalsOverdue?.[0]?.count ?? 0;
      const upcoming = f.totalsUpcoming?.[0]?.count ?? 0;

      const types = ['call','email','meeting','task'];
      const byTypeMap = new Map<string, any>();
      for (const row of f.byType || []) byTypeMap.set(row.type, row);
      const byType = types.map((t) => byTypeMap.get(t) || { type: t, open: 0, completed: 0, overdue: 0 });

      const priorities = ['low','medium','high'];
      const byPriorityMap = new Map<string, any>();
      for (const row of f.byPriority || []) byPriorityMap.set(row.priority, row);
      const byPriority = priorities.map((p) => byPriorityMap.get(p) || { priority: p, open: 0, completed: 0, overdue: 0 });

      const next5 = f.next5 || [];

      return res.json({
        ok: true,
        data: {
          totals: { open, completed, overdue, upcoming },
          byType,
          byPriority,
          next5,
        },
      });
    } catch (err) {
      return next(err);
    }
  },

  async getPerformanceTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const { range, from, to, ownerId, tz } = req.query as {
        range?: 'last6' | 'last12';
        from?: string;
        to?: string;
        ownerId?: string;
        tz?: string;
      };

      const timezone = tz || 'Australia/Sydney';

      // Compute date window
      let start: Date;
      let end: Date;
      const now = new Date();
      if (from || to) {
        start = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
        end = to ? new Date(to) : now;
      } else {
        const months = range === 'last12' ? 12 : 6;
        end = now;
        start = new Date(end.getFullYear(), end.getMonth() - (months - 1), 1);
      }

      const baseMatch: any = { deletedAt: null };
      if (ownerId) {
        try {
          const { Types } = await import('mongoose');
          baseMatch.ownerId = new Types.ObjectId(ownerId);
        } catch {}
      }

      // Build aggregation with $facet for actuals and forecast
      const facets = await Deal.aggregate([
        { $match: baseMatch },
        {
          $facet: {
            actuals: [
              { $match: { stage: 'Closed Won', closedAt: { $gte: start, $lte: end } } },
              {
                $group: {
                  _id: { $dateTrunc: { date: '$closedAt', unit: 'month', timezone } },
                  total: { $sum: '$amount' },
                },
              },
              {
                $project: {
                  _id: 0,
                  month: { $dateToString: { format: '%Y-%m', date: '$_id', timezone } },
                  total: 1,
                },
              },
            ],
            forecast: [
              { $match: { stage: { $ne: 'Closed Won' } } },
              { $addFields: { bucketDate: { $ifNull: ['$closeDate', '$createdAt'] } } },
              { $match: { bucketDate: { $gte: start, $lte: end } } },
              {
                $group: {
                  _id: { $dateTrunc: { date: '$bucketDate', unit: 'month', timezone } },
                  total: { $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] } },
                },
              },
              {
                $project: {
                  _id: 0,
                  month: { $dateToString: { format: '%Y-%m', date: '$_id', timezone } },
                  total: { $round: ['$total', 0] },
                },
              },
            ],
          },
        },
      ]);

      const result = facets[0] || { actuals: [], forecast: [] } as any;
      const actualsMap = new Map<string, number>();
      for (const r of result.actuals || []) actualsMap.set(r.month, Number(r.total) || 0);
      const forecastMap = new Map<string, number>();
      for (const r of result.forecast || []) forecastMap.set(r.month, Number(r.total) || 0);

      // Build full month list from start..end inclusive
      const series: Array<{ month: string; actual: number; forecast: number }> = [];
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      const endCursor = new Date(end.getFullYear(), end.getMonth(), 1);
      while (cursor <= endCursor) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
        series.push({ month: key, actual: actualsMap.get(key) || 0, forecast: forecastMap.get(key) || 0 });
        cursor.setMonth(cursor.getMonth() + 1);
      }

      const totals = series.reduce(
        (acc, s) => {
          acc.actual += s.actual;
          acc.forecast += s.forecast;
          return acc;
        },
        { actual: 0, forecast: 0 }
      );

      return res.json({
        ok: true,
        data: {
          range: { start: start.toISOString(), end: end.toISOString(), months: series.length },
          series,
          totals,
        },
      });
    } catch (err) {
      return next(err);
    }
  },
};


