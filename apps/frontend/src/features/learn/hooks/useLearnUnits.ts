import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { LessonItem, LessonSection, UnitsResponse } from '@/feat/learn/types';
import { useStorage } from '@/hooks/useStorage';

/**
 * Learn 페이지에서 사용할 유닛/스텝 데이터와 스크롤 상태를 관리합니다.
 */
export const useLearnUnits = () => {
  const { uiState } = useStorage();
  const [units, setUnits] = useState<LessonSection[]>([]);
  const [activeUnitId, setActiveUnitId] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const unitRefs = useRef(new Map<string, HTMLElement>());

  const activeUnit = useMemo(
    () => units.find(unit => unit.id === activeUnitId) ?? units[0],
    [activeUnitId, units],
  );

  /**
   * field_slug를 기준으로 유닛/스텝 데이터를 요청하고 상태로 매핑합니다.
   */
  useEffect(() => {
    const fieldSlug = uiState.last_viewed.field_slug;
    let isMounted = true;

    const fetchUnits = async () => {
      const response = await fetch(`/api/fields/${fieldSlug}/units`);
      const data = (await response.json()) as UnitsResponse;
      if (!isMounted) return;

      const mapped = data.units
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(unit => ({
          id: String(unit.id),
          name: data.field.name,
          title: unit.title,
          steps: unit.steps
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map(step => {
              const status: LessonItem['status'] = step.isLocked
                ? 'locked'
                : step.isCompleted
                  ? 'completed'
                  : 'active';
              const type: LessonItem['type'] = step.isCheckpoint ? 'checkpoint' : 'normal';

              return {
                id: String(step.id),
                name: step.title,
                status,
                type,
              };
            }),
        }));

      setUnits(mapped);
      setActiveUnitId(mapped[0]?.id ?? '');
    };

    fetchUnits();

    return () => {
      isMounted = false;
    };
  }, [uiState.last_viewed.field_slug]);

  /**
   * 스크롤 위치를 기준으로 활성 유닛을 계산합니다.
   */
  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root || units.length === 0) return;
    let ticking = false;

    const updateActiveUnit = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      const scrollTop = root.scrollTop + headerHeight + 1;
      let nextId = units[0]?.id ?? '';

      unitRefs.current.forEach((element, id) => {
        if (element.offsetTop <= scrollTop) {
          nextId = id;
        }
      });

      setActiveUnitId(prev => (prev === nextId ? prev : nextId));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateActiveUnit();
          ticking = false;
        });
      }
    };

    updateActiveUnit();
    root.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      root.removeEventListener('scroll', onScroll);
    };
  }, [units]);

  /**
   * 저장된 unit_id가 있으면 해당 유닛 위치로 초기 스크롤합니다.
   */
  useEffect(() => {
    // TODO: 추후 last_solved_unit_id에서 해당하는 field의 유닛 ID로 스크롤 되도록 수정 필요
    const root = scrollContainerRef.current;
    if (!root || units.length === 0) return;

    const targetUnitId = uiState.last_viewed.unit_id;
    if (targetUnitId <= 1) return;

    const element = unitRefs.current.get(String(targetUnitId));
    if (!element) return;

    const headerHeight = headerRef.current?.offsetHeight ?? 0;
    root.scrollTo({
      top: Math.max(0, element.offsetTop - headerHeight),
    });
  }, [uiState.last_viewed.unit_id, units]);

  /**
   * 유닛 DOM을 등록하는 ref 콜백을 생성합니다.
   * @param unitId 유닛 ID
   */
  const registerUnitRef = useCallback(
    (unitId: string) => (element: HTMLElement | null) => {
      if (!element) {
        unitRefs.current.delete(unitId);
        return;
      }
      unitRefs.current.set(unitId, element);
    },
    [],
  );

  return {
    units,
    activeUnit,
    scrollContainerRef,
    headerRef,
    registerUnitRef,
  };
};
