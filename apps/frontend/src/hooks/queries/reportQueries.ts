import { useMutation } from '@tanstack/react-query';

import { reportService } from '@/services/reportService';

type ReportResponse = {
  id: number;
  quizId: number;
  report_description: string;
  createdAt: string;
};
type CreateReportVariables = {
  quizId: number;
  data: Parameters<typeof reportService.createReport>[1];
};

export const useCreateReportMutation = () =>
  useMutation<ReportResponse, Error, CreateReportVariables>({
    mutationFn: ({ quizId, data }) => reportService.createReport(quizId, data),
  });
