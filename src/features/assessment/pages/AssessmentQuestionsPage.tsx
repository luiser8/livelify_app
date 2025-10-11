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
import { BottomNav, LanguageSelectorCompact } from '@/shared/components';

/**
 * Página de preguntas del Assessment para un área específica
 */
export const AssessmentQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { areaId } = useParams<{ areaId: string }>();
  
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [areaName, setAreaName] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!areaId) return;

      try {
        // Primero verificar si el área ya tiene score
        const lifeWheel = await lifeWheelService.getMyLifeWheel();
        const area = lifeWheel.lifeAreas.find(a => a.areaId === areaId);
        
        // Si el área ya tiene score > 0, redirigir al usuario
        if (area && area.score > 0) {
          console.log('Area already completed, redirecting...');
          navigate('/assessment/intro');
          return;
        }

        // Si no tiene score, cargar las preguntas normalmente
        const data = await assessmentService.getAreaQuestions(areaId);
        setQuestions(data.questions.sort((a, b) => a.order - b.order));
        setAreaName(data.area.name);
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

  // Debug: Log cuando cambian las respuestas
  useEffect(() => {
    console.log('Total answered:', totalAnswered, 'Total questions:', questions.length, 'All answered:', allQuestionsAnswered);
  }, [totalAnswered, questions.length, allQuestionsAnswered]);

  const handleAnswerSelect = (value: boolean) => {
    if (!currentQuestion) return;
    
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    
    setAnswers(newAnswers);

    // Auto-advance to next question after 500ms (solo si no es la última)
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 500);
  };

  const handleSkipArea = () => {
    navigate('/assessment/intro');
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

      console.log('Answers submitted successfully:', result);
      navigate('/assessment/intro');
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

  if (!currentQuestion) {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto w-full px-6 py-6">
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
              <span className="text-sm sm:text-base font-medium text-gray-900">{t('assessment.questions.questionsProgress', { current: totalAnswered, total: 60 })}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
              <div
                className={`${areaColors.bg} h-2 sm:h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${(totalAnswered / 60) * 100}%` }}
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
            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg text-2xl sm:text-3xl lg:text-4xl">
              {getAreaIcon(areaName)}
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-relaxed px-2 sm:px-4">
              {currentQuestion.text}
            </h2>

            {/* Subtitle */}
            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-md mx-auto px-2">
              {t('assessment.questions.thinkTypicalWeek')}
            </p>

            {/* Work-Life Balance Visual */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">{t('assessment.questions.work')}</span>
              </div>
              <div className="w-16 h-0.5 bg-white/30"></div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">{t('assessment.questions.life')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Buttons */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {/* YES Button */}
          <button
            onClick={() => handleAnswerSelect(true)}
            disabled={!currentQuestion || submitting}
            className={`w-full rounded-xl sm:rounded-2xl transition-all transform active:scale-98 ${
              !currentQuestion || submitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300 opacity-50'
                : answers[currentQuestion.id] === true
                ? 'bg-green-500 text-white shadow-xl'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                !currentQuestion || submitting
                  ? 'bg-gray-300'
                  : answers[currentQuestion.id] === true ? 'bg-white/30' : 'bg-white'
              }`}>
                <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  !currentQuestion || submitting
                    ? 'text-gray-500'
                    : answers[currentQuestion.id] === true ? 'text-white' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">{t('assessment.questions.yes')}</div>
                <div className={`text-xs sm:text-sm font-medium ${
                  !currentQuestion || submitting
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
            disabled={!currentQuestion || submitting}
            className={`w-full rounded-xl sm:rounded-2xl transition-all transform active:scale-98 ${
              !currentQuestion || submitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300 opacity-50'
                : answers[currentQuestion.id] === false
                ? 'bg-red-500 text-white shadow-xl'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                !currentQuestion || submitting
                  ? 'bg-gray-300'
                  : answers[currentQuestion.id] === false ? 'bg-white/30' : 'bg-white'
              }`}>
                <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  !currentQuestion || submitting
                    ? 'text-gray-500'
                    : answers[currentQuestion.id] === false ? 'text-white' : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">{t('assessment.questions.no')}</div>
                <div className={`text-xs sm:text-sm font-medium ${
                  !currentQuestion || submitting
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

      <BottomNav />
    </div>
  );
};
