import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  assessmentService,
  answerService,
  lifeWheelService,
  type AssessmentQuestion
} from '@/infrastructure/services';
import { getAreaColor, getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';
import { BottomNav, LanguageSelectorCompact, Copyright, ConfirmModal } from '@/shared/components';

/**
 * Página de preguntas del Assessment para un área específica
 */
export const AssessmentQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { areaId } = useParams<{ areaId: string }>();

  const [allQuestions, setAllQuestions] = useState<AssessmentQuestion[]>([]); // Todas las preguntas originales
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]); // Preguntas filtradas
  const [areaName, setAreaName] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Estados para la pregunta de estado civil (solo para Pareja e Intimidad)
  const [showMaritalStatusQuestion, setShowMaritalStatusQuestion] = useState(false);
  const [maritalStatus, setMaritalStatus] = useState<'married' | 'single' | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!areaId) return;

      try {
        // Primero verificar si el área ya tiene score
        const lifeWheel = await lifeWheelService.getMyLifeWheel();
        const area = lifeWheel.lifeAreas.find(a => a.areaId === areaId);

        // Si el área ya está evaluada (isArchived), redirigir al usuario
        if (area && area.isArchived) {
          navigate('/assessment/intro');
          return;
        }

        // Si no tiene score, cargar las preguntas normalmente
        const data = await assessmentService.getAreaQuestions(areaId);
        const sortedQuestions = data.questions;
        setAllQuestions(sortedQuestions);
        setAreaName(data.area.name);

        // Verificar si es el área de Pareja e Intimidad
        const isCoupleArea = data.area.name === 'Couple & Intimacy' || 
                            data.area.name === 'Pareja e Intimidad' ||
                            data.area.name === 'Pareja & Intimidad';

        if (isCoupleArea) {
          // Para esta área, mostrar primero la pregunta de estado civil
          setShowMaritalStatusQuestion(true);
        } else {
          // Para otras áreas, mostrar todas las preguntas normalmente
          setQuestions(sortedQuestions);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        navigate('/assessment/intro');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [areaId, navigate]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalAnswered = Object.keys(answers).length;
  const yesCount = Object.values(answers).filter(val => val === true).length;
  const noCount = Object.values(answers).filter(val => val === false).length;
  const allQuestionsAnswered = totalAnswered === questions.length;
  const areaColors = getAreaColorVariants(areaName);

  // Maneja la selección del estado civil (solo para Pareja e Intimidad)
  const handleMaritalStatusSelect = (status: 'married' | 'single') => {
    setMaritalStatus(status);

    // Filtrar preguntas según el estado civil
    const filtered = status === 'married'
      ? allQuestions.filter(q => !q.haveMoreQuestions) // Casado: preguntas con haveMoreQuestions = false
      : allQuestions.filter(q => q.haveMoreQuestions);  // Soltero: preguntas con haveMoreQuestions = true

    setQuestions(filtered);

    // Ocultar la pregunta de estado civil y mostrar las preguntas del assessment
    setTimeout(() => {
      setShowMaritalStatusQuestion(false);
    }, 500);
  };

  const handleAnswerSelect = (value: boolean) => {
    if (!currentQuestion || isTransitioning) return;
    
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    
    setAnswers(newAnswers);

    // Deshabilitar botones durante la transición
    setIsTransitioning(true);

    // Auto-advance to next question after 500ms (solo si no es la última)
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      // Habilitar botones después de la transición
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 500);
  };

  const handleSkipArea = () => {
    navigate('/assessment/intro');
  };

  const handleOpenResetModal = () => {
    setShowResetModal(true);
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
  };

  const handleConfirmReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResetModal(false);
  };

  const handleSubmit = async () => {
    if (!areaId) return;

    setSubmitting(true);
    try {
      const answersList = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      const result = await answerService.submitAreaAnswers({
        areaId,
        answers: answersList,
      });

      if (result.success) {
        navigate('/assessment/intro');
      } else {
        console.error('Error submitting answers:', result.message);
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">{t('assessment.questions.loadingQuestions')}</p>
        </div>
      </div>
    );
  }

  // Si no hay preguntas disponibles y no está mostrando la pregunta de estado civil
  if (!currentQuestion && !showMaritalStatusQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t('assessment.questions.noQuestions')}</p>
          <button
            onClick={handleSkipArea}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            {t('assessment.questions.goBack')}
          </button>
        </div>
      </div>
    );
  }

  // Mostrar pregunta de estado civil para el área de Pareja e Intimidad
  if (showMaritalStatusQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${getAreaColor(areaName)} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm`}>
                {getAreaIcon(areaName)}
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{areaName}</h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">{t('assessment.questions.maritalStatus.subtitle')}</p>
          </div>

          {/* Marital Status Question Card */}
          <div className={`bg-gradient-to-br ${areaColors.gradient} rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 shadow-xl`}>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg text-3xl sm:text-4xl">
                💑
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-relaxed px-2">
                {t('assessment.questions.maritalStatus.question')}
              </h2>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-md mx-auto px-4">
                {t('assessment.questions.maritalStatus.description')}
              </p>
            </div>
          </div>

          {/* Answer Buttons */}
          <div className="space-y-3 sm:space-y-4 mb-6">
            {/* Married Button */}
            <button
              onClick={() => handleMaritalStatusSelect('married')}
              className={`w-full rounded-xl sm:rounded-2xl transition-all transform active:scale-98 ${
                maritalStatus === 'married'
                  ? `${areaColors.bg} text-white shadow-xl`
                  : `${areaColors.bgLighter} ${areaColors.text} hover:${areaColors.bgLight} border-2 ${areaColors.border}`
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                  maritalStatus === 'married' ? 'bg-white/30' : 'bg-white'
                }`}>
                  <span className="text-2xl sm:text-3xl">💑</span>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1 truncate">{t('assessment.questions.maritalStatus.married')}</div>
                  <div className={`text-xs sm:text-sm ${maritalStatus === 'married' ? 'text-white/80' : 'text-gray-600'} line-clamp-2`}>
                    {t('assessment.questions.maritalStatus.marriedDesc')}
                  </div>
                </div>
              </div>
            </button>

            {/* Single Button */}
            <button
              onClick={() => handleMaritalStatusSelect('single')}
              className={`w-full rounded-xl sm:rounded-2xl transition-all transform active:scale-98 ${
                maritalStatus === 'single'
                  ? `${areaColors.bg} text-white shadow-xl`
                  : `${areaColors.bgLighter} ${areaColors.text} hover:${areaColors.bgLight} border-2 ${areaColors.border}`
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                  maritalStatus === 'single' ? 'bg-white/30' : 'bg-white'
                }`}>
                  <span className="text-2xl sm:text-3xl">🙋</span>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1 truncate">{t('assessment.questions.maritalStatus.single')}</div>
                  <div className={`text-xs sm:text-sm ${maritalStatus === 'single' ? 'text-white/80' : 'text-gray-600'} line-clamp-2`}>
                    {t('assessment.questions.maritalStatus.singleDesc')}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  {t('assessment.questions.maritalStatus.info')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Copyright />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        {/* Header with Area Info */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${getAreaColor(areaName)} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm`}>
                {getAreaIcon(areaName)}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{areaName}</h1>
                <p className="text-sm sm:text-base text-gray-500">{t('assessment.questions.areaOf', { current: 2, total: 6 })}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <LanguageSelectorCompact />
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-4 sm:mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm sm:text-base text-gray-600">{t('assessment.questions.overallProgress')}</span>
              <span className="text-sm sm:text-base font-medium text-gray-900">{t('assessment.questions.questionsProgress', { current: totalAnswered, total: 10 })}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
              <div
                className={`${areaColors.bg} h-2 sm:h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${(totalAnswered / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Progress Dots */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm sm:text-base font-medium text-gray-900">{t('assessment.questions.questionOf', { current: currentQuestionIndex + 1, total: questions.length })}</span>
            <div className="flex gap-1.5">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                    answers[q.id] !== undefined
                      ? answers[q.id]
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className={`bg-gradient-to-br ${areaColors.gradient} rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 shadow-xl`}>
          <div className="text-center">
            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-relaxed px-2 sm:px-4">
              {currentQuestion.text}
            </h2>

            {/* Subtitle - Tip dinámico */}
            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-md mx-auto px-2">
              {currentQuestion.tip}
            </p>


          </div>
        </div>

        {/* Answer Buttons */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {/* YES Button */}
          <button
            onClick={() => handleAnswerSelect(true)}
            disabled={!currentQuestion || submitting || isTransitioning}
            className={`w-[50%] rounded-xl sm:rounded-2xl transition-all transform active:scale-98 ${
              !currentQuestion || submitting || isTransitioning
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300 opacity-50'
                : answers[currentQuestion.id] === true
                ? 'bg-green-500 text-white shadow-xl'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                !currentQuestion || submitting || isTransitioning
                  ? 'bg-gray-300'
                  : answers[currentQuestion.id] === true ? 'bg-white/30' : 'bg-white'
              }`}>
                <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  !currentQuestion || submitting || isTransitioning
                    ? 'text-gray-500'
                    : answers[currentQuestion.id] === true ? 'text-white' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">{t('assessment.questions.yes')}</div>
                <div className={`text-xs sm:text-sm font-medium ${
                  !currentQuestion || submitting || isTransitioning
                    ? 'text-gray-500'
                    : answers[currentQuestion.id] === true ? 'text-white/90' : 'text-green-600'
                }`}>
                </div>
              </div>
            </div>
          </button>

          {/* NO Button */}
          <button
            onClick={() => handleAnswerSelect(false)}
            disabled={!currentQuestion || submitting || isTransitioning}
            className={`w-[50%] rounded-xl sm:rounded-2xl transition-all transform active:scale-98 ${
              !currentQuestion || submitting || isTransitioning
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300 opacity-50'
                : answers[currentQuestion.id] === false
                ? 'bg-red-500 text-white shadow-xl'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                !currentQuestion || submitting || isTransitioning
                  ? 'bg-gray-300'
                  : answers[currentQuestion.id] === false ? 'bg-white/30' : 'bg-white'
              }`}>
                <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  !currentQuestion || submitting || isTransitioning
                    ? 'text-gray-500'
                    : answers[currentQuestion.id] === false ? 'text-white' : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">{t('assessment.questions.no')}</div>
                <div className={`text-xs sm:text-sm font-medium ${
                  !currentQuestion || submitting || isTransitioning
                    ? 'text-gray-500'
                    : answers[currentQuestion.id] === false ? 'text-white/90' : 'text-red-600'
                }`}>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Submit Button */}
        {allQuestionsAnswered && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-4 sm:py-5 mb-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all shadow-lg ${
              submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : `${areaColors.bg} text-white hover:opacity-90`
            }`}
          >
            {submitting ? t('assessment.questions.submitting') : t('assessment.questions.completeAssessment')}
          </button>
        )}

        {/* Reset Button - Solo si hay respuestas y no se está enviando */}
        {totalAnswered > 0 && !submitting && (
          <button
            onClick={handleOpenResetModal}
            className="w-full py-3 sm:py-4 mb-6 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{t('assessment.questions.resetAnswers')}</span>
            </div>
          </button>
        )}

        {/* Consider these aspects */}
        <div className={`${areaColors.bgLighter} rounded-2xl p-5 py-4 sm:p-6 lg:p-8 mb-6 border ${areaColors.border}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 ${areaColors.bgLight} rounded-full flex items-center justify-center flex-shrink-0`}>
              <svg className={`w-5 h-5 ${areaColors.text}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-3">{t('assessment.questions.considerAspects')}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className={`${areaColors.text} font-bold`}>•</span>
                  <span>{t('assessment.questions.aspect1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${areaColors.text} font-bold`}>•</span>
                  <span>{t('assessment.questions.aspect2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${areaColors.text} font-bold`}>•</span>
                  <span>{t('assessment.questions.aspect3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${areaColors.text} font-bold`}>•</span>
                  <span>{t('assessment.questions.aspect4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Professional Activity Progress */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 mb-6 shadow-sm">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-4 sm:mb-5">{t('assessment.questions.areaProgress', { area: areaName })}</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 sm:p-5 text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 mb-1">{yesCount}</div>
              <div className="text-xs sm:text-sm text-green-700 font-medium">{t('assessment.questions.yesAnswers')}</div>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-5 text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-600 mb-1">{noCount}</div>
              <div className="text-xs sm:text-sm text-red-700 font-medium">{t('assessment.questions.noAnswers')}</div>
            </div>
          </div>
        </div>

        {/* Assessment Tips */}
        <div className="bg-blue-50 rounded-2xl p-5 sm:p-6 lg:p-8 mb-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('assessment.questions.assessmentTips')}</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>{t('assessment.questions.tip1')}</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>{t('assessment.questions.tip2')}</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>{t('assessment.questions.tip3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Choose your answer to continue */}
        <div className="text-center mb-6">
          <p className="text-sm sm:text-base text-gray-500 mb-4">{t('assessment.questions.chooseAnswer')}</p>
          <div className="flex justify-center">
            <div className="bg-gray-200 rounded-full px-4 py-2">
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === 2 ? `${areaColors.bg} w-8` : 'bg-gray-400 w-2'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Copyright />
      <BottomNav />

      {/* Modal de confirmación para resetear respuestas */}
      <ConfirmModal
        isOpen={showResetModal}
        onClose={handleCloseResetModal}
        onConfirm={handleConfirmReset}
        title={t('assessment.questions.resetModalTitle')}
        message={t('assessment.questions.resetModalMessage')}
        confirmText={t('assessment.questions.resetConfirm')}
        cancelText={t('assessment.questions.resetCancel')}
        confirmButtonClass="bg-orange-600 hover:bg-orange-700"
        isLoading={false}
      />
    </div>
  );
};
