import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomNav, PageHeader, Copyright, LifeScoreCard } from '@/shared/components';
import { LifeWheelHexagon } from '../components';
import { lifeWheelService, type LifeWheelResponse } from '@/infrastructure/services';
import { getAreaIcon, getAreaTranslationKey, getSelectableAreas, LifeArea } from '@/shared/utils';
import { LifeAreasSelectionModal } from '@/shared/components/SelectionModal/LifeAreasSelectionModal';

/**
 * Página principal - Life Wheel
 */
export const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [lifeWheel, setLifeWheel] = useState<LifeWheelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [selectionData, setSelectionData] = useState<{
    candidateAreas: Array<{ id: string; areaName: string; score: number }>;
    autoSelectedAreas?: Array<{ id: string; areaName: string; score: number }>;
    selectableAreaIds: Set<string>;
    remainingSlotsForUser?: number;
  } | null>(null);
  const [enabledAreaIds, setEnabledAreaIds] = useState<Set<string>>(new Set());
  const [savingSelection, setSavingSelection] = useState(false);

  useEffect(() => {
    const fetchLifeWheel = async () => {
      try {
        const data = await lifeWheelService.getMyLifeWheel();
        setLifeWheel(data);

        // Inicializar enabledAreaIds después de cargar los datos
        if (data?.lifeAreas) {
          const initialEnabledAreas = calculateEnabledAreas(data.lifeAreas, data);
          setEnabledAreaIds(initialEnabledAreas as Set<string>);
        }
      } catch (error) {
        console.error('Error fetching life wheel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLifeWheel();
  }, []);

  const handleStartAssessment = () => {
    navigate('/assessment/intro');
  };

  const handleAreaClick = (areaId: string) => {
    // No permitir acceso a ninguna área hasta que todas estén completadas
    if (!allAreasAnswered) {
      navigate('/assessment/intro');
      return;
    }

    // Verificar si el área está habilitada (entre las seleccionadas)
    if (!enabledAreaIds.has(areaId)) {
      return; // No hacer nada si el área no está habilitada
    }

    // Verificar si el área alcanzó 10/10 (objetivo cumplido)
    const selectedArea = lifeWheel?.lifeAreas.find(a => a.id === areaId);
    if (selectedArea && selectedArea.score >= 10) {
      return; // No permitir clic en áreas con objetivo cumplido
    }

    navigate(`/area/${areaId}/projects`);
  };

  const hasScores = lifeWheel?.lifeAreas && lifeWheel.lifeAreas.some(area => area.isArchived);
  const allAreasAnswered = lifeWheel?.lifeAreas && lifeWheel.lifeAreas.length > 0 &&
    lifeWheel.lifeAreas.every(area => area.isArchived);

  // Función para calcular las áreas habilitadas
  const calculateEnabledAreas = (areas: LifeArea[], lifeWheelResponse?: any) => {
    if (!areas) return new Set<string>();

    // 1️⃣ Filtrar solo áreas evaluadas (isArchived), no perfectas y no bloqueadas
    const evaluatedAreas = areas.filter(area => 
      area.isArchived && 
      area.score < 10 && 
      !area.isBlocked
    );
    if (evaluatedAreas.length === 0) return new Set<string>();

    // 2️⃣ Obtener las áreas seleccionables según la lógica inteligente
    const result = getSelectableAreas(areas);

    // Si no requiere selección → devolver directamente las áreas seleccionables
    if (!result.requiresUserSelection || !result.candidateAreas) {
      return result.selectableAreaIds;
    }

    // 3️⃣ Intentar recuperar selección guardada en localStorage
    const storedSelection = localStorage.getItem('userAreaSelection');
    if (storedSelection) {
      try {
        const parsed = JSON.parse(storedSelection);
        // Combinar autoSelectedAreas y candidateAreas para validar
        const allSelectableAreas = [
          ...(result.autoSelectedAreas || []),
          ...(result.candidateAreas || [])
        ];
        
        const stillValid =
          Array.isArray(parsed.areaIds) &&
          parsed.areaIds.length === 3 &&
          parsed.areaIds.every((id: string) => {
            const area = areas.find(a => a.id === id);
            // Verificar que el área exista, esté en las seleccionables y no esté bloqueada
            return area && !area.isBlocked && allSelectableAreas.some(selArea => selArea.id === id);
          });

        if (stillValid) {
          return new Set(parsed.areaIds);
        }
      } catch  {}
    }

    // 4️⃣ Si no hay localStorage, revisar si el backend trae selección previa (lifeAreasSelected)
    const backendSelected = lifeWheelResponse?.lifeAreasSelected;
    const allLifeAreas = lifeWheelResponse?.lifeAreas;

    if (Array.isArray(backendSelected) && backendSelected.length > 0 && Array.isArray(allLifeAreas)) {
      // Mapear los areaId del backend a los IDs locales (lifeAreas.id)
      const backendSelectedIds = backendSelected
        .map((sel: any) => {
          const fullArea = allLifeAreas.find((a: any) => a.areaId === sel.areaId);
          // Verificar que el área exista y no esté bloqueada
          return (fullArea && !fullArea.isBlocked) ? fullArea.id : null;
        })
        .filter(Boolean) as string[];

      if (backendSelectedIds.length === 3) {
        // Verificar si coincide con las áreas bajas propuestas por getSelectableAreas
        const lowestIds = Array.from(result.selectableAreaIds);
        const matchesLowest = backendSelectedIds.every(id => lowestIds.includes(id));

        if (matchesLowest) {
          localStorage.setItem(
            'userAreaSelection',
            JSON.stringify({
              areaIds: backendSelectedIds,
              timestamp: new Date().toISOString(),
              lifeWheelId: lifeWheelResponse?.id
            })
          );
        } else {}

        // En ambos casos usamos lo que viene del backend
        return new Set(backendSelectedIds);
      }

      // Si backend tiene items mapeados parciales, devolverlos (sin guardar)
      if (backendSelectedIds.length > 0) {
        return new Set(backendSelectedIds);
      }
    }

    // -----------------------------
    // Nuevo comportamiento solicitado:
    // Si NO hay localStorage válido y NO hay backendSelected,
    // y SÍ hay empates/duplicados (result.hasMultipleTied o candidateAreas>3)
    // → mostrar modal para que el usuario elija.
    // -----------------------------
    const noStorage = !storedSelection;
    const noBackend = !Array.isArray(backendSelected) || backendSelected.length === 0;
    const hasTies = Boolean(result.hasMultipleTied) || (result.candidateAreas && result.candidateAreas.length > 3);

    if (noStorage && noBackend && hasTies) {
      setSelectionData({
        candidateAreas: result.candidateAreas || [],
        autoSelectedAreas: result.autoSelectedAreas || [],
        selectableAreaIds: result.selectableAreaIds,
        remainingSlotsForUser: result.remainingSlotsForUser
      });
      setShowSelectionModal(true);

      // Devolver las áreas auto-seleccionadas (prioridad) mientras el usuario decide
      const autoSelectedIds = result.autoSelectedAreas?.map(a => a.id) || [];
      return new Set(autoSelectedIds);
    }

    // 5️⃣ Si no hay selección guardada ni en backend → usar las áreas calculadas sin mostrar modal
    return result.selectableAreaIds;
  };

  // Actualizar enabledAreaIds cuando cambie lifeWheel o allAreasAnswered
  useEffect(() => {
    if (lifeWheel?.lifeAreas) {
      const newEnabledAreas = calculateEnabledAreas(lifeWheel.lifeAreas, lifeWheel);
      setEnabledAreaIds(newEnabledAreas as Set<string>);

      console.log('🔍 DEBUG - Condiciones para unlock automático:', {
        allAreasAnswered,
        showSelectionModal,
        isAnswered: lifeWheel.isAnswered,
        enabledAreasSize: newEnabledAreas.size,
        allAreas: lifeWheel.lifeAreas.map(a => ({
          name: a.areaName,
          score: a.score,
          isBlocked: a.isBlocked,
          isArchived: a.isArchived
        }))
      });

      // 🔹 Verificar si ya se desbloquearon las áreas (desde localStorage)
      const storedSelection = localStorage.getItem('userAreaSelection');
      let alreadyUnlocked = false;
      
      if (storedSelection) {
        try {
          const parsed = JSON.parse(storedSelection);
          alreadyUnlocked = parsed.isAnswered === true;
          console.log('🔍 DEBUG - localStorage:', { alreadyUnlocked, parsed });
        } catch (e) {
          console.error('Error parsing localStorage:', e);
        }
      }

      // 🔹 Si todas las áreas están respondidas Y NO hay modal mostrado
      // Y isAnswered === false (primera vez completando el assessment)
      // Y NO se ha desbloqueado previamente (localStorage.isAnswered !== true)
      // → Desbloquear las 3 áreas automáticamente
      if (allAreasAnswered && !showSelectionModal && lifeWheel.isAnswered === false && !alreadyUnlocked) {
        console.log('✅ Cumple condiciones para unlock automático');
        if (newEnabledAreas.size === 3) {
          const areaIdsToUnlock = Array.from(newEnabledAreas) as string[];
          
          // 🔹 Obtener las áreas que PERMANECERÁN BLOQUEADAS (las que NO están en areaIdsToUnlock)
          // IMPORTANTE: NO incluir áreas con 10/10 (se manejan en otro flujo)
          const areaIdsToKeepBlocked = lifeWheel.lifeAreas
            .filter(area => 
              !areaIdsToUnlock.includes(area.id) && 
              area.score < 10  // ← NO incluir áreas con 10/10
            )
            .map(area => area.id);
          
          console.log('🚀 Enviando POST /unlock-areas con áreas a MANTENER BLOQUEADAS:', areaIdsToKeepBlocked);
          console.log('ℹ️ Áreas que se DESBLOQUEARÁN:', areaIdsToUnlock);
          console.log('ℹ️ Áreas con 10/10 excluidas del POST (se manejan en otro flujo)');
          console.log('📊 Total áreas a enviar:', areaIdsToKeepBlocked.length, '(debe ser ~3)');
          
          // Llamar al servicio de unlock enviando las áreas que permanecerán bloqueadas
          lifeWheelService.unlockAreas({
            lifeWheelAreaIds: areaIdsToKeepBlocked
          })
            .then(() => {
              console.log('✅ Áreas desbloqueadas automáticamente (sin empates)');
              
              // Guardar en localStorage que ya se desbloquearon
              const areaIdsWithAreaId = lifeWheel.lifeAreas
                .filter(area => areaIdsToUnlock.includes(area.id))
                .map(area => area.areaId);
              
              // Guardar scores actuales para comparación futura
              const currentScores: Record<string, number> = {};
              lifeWheel.lifeAreas.forEach(area => {
                currentScores[area.id] = area.score;
              });
              
              localStorage.setItem(
                'userAreaSelection',
                JSON.stringify({
                  areaIds: areaIdsToUnlock,
                  areaIdsWithAreaId,
                  scores: currentScores, // 🆕 Guardar scores iniciales
                  timestamp: new Date().toISOString(),
                  lifeWheelId: lifeWheel.id,
                  isAnswered: true // ✨ Marcar como ya respondido
                })
              );
            })
            .catch((error) => {
              console.error('⚠️ Error al desbloquear áreas automáticamente:', error);
            });
        } else {
          console.log('⚠️ No hay exactamente 3 áreas habilitadas:', newEnabledAreas.size);
        }
      } else {
        console.log('❌ NO cumple condiciones para unlock automático');
      }

      // 🆕 NUEVA VALIDACIÓN: Detectar áreas que alcanzaron 10/10 y bloquearlas automáticamente
      // Esta validación se ejecuta SIEMPRE que haya localStorage (independiente del unlock automático)
      console.log('🔍 DEBUG - Verificando localStorage para detección 10/10:', {
        hasStoredSelection: !!storedSelection,
        enabledAreasSize: newEnabledAreas.size
      });
      
      // 🆕 NUEVO: Validar si el backend tiene isAnswered=false y enviar POST
      // Esto sucede cuando el usuario vuelve a Home después del assessment inicial
      const parsedStorage = storedSelection ? JSON.parse(storedSelection) : null;
      const backendNeedsSync = lifeWheel.isAnswered === false && newEnabledAreas.size === 3;
      
      // Validar si el backend está realmente sincronizado chequeando isBlocked
      const enabledAreasList = Array.from(newEnabledAreas);
      const blockedAreasInBackend = lifeWheel.lifeAreas.filter(area => area.isBlocked).length;
      const expectedBlockedAreas = lifeWheel.lifeAreas.length - newEnabledAreas.size;
      const backendIsActuallySynced = blockedAreasInBackend === expectedBlockedAreas;
      
      const alreadySynced = parsedStorage?.backendSynced === true && backendIsActuallySynced;
      
      console.log('🔍 DEBUG - Validando sincronización con backend:', {
        hasStoredSelection: !!storedSelection,
        backendIsAnswered: lifeWheel.isAnswered,
        backendNeedsSync,
        localStorageSynced: parsedStorage?.backendSynced === true,
        blockedAreasInBackend,
        expectedBlockedAreas,
        backendIsActuallySynced,
        alreadySynced,
        enabledAreasSize: newEnabledAreas.size
      });
      
      if (backendNeedsSync && !alreadySynced) {
        console.log('🚀 Backend tiene isAnswered=false - Enviando POST para sincronizar');
        
        // Obtener áreas a mantener bloqueadas (las que NO están en las 3 habilitadas)
        // En este caso de primera sincronización, incluir TODAS las áreas no seleccionadas
        const areaIdsToKeepBlocked = lifeWheel.lifeAreas
          .filter(area => !enabledAreasList.includes(area.id))
          .map(area => area.id);
        
        console.log('📋 Áreas DESBLOQUEADAS (frontend):', enabledAreasList);
        console.log('🔒 Áreas BLOQUEADAS (enviar al backend):', areaIdsToKeepBlocked);
        console.log('📊 Total áreas bloqueadas en POST:', areaIdsToKeepBlocked.length);
        
        // Enviar POST al backend con las áreas a MANTENER BLOQUEADAS
        // (el endpoint unlock-areas recibe las áreas a bloquear, no las que se desbloquean)
        lifeWheelService.unlockAreas({
          lifeWheelAreaIds: areaIdsToKeepBlocked
        })
          .then(async () => {
            console.log('✅ POST enviado - Backend sincronizado');
            
            // Marcar como sincronizado en localStorage
            const currentScores: Record<string, number> = {};
            lifeWheel.lifeAreas.forEach(area => {
              currentScores[area.id] = area.score;
            });
            
            const areaIdsWithAreaId = lifeWheel.lifeAreas
              .filter(area => enabledAreasList.includes(area.id))
              .map(area => area.areaId);
            
            localStorage.setItem(
              'userAreaSelection',
              JSON.stringify({
                areaIds: enabledAreasList,
                areaIdsWithAreaId,
                scores: currentScores,
                timestamp: new Date().toISOString(),
                lifeWheelId: lifeWheel.id,
                isAnswered: true,
                backendSynced: true // 🆕 Marcar como sincronizado
              })
            );
            
            // Recargar lifeWheel desde el backend para obtener estado actualizado
            try {
              const updatedLifeWheel = await lifeWheelService.getMyLifeWheel();
              setLifeWheel(updatedLifeWheel);
              console.log('✅ LifeWheel actualizado desde backend');
            } catch (error) {
              console.error('⚠️ Error al recargar lifeWheel:', error);
            }
          })
          .catch((error) => {
            console.error('⚠️ Error al enviar POST unlock-areas:', error);
          });
      } else if (backendNeedsSync && alreadySynced) {
        console.log('ℹ️ Backend ya fue sincronizado anteriormente');
      }
      
      // Si NO hay localStorage pero ya se desbloquearon áreas, inicializarlo
      if (!storedSelection && newEnabledAreas.size > 0 && allAreasAnswered) {
        console.log('🔧 Inicializando localStorage con scores actuales');
        
        const currentScores: Record<string, number> = {};
        lifeWheel.lifeAreas.forEach(area => {
          currentScores[area.id] = area.score;
        });
        
        const enabledAreasList = Array.from(newEnabledAreas);
        const areaIdsWithAreaId = lifeWheel.lifeAreas
          .filter(area => enabledAreasList.includes(area.id))
          .map(area => area.areaId);
        
        localStorage.setItem(
          'userAreaSelection',
          JSON.stringify({
            areaIds: enabledAreasList,
            areaIdsWithAreaId,
            scores: currentScores,
            timestamp: new Date().toISOString(),
            lifeWheelId: lifeWheel.id,
            isAnswered: true,
            backendSynced: backendNeedsSync // Marcar si se necesitó sync
          })
        );
        
        console.log('✅ localStorage inicializado');
      }
      
      if (storedSelection) {
        try {
          const parsed = JSON.parse(storedSelection);
          const previousScores = parsed.scores || {};
          
          console.log('🔍 DEBUG - Comparando scores:', {
            previousScores,
            hasScores: Object.keys(previousScores).length > 0,
            currentScores: lifeWheel.lifeAreas.map(a => ({ id: a.id, name: a.areaName, score: a.score }))
          });
          
          // Detectar áreas que alcanzaron 10/10
          const areasReachedMaxScore = lifeWheel.lifeAreas.filter(area => {
            const previousScore = previousScores[area.id];
            const currentScore = area.score;
            
            console.log(`🔍 Área ${area.areaName}: prev=${previousScore}, curr=${currentScore}`);
            
            // Si antes tenía menos de 10 y ahora tiene 10 o más
            return previousScore !== undefined && previousScore < 10 && currentScore >= 10;
          });

          if (areasReachedMaxScore.length > 0) {
            console.log('🎯 Áreas que alcanzaron 10/10:', areasReachedMaxScore.map(a => a.areaName));
            
            // Obtener IDs de SOLO las áreas que alcanzaron 10/10 para bloquearlas
            const areaIdsToBlock = areasReachedMaxScore.map(area => area.id);
            
            console.log('🔒 Enviando POST /unlock-areas para bloquear SOLO áreas con 10/10:', areaIdsToBlock);
            console.log('📊 Total áreas en POST:', areaIdsToBlock.length);
            
            // Enviar al backend SOLO las áreas que alcanzaron 10/10
            lifeWheelService.unlockAreas({
              lifeWheelAreaIds: areaIdsToBlock
            })
              .then(async () => {
                console.log('✅ Áreas con 10/10 bloqueadas automáticamente');
                
                // Actualizar enabledAreaIds removiendo las áreas con 10/10
                const updatedEnabledAreas = Array.from(newEnabledAreas as Set<string>).filter(
                  (id: string) => !areaIdsToBlock.includes(id)
                );
                setEnabledAreaIds(new Set(updatedEnabledAreas));
                
                // 🆕 Recargar lifeWheel desde el backend para obtener estado actualizado
                try {
                  const updatedLifeWheel = await lifeWheelService.getMyLifeWheel();
                  setLifeWheel(updatedLifeWheel);
                  console.log('✅ LifeWheel actualizado desde backend');
                } catch (error) {
                  console.error('⚠️ Error al recargar lifeWheel:', error);
                }
              })
              .catch((error) => {
                console.error('⚠️ Error al bloquear áreas con 10/10:', error);
              });
          } else {
            console.log('✅ No se detectaron áreas que alcanzaron 10/10');
          }
          
          // IMPORTANTE: Actualizar scores SIEMPRE (no solo cuando hay cambios)
          const currentScores: Record<string, number> = {};
          lifeWheel.lifeAreas.forEach(area => {
            currentScores[area.id] = area.score;
          });
          
          console.log('💾 Actualizando scores en localStorage:', currentScores);
          
          localStorage.setItem(
            'userAreaSelection',
            JSON.stringify({
              ...parsed,
              scores: currentScores,
              timestamp: new Date().toISOString()
            })
          );
        } catch (e) {
          console.error('Error parsing localStorage for score comparison:', e);
        }
      }
    }
  }, [lifeWheel, allAreasAnswered, showSelectionModal]);

  // Confirmar selección del usuario
  const confirmUserSelection = async () => {
    if (selectedAreaIds.length !== 3) {
      return;
    }

    setSavingSelection(true);

    try {
      if (selectionData && lifeWheel) {
        // 🔹 Verificar si ya se desbloquearon las áreas (desde localStorage)
        const storedSelection = localStorage.getItem('userAreaSelection');
        let alreadyUnlocked = false;
        
        if (storedSelection) {
          try {
            const parsed = JSON.parse(storedSelection);
            alreadyUnlocked = parsed.isAnswered === true;
          } catch (e) {
            console.error('Error parsing localStorage:', e);
          }
        }

        // 1️⃣ Combinar autoSelectedAreas y candidateAreas para buscar
        const allSelectableAreas = [
          ...(selectionData.autoSelectedAreas || []),
          ...(selectionData.candidateAreas || [])
        ];

        // 2️⃣ Obtener las áreas completas seleccionadas
        const selectedLifeAreas = allSelectableAreas
          .filter(area => selectedAreaIds.includes(area.id))
          .map(area => lifeWheel.lifeAreas.find(a => a.id === area.id))
          .filter(Boolean);

        if (selectedLifeAreas.length !== 3) {
          throw new Error('No se pudieron encontrar todas las áreas seleccionadas');
        }

        // 3️⃣ Preparar datos para enviar al backend
        const areasToSend = selectedLifeAreas.map(area => ({
          areaId: area?.areaId ?? area?.id,
          score: area?.score
        }));

        const requestBody = {
          userId: '',
          lifeWheelId: lifeWheel.id,
          areaIds: areasToSend
        };

        // 4️⃣ Guardar en backend
        await lifeWheelService.addLifeWheelAreas({
          ...requestBody,
          userId: '',
          areaIds: requestBody.areaIds.map(a => ({
            areaId: a.areaId ?? '',
            score: a.score ?? 0
          }))
        });

        // 4.5️⃣ Desbloquear las 3 áreas seleccionadas 
        // (solo si isAnswered === false Y no se ha desbloqueado previamente)
        console.log('🔍 DEBUG - Modal confirmado. Condiciones unlock:', {
          isAnswered: lifeWheel.isAnswered,
          alreadyUnlocked,
          selectedAreaIds
        });
        
        if (lifeWheel.isAnswered === false && !alreadyUnlocked) {
          try {
            // 🔹 Obtener las áreas que PERMANECERÁN BLOQUEADAS (las que NO están en selectedAreaIds)
            // IMPORTANTE: NO incluir áreas con 10/10 (se manejan en otro flujo)
            const areaIdsToKeepBlocked = lifeWheel.lifeAreas
              .filter(area => 
                !selectedAreaIds.includes(area.id) && 
                area.score < 10  // ← NO incluir áreas con 10/10
              )
              .map(area => area.id);
            
            console.log('🚀 Enviando POST /unlock-areas desde modal con áreas a MANTENER BLOQUEADAS:', areaIdsToKeepBlocked);
            console.log('ℹ️ Áreas que se DESBLOQUEARÁN:', selectedAreaIds);
            console.log('ℹ️ Áreas con 10/10 excluidas del POST (se manejan en otro flujo)');
            console.log('📊 Total áreas a enviar:', areaIdsToKeepBlocked.length, '(debe ser ~3)');
            
            await lifeWheelService.unlockAreas({
              lifeWheelAreaIds: areaIdsToKeepBlocked
            });
            console.log('✅ Áreas desbloqueadas desde modal');
          } catch (unlockError) {
            console.error('⚠️ Error al desbloquear áreas (no crítico):', unlockError);
            // No bloqueamos el flujo si falla el unlock
          }
        } else {
          console.log('❌ NO se envió POST desde modal. Razones:', {
            isAnsweredFalse: lifeWheel.isAnswered === false,
            notAlreadyUnlocked: !alreadyUnlocked
          });
        }

        // 5️⃣ Actualizar localStorage para recordar la selección del usuario
        localStorage.setItem(
          'userAreaSelection',
          JSON.stringify({
            areaIds: selectedAreaIds,
            areaIdsWithAreaId: areasToSend.map(a => a.areaId),
            scores: lifeWheel.lifeAreas.reduce((acc, area) => {
              acc[area.id] = area.score;
              return acc;
            }, {} as Record<string, number>), // 🆕 Guardar scores iniciales
            timestamp: new Date().toISOString(),
            lifeWheelId: lifeWheel.id,
            isAnswered: true // ✨ Marcar como ya respondido
          })
        );

        // 6️⃣ Actualizar UI local (habilitar áreas sin recargar)
        const userSelectedSet = new Set(selectedAreaIds);
        setEnabledAreaIds(userSelectedSet);

        // 7️⃣ Recargar lifeWheel para actualizar el estado desde el backend
        const updatedLifeWheel = await lifeWheelService.getMyLifeWheel();
        setLifeWheel(updatedLifeWheel);

        setShowSelectionModal(false);
        setSelectedAreaIds([]);
        setSelectionData(null);
      }
    } catch (error) {
      console.error('❌ Error al guardar la selección:', error);
      alert(t('home.selectionModal.errorMessage') || 'Error al guardar la selección. Intenta nuevamente.');
    } finally {
      setSavingSelection(false);
    }
  };


  // Cerrar modal sin seleccionar
  const cancelUserSelection = () => {
    setShowSelectionModal(false);
    setSelectedAreaIds([]);
    setSelectionData(null);
  };

  // Obtener información sobre cuántas áreas se pueden seleccionar
  const selectionInfo = lifeWheel?.lifeAreas && allAreasAnswered
    ? getSelectableAreas(lifeWheel.lifeAreas)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <PageHeader
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        showBackButton={true}
        backPath="/"
        showSearch={false}
        showFilter={false}
      />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Hexágono del Life Wheel con Global Score debajo */}
        {loading ? (
          <div className="mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-sm sm:text-base">{t('home.loadingWheel')}</p>
          </div>
        ) : (
          <div className="mb-6">
            {/* Life Wheel Hexagon */}
            <div className="flex justify-center">
              <LifeWheelHexagon
                lifeAreas={lifeWheel?.lifeAreas || []}
                onAreaClick={handleAreaClick}
                enabledAreaIds={enabledAreaIds}
              />
            </div>

            {/* Global Score debajo de la rueda, alineado a la izquierda */}
            {hasScores && lifeWheel && (
              <div className="flex justify-center mt-6">
                <div className="w-full max-w-2xl">
                  <LifeScoreCard score={lifeWheel.globalScore} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de selección de áreas */}
        {showSelectionModal && selectionData && (
          <LifeAreasSelectionModal
            show={showSelectionModal}
            selectionData={selectionData}
            selectedAreaIds={selectedAreaIds}
            setSelectedAreaIds={setSelectedAreaIds}
            confirmUserSelection={confirmUserSelection}
            cancelUserSelection={cancelUserSelection}
            saving={savingSelection}
          />
        )}

        {/* Resto del contenido */}
        <div className={`w-full ${allAreasAnswered ? 'pt-4' : 'pt-16'}`}>
          {/* Botón de acción - Solo mostrar si no todas las áreas están respondidas */}
          {!allAreasAnswered && (
            <>
              <button
                onClick={handleStartAssessment}
                className="w-full py-4 sm:py-5 px-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl sm:rounded-2xl transition-all shadow-lg text-base sm:text-lg"
              >
                {hasScores ? t('home.continueAssessment') : t('home.startAssessment')}
              </button>

              {/* Advertencia */}
              <div className="mt-6 p-4 sm:p-5 bg-amber-50 border-2 border-amber-200 rounded-xl sm:rounded-2xl">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-0.5">
                    <svg className="w-full h-full text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    <span className="font-semibold">{t('home.assessmentWarning.title')}</span> {t('home.assessmentWarning.description')}
                  </p>
                </div>
              </div>

              {/* Texto informativo */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {t('home.assessmentInfo.description', {
                    min: t('home.assessmentInfo.min'),
                    max: t('home.assessmentInfo.max'),
                    time: t('home.assessmentInfo.time')
                  })}
                </p>
              </div>

              {/* Mensaje adicional si algunas áreas ya están evaluadas */}
              {hasScores && !allAreasAnswered && (
                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">{t('home.partialAssessment.title')}</p>
                      <p className="text-xs sm:text-sm text-blue-800">
                        {t('home.partialAssessment.description')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Mensaje cuando todas las áreas están respondidas */}
          {allAreasAnswered && (
            <>
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl sm:rounded-2xl mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-2">{t('home.assessmentCompleted.title')}</h3>
                    <p className="text-sm sm:text-base text-green-800 leading-relaxed">
                      {t('home.assessmentCompleted.description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información sobre las áreas disponibles */}
              <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">{t('home.focusLowest.title')}</h4>
                    <p className="text-xs sm:text-sm text-blue-800">
                      {selectionInfo && selectionInfo.hasMultipleTied
                        ? t('home.focusLowest.tiedDescription', {
                          count: selectionInfo.count,
                          score: selectionInfo.lowestScore
                        })
                        : t('home.focusLowest.description', { count: selectionInfo?.count || 3 })
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Scores Summary - Solo si hay scores */}
          {hasScores && lifeWheel && (
            <div className="mt-6 sm:mt-8 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">{t('home.currentScores')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {lifeWheel.lifeAreas
                  .sort((a, b) => a.score - b.score)
                  .map((area) => {
                    const hasMaxScore = area.score >= 10; // Área con objetivo cumplido
                    const isEnabled = enabledAreaIds.has(area.id) && !hasMaxScore; // Deshabilitar si tiene 10/10
                    return (
                      <div
                        key={area.id}
                        className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl transition-all ${isEnabled
                          ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 shadow-sm'
                          : !area.isArchived
                            ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300'
                            : hasMaxScore
                              ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 opacity-75'
                              : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300'
                          }`}
                      >
                        <div className="flex items-center justify-center text-2xl sm:text-4xl flex-shrink-0 relative"
                          style={{
                            filter: isEnabled
                              ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                              : hasMaxScore
                                ? 'grayscale(30%)'
                                : 'grayscale(50%)'
                          }}>
                          {getAreaIcon(area.areaName)}
                          {!isEnabled && !area.isArchived && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {!isEnabled && area.isArchived && !hasMaxScore && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {hasMaxScore && (
                            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className={`text-xs sm:text-sm font-semibold truncate ${isEnabled
                              ? 'text-green-900'
                              : !area.isArchived
                                ? 'text-amber-900'
                                : hasMaxScore
                                  ? 'text-green-800'
                                  : 'text-gray-700'
                              }`}>
                              {t(getAreaTranslationKey(area.areaName))}
                            </p>
                            {isEnabled && (
                              <span className="text-xs text-green-700">✓</span>
                            )}
                          </div>
                          <p className={`text-lg sm:text-xl font-bold ${isEnabled
                            ? 'text-green-700'
                            : !area.isArchived
                              ? 'text-amber-700'
                              : hasMaxScore
                                ? 'text-green-700'
                                : 'text-gray-700'
                            }`}>
                            {!area.isArchived ? '—' : `${area.score}/10`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Copyright */}
      <Copyright />

      {/* Navegación inferior */}
      <BottomNav />
    </div>
  );
};
