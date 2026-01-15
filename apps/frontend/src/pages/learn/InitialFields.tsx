import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { InitialFieldsContainer } from '@/feat/fields/components/InitialFieldsContainer';
import { useStorage } from '@/hooks/useStorage';
import { type Field, fieldService } from '@/services/fieldService';

export const InitialFields = () => {
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const { updateUIState } = useStorage();
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await fieldService.getFields();
        setFields(data.fields);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchFields();
  }, []);

  const handleFieldChange = useCallback((slug: string) => {
    setSelectedField(prev => (prev === slug ? null : slug));
  }, []);

  const handleComplete = useCallback(async () => {
    if (!selectedField) return;

    try {
      const data = await fieldService.getFirstUnit(selectedField);

      if (data.unit && data.unit.steps[0]) {
        const firstStepId = data.unit.steps[0].id;

        updateUIState({
          current_quiz_step_id: firstStepId,
        });
      }
    } catch (error) {
      console.error('Failed to fetch first unit:', error);
      // 에러 발생 시 기본값 설정
      updateUIState({
        current_quiz_step_id: 1,
      });
    }
    navigate('/quiz');
  }, [navigate, selectedField, updateUIState]);

  return (
    <InitialFieldsContainer
      fields={fields}
      selectedField={selectedField}
      onFieldChange={handleFieldChange}
      onComplete={handleComplete}
    />
  );
};
