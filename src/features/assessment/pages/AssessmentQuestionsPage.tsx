import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  assessmentService, 
  answerService,
  type AssessmentQuestion 
} from '@/infrastructure/services';
import { getAreaColor, getAreaIcon } from '@/shared/utils/lifeAreaHelpers';

/**
 * Página de preguntas del Assessment para un área específica
 */
export const AssessmentQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
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
        const data = await assessmentService.getAreaQuestions(areaId);
        setQuestions(data.questions.sort((a, b) => a.order - b.order));
        setAreaName(data.area.name);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [areaId]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalAnswered = Object.keys(answers).length;
  const yesCount = Object.values(answers).filter(val => val === true).length;
  const noCount = Object.values(answers).filter(val => val === false).length;
  const estimatedScore = questions.length > 0 ? ((yesCount / questions.length) * 10).toFixed(1) : '0.0';
  const areaProgress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const allQuestionsAnswered = totalAnswered === questions.length;

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

  // Get recently answered questions (last 3)
  const answeredQuestions = questions
    .filter(q => answers[q.id] !== undefined)
    .slice(-3)
    .reverse();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No questions available</p>
          <button
            onClick={handleSkipArea}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${getAreaColor(areaName)} rounded-lg flex items-center justify-center text-2xl`}>
                {getAreaIcon(areaName)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{areaName}</h1>
                <p className="text-sm text-gray-500">Área 2 de 6</p>
              </div>
            </div>
            <button
              onClick={handleSkipArea}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Skip Area
            </button>
          </div>

          {/* Overall Progress */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Overall Progress</span>
              <span className="text-xs text-gray-600">{totalAnswered} of 60 questions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(totalAnswered / 60) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Progress */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`w-2 h-2 rounded-full ${
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
        <div className="px-6 py-12 bg-gradient-to-br from-blue-50 to-blue-100 mx-6 my-6 rounded-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-relaxed">
              {currentQuestion.text}
            </h2>
            <p className="text-sm text-gray-600">
              Think about your typical week. Are you able to disconnect from work and enjoy personal time without stress?
            </p>
          </div>
        </div>

        {/* Answer Buttons */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
            {/* YES Button */}
            <button
              onClick={() => handleAnswerSelect(true)}
              disabled={submitting}
              className={`w-full p-6 rounded-xl border-2 transition-all ${
                answers[currentQuestion.id] === true
                  ? 'bg-green-500 text-white border-green-500 shadow-lg'
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold mb-1">YES</div>
                  <div className={`text-sm ${answers[currentQuestion.id] === true ? 'text-white' : 'text-green-600'}`}>
                    I maintain good balance
                  </div>
                </div>
              </div>
            </button>

            {/* NO Button */}
            <button
              onClick={() => handleAnswerSelect(false)}
              disabled={submitting}
              className={`w-full p-6 rounded-xl border-2 transition-all ${
                answers[currentQuestion.id] === false
                  ? 'bg-red-500 text-white border-red-500 shadow-lg'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold mb-1">NO</div>
                  <div className={`text-sm ${answers[currentQuestion.id] === false ? 'text-white' : 'text-red-600'}`}>
                    Work dominates my life
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Consider these aspects */}
        <div className="px-6 mb-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Consider these aspects:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Can you disconnect from work emails/calls after hours?</li>
                  <li>• Do you have time for hobbies and relationships?</li>
                  <li>• Do you feel stressed about work during personal time?</li>
                  <li>• Are you able to take breaks and vacations?</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Area Progress */}
        <div className="px-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Progreso de {areaName}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{yesCount}</div>
              <div className="text-sm text-green-700">Respuestas Sí</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">{noCount}</div>
              <div className="text-sm text-red-700">Respuestas No</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Puntaje Estimado del Área</div>
            <div className="text-4xl font-bold text-blue-600">{estimatedScore}/10</div>
          </div>
        </div>

        {/* Recently Answered */}
        {answeredQuestions.length > 0 && (
          <div className="px-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Respondidas Recientemente</h3>
            <div className="space-y-2">
              {answeredQuestions.map((q) => (
                <div key={q.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {answers[q.id] ? (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm text-gray-700 flex-1">{q.text}</span>
                  </div>
                  <span className={`text-sm font-semibold ${answers[q.id] ? 'text-green-600' : 'text-red-600'}`}>
                    {answers[q.id] ? 'YES' : 'NO'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Tips */}
        <div className="px-6 mb-6">
          <div className="bg-purple-50 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Consejos para el Assessment</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Responde basándote en tu situación actual, no en dónde quieres estar</li>
                  <li>• Piensa en los últimos 3 meses al responder</li>
                  <li>• Sé honesto - esto crea tu línea base para mejorar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-6 pb-8">
          {/* Debug info */}
          <div className="text-xs text-gray-500 text-center mb-2">
            Respondidas: {totalAnswered}/{questions.length}
          </div>
          
          {allQuestionsAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : `${getAreaColor(areaName)} text-white hover:opacity-90 shadow-lg`
              }`}
            >
              {submitting ? 'Enviando...' : 'Enviar Assessment del Área'}
            </button>
          ) : (
            <div className="bg-gray-800 text-white py-3 px-6 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span className="text-sm font-medium">Toca una respuesta para continuar</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Progress Bar */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-gray-900">{areaName}</div>
              <div className="text-xs text-gray-600">
                Pregunta {currentQuestionIndex + 1} en esta área • {areaProgress.toFixed(1)}% Completo
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getAreaColor(areaName)}`}
              style={{ width: `${areaProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
