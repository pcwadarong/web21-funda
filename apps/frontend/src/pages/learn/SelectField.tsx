import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { SelectFieldContainer } from '@/feat/fields/components/SelectFieldContainer';
import { useFieldsQuery } from '@/hooks/queries/fieldQueries';
import { useStorage } from '@/hooks/useStorage';

export const SelectField = () => {
  const navigate = useNavigate();
  const { updateUIState } = useStorage();

  const { data } = useFieldsQuery();

  const fields = data.fields;

  const handleComplete = useCallback(
    (fieldSlug: string) => {
      navigate('/learn/roadmap');
      updateUIState({
        last_viewed: {
          field_slug: fieldSlug,
          unit_id: 1,
        },
      });
    },
    [navigate, updateUIState],
  );

  return <SelectFieldContainer fields={fields} onFieldClick={handleComplete} />;
};
