import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAreaTranslationKey } from '@/shared/utils/lifeAreaHelpers';

interface LifeAreasSelectionModalProps {
  show: boolean;
  selectionData: {
    candidateAreas: { id: string; areaName: string; score: number }[];
    autoSelectedAreas?: { id: string; areaName: string; score: number }[];
    remainingSlotsForUser?: number;
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

  // ---- NUEVA Lógica: Usar autoSelectedAreas y candidateAreas ----
  const autoSelectedAreas = selectionData.autoSelectedAreas || [];
  const candidateAreas = selectionData.candidateAreas || [];
  const remainingSlotsForUser = selectionData.remainingSlotsForUser ?? 3;
  
  const autoSelectedIds = new Set(autoSelectedAreas.map(a => a.id));

  // Inicializar áreas auto-seleccionadas si no hay selección previa
  useEffect(() => {
    if (selectedAreaIds.length === 0 && autoSelectedIds.size > 0) {
      setSelectedAreaIds([...autoSelectedIds]);
    }
  }, [selectionData]);

  const handleClick = (areaId: string) => {
    // No permitir modificar áreas auto-seleccionadas (prioridad)
    if (autoSelectedIds.has(areaId)) return;

    let newSelection = [...selectedAreaIds];

    if (newSelection.includes(areaId)) {
      // Deseleccionar
      newSelection = newSelection.filter(id => id !== areaId);
    } else {
      // Solo permitir seleccionar si no se ha alcanzado el límite
      const currentUserSelections = newSelection.filter(id => !autoSelectedIds.has(id));
      if (currentUserSelections.length < remainingSlotsForUser) {
        newSelection.push(areaId);
      }
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
          {autoSelectedAreas.length > 0
            ? t('home.selectionModal.descriptionWithAuto', { count: remainingSlotsForUser }) ||
              `Tienes áreas con puntuaciones similares. Hemos pre-seleccionado las áreas con menor puntuación (prioridad). Por favor selecciona ${remainingSlotsForUser} área${remainingSlotsForUser > 1 ? 's' : ''} más.`
            : t('home.selectionModal.description') ||
              'Tienes varias áreas con puntuaciones similares. Por favor selecciona las 3 áreas en las que te gustaría trabajar primero.'}
        </p>

        {/* Áreas auto-seleccionadas (prioridad) */}
        {autoSelectedAreas.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('home.selectionModal.priorityAreas') || 'Áreas de Prioridad (auto-seleccionadas)'}
            </h4>
            <div className="space-y-2">
              {autoSelectedAreas.map(area => (
                <div
                  key={area.id}
                  className="flex items-center gap-3 p-3 border-2 border-green-500 bg-green-50 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-900">{t(getAreaTranslationKey(area.areaName))}</p>
                    <p className="text-sm text-green-700">
                      {t('home.selectionModal.score', { score: area.score }) || `Puntuación: ${area.score}/10`}
                    </p>
                  </div>
                  <span className="text-xs text-green-700 font-semibold px-2 py-1 bg-green-100 rounded">
                    {t('home.selectionModal.priority') || 'Prioridad'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Áreas candidatas para selección del usuario */}
        {candidateAreas.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t('home.selectionModal.chooseFrom', { count: remainingSlotsForUser }) || `Selecciona ${remainingSlotsForUser} más:`}
            </h4>
            <div className="space-y-2">
              {candidateAreas.map(area => {
                const isSelected = selectedAreaIds.includes(area.id);
                const currentUserSelections = selectedAreaIds.filter(id => !autoSelectedIds.has(id));
                const canSelect = !isSelected && currentUserSelections.length < remainingSlotsForUser;

                return (
                  <div
                    key={area.id}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    } ${canSelect || isSelected ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => handleClick(area.id)}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{t(getAreaTranslationKey(area.areaName))}</p>
                      <p className="text-sm text-gray-500">
                        {t('home.selectionModal.score', { score: area.score }) || `Puntuación: ${area.score}/10`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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