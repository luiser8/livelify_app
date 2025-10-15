import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAreaTranslationKey } from '@/shared/utils/lifeAreaHelpers';

interface LifeAreasSelectionModalProps {
  show: boolean;
  selectionData: {
    candidateAreas: { id: string; areaName: string; score: number }[];
  } | null;
  selectedAreaIds: string[];
  setSelectedAreaIds: (ids: string[]) => void;
  confirmUserSelection: () => void;
  cancelUserSelection: () => void;
  saving?: boolean;
}

export const LifeAreasSelectionModal: React.FC<LifeAreasSelectionModalProps> = ({
  show,
  selectionData,
  selectedAreaIds,
  setSelectedAreaIds,
  confirmUserSelection,
  cancelUserSelection,
  saving,
}) => {
  const { t } = useTranslation();
  // 🔹 Cerrar con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        cancelUserSelection();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show, cancelUserSelection]);

  // 🔹 Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show || !selectionData) return null;

  // ---- Lógica dinámica (idéntica a la anterior) ----
  const sortedAreas = [...selectionData.candidateAreas].sort((a, b) => a.score - b.score);
  const scores = sortedAreas.map(a => a.score);
  const thirdScore = scores[2];
  const lowerThanThird = sortedAreas.filter(a => a.score < thirdScore);
  const tiedAtThird = sortedAreas.filter(a => a.score === thirdScore);

  const lockedAreaIds = new Set(lowerThanThird.map(a => a.id));
  const tiedAreas = tiedAtThird;

  // Inicializar las bloqueadas si no hay selección previa
  useEffect(() => {
    if (selectedAreaIds.length === 0 && lockedAreaIds.size > 0) {
      setSelectedAreaIds([...lockedAreaIds]);
    }
  }, [selectionData]);

  const handleClick = (areaId: string) => {
    const isLocked = lockedAreaIds.has(areaId);
    const isTied = tiedAreas.some(a => a.id === areaId);
    if (!isTied || isLocked) return;

    const currentlySelectedTied = selectedAreaIds.filter(id =>
      tiedAreas.some(a => a.id === id)
    );

    let newSelection = [...selectedAreaIds];

    if (currentlySelectedTied.includes(areaId)) {
      newSelection = newSelection.filter(id => id !== areaId);
    } else {
      newSelection = newSelection.filter(id => !tiedAreas.some(a => a.id === id));
      newSelection.push(areaId);
    }

    setSelectedAreaIds(newSelection);
  };

  // ---- Render del modal ----
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 🔹 Backdrop con blur más intenso y que cubre toda la pantalla */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity"
        onClick={cancelUserSelection}
      />

      {/* 🔹 Contenedor del modal - con pointer-events auto para permitir interacciones */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all z-[10000] pointer-events-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t('home.selectionModal.title') || 'Selecciona tus 3 áreas de enfoque'}
        </h3>

        <p className="text-gray-600 mb-4">
          {t('home.selectionModal.description') ||
            'Tienes varias áreas con puntuaciones similares. Por favor selecciona las 3 áreas en las que te gustaría trabajar primero.'}
        </p>

        <div className="space-y-3 mb-6">
          {sortedAreas.map(area => {
            const isLocked = lockedAreaIds.has(area.id);
            const isSelected = selectedAreaIds.includes(area.id);
            const isTied = tiedAreas.some(a => a.id === area.id);

            return (
              <div
                key={area.id}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                  } ${isLocked
                    ? 'opacity-70 cursor-not-allowed'
                    : isTied
                      ? 'cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                onClick={() => handleClick(area.id)}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                    }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {t(getAreaTranslationKey(area.areaName))}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('home.selectionModal.score', { score: area.score }) ||
                      `Puntuación: ${area.score}/10`}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {t('home.selectionModal.selected', {
              count: selectedAreaIds.length,
              total: 3,
            }) || `${selectedAreaIds.length} de 3 seleccionadas`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={cancelUserSelection}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              {t('common.cancel') || 'Cancelar'}
            </button>
            <button
              onClick={confirmUserSelection}
              disabled={selectedAreaIds.length !== 3 || saving}
              className={`px-6 py-2 rounded-lg font-medium ${selectedAreaIds.length === 3 && !saving
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('home.selectionModal.saving') || 'Saving...'}
                </>
              ) : (
                t('home.selectionModal.confirm') || 'Confirm'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};