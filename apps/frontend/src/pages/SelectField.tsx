import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SelectFieldContainer } from '@/feat/fields/components/SelectFieldContainer';
import { useStorage } from '@/hooks/useStorage';
import { type Field, fieldService } from '@/services/fieldService';

export const SelectField = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const navigate = useNavigate();
  const { updateUIState } = useStorage();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await fieldService.getFields();
        setFields(data.fields);
      } catch (error) {
        console.error('Failed to fetch fields:', error);
      }
    };

    fetchFields();
  }, []);

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
