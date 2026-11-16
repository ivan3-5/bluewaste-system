export type ReportDateFilter = {
  createdFrom?: string;
  createdBefore?: string;
};

export function getReportDateFilter({ createdFrom, createdBefore }: ReportDateFilter) {
  if (!createdFrom && !createdBefore) return undefined;
  return {
    ...(createdFrom && { gte: new Date(createdFrom) }),
    ...(createdBefore && { lt: new Date(createdBefore) }),
  };
}
