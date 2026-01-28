import { useMutation } from '@tanstack/react-query';

import { type ReportResponse, reportService } from '@/services/reportService';

type CreateReportVariables = {
  quizId: number;
  data: Parameters<typeof reportService.createReport>[1];
};

export const useCreateReportMutation = () =>
  useMutation<ReportResponse, Error, CreateReportVariables>({
    mutationFn: ({ quizId, data }) => reportService.createReport(quizId, data),
  });
