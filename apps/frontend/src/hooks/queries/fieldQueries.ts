import { useSuspenseQuery } from '@tanstack/react-query';

import { fieldService } from '@/services/fieldService';

export const useFieldsQuery = () =>
  useSuspenseQuery({
    queryKey: ['fields'],
    queryFn: () => fieldService.getFields(),
  });

export const useFieldUnitsQuery = (fieldSlug: string) =>
  useSuspenseQuery({
    queryKey: ['field-units', fieldSlug],
    queryFn: () => fieldService.getFieldUnits(fieldSlug as string),
  });

export const useFieldRoadmapQuery = (fieldSlug: string) =>
  useSuspenseQuery({
    queryKey: ['field-roadmap', fieldSlug],
    queryFn: () => fieldService.getFieldRoadmap(fieldSlug as string),
  });

export const useFirstUnitQuery = (fieldSlug: string) =>
  useSuspenseQuery({
    queryKey: ['field-first-unit', fieldSlug],
    queryFn: () => fieldService.getFirstUnit(fieldSlug as string),
  });
