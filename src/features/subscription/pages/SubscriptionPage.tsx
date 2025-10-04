import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav, PageHeader } from '@/shared/components';
import { subscriptionService, type Subscription, type UserSubscription } from '@/infrastructure/services';

/**
 * Página de Suscripción y Planes
 */
export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansData, userSub] = await Promise.all([
          subscriptionService.getAllPlans(),
          subscriptionService.getMySubscription(),
        ]);
        setPlans(plansData.subscriptions);
        setCurrentSubscription(userSub);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      
      // Si ya tiene suscripción, actualizarla. Si no, crear una nueva.
      if (currentSubscription) {
        await subscriptionService.updateSubscription(currentSubscription.id, planId);
        // Después de actualizar, recargar la información completa de la suscripción
        const updatedSub = await subscriptionService.getMySubscription();
        setCurrentSubscription(updatedSub);
      } else {
        await subscriptionService.subscribeToPlan(planId);
        // Recargar también después de crear para tener la estructura completa
        const completeSub = await subscriptionService.getMySubscription();
        setCurrentSubscription(completeSub);
      }
    } catch (error) {
      console.error('Error processing subscription:', error);
    } finally {
      setSubscribing(false);
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'BASICO':
        return {
          bg: 'from-green-400 to-green-600',
          border: 'border-green-500',
          text: 'text-green-600',
          button: 'bg-green-600 hover:bg-green-700',
          badge: 'bg-green-500',
        };
      case 'INTERMEDIO':
        return {
          bg: 'from-blue-500 to-blue-700',
          border: 'border-blue-500',
          text: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          badge: 'bg-blue-500',
        };
      case 'AVANZADO':
        return {
          bg: 'from-purple-500 to-purple-700',
          border: 'border-purple-500',
          text: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700',
          badge: 'bg-purple-500',
        };
      default:
        return {
          bg: 'from-gray-400 to-gray-600',
          border: 'border-gray-500',
          text: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700',
          badge: 'bg-gray-500',
        };
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'BASICO':
        return '🌱';
      case 'INTERMEDIO':
        return '⚡';
      case 'AVANZADO':
        return '👑';
      default:
        return '📦';
    }
  };

  const getFeatureName = (feature: string) => {
    const featureMap: Record<string, string> = {
      'actions': 'Acciones Diarias',
      'projects': 'Proyectos Activos',
      'analytics': 'Analytics & Insights',
      'team': 'Colaboración en Equipo',
      'priority': 'Soporte Prioritario',
      'custom': 'Personalización Avanzada',
    };
    return featureMap[feature] || feature;
  };

  const formatFeatures = (features: string[]) => {
    // Las features vienen como array de strings
    return features.map(f => getFeatureName(f));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  const hasSubscription = currentSubscription !== null;
  const isActivePlan = (planId: string) => currentSubscription?.plan.id === planId;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <PageHeader 
        title="Subscription Plans"
        subtitle={hasSubscription ? "Manage your subscription" : "Choose your transformation journey"}
        showBackButton={true}
        showSearch={false}
        showFilter={false}
      />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Intro section - Only show if no subscription */}
        {!hasSubscription && (
          <div className="mb-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Transform Your Life with the Right Plan
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Choose a plan that fits your transformation goals. All plans include access to your Life Wheel, 
                assessments, and core features to help you achieve your objectives.
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Banner - Only show if has subscription */}
        {hasSubscription && currentSubscription && (
          <div className={`mb-8 bg-gradient-to-r ${getPlanColor(currentSubscription.planName).bg} rounded-2xl p-6 text-white shadow-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{getPlanIcon(currentSubscription.planName)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">Your Current Plan: {currentSubscription.plan.name}</h3>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                        {currentSubscription.active ? '✓ Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-white/90">{currentSubscription.plan.description}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">${currentSubscription.price}</div>
                <div className="text-white/90">per month</div>
                <div className="text-xs text-white/70 mt-1">
                  Renews: {new Date(currentSubscription.renewalDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const colors = getPlanColor(plan.planType);
            const isCurrentPlan = isActivePlan(plan.id);
            const isRecommended = plan.planType === 'INTERMEDIO';

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  isCurrentPlan ? `${colors.border} ring-4 ring-offset-2 ring-${colors.border}` : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Recommended Badge */}
                {isRecommended && !hasSubscription && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                      ⭐ Recommended
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className={`px-4 py-1 ${colors.badge} text-white text-sm font-bold rounded-full shadow-lg`}>
                      ✓ Current Plan
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Icon & Name */}
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center text-4xl shadow-lg`}>
                      {getPlanIcon(plan.planType)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-gray-900 mb-1">
                      ${plan.price}
                    </div>
                    <div className="text-gray-500">per month</div>
                  </div>

                  {/* Features */}
                  <div className="mb-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-6 h-6 ${colors.badge} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{getFeatureName(feature)}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 px-6 bg-gray-100 text-gray-500 font-semibold rounded-xl cursor-not-allowed"
                    >
                      ✓ Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing}
                      className={`w-full py-3 px-6 ${colors.button} text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {subscribing ? 'Processing...' : hasSubscription ? 'Change Plan' : 'Get Started'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans at any time?</h4>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes will affect your next billing cycle.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens if I cancel my subscription?</h4>
              <p className="text-gray-600 text-sm">
                Your data is always yours. If you cancel, you'll retain access until the end of your billing period, 
                and your data will be safely stored if you decide to return.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">
                The BASICO plan gives you access to core features to get started. You can upgrade anytime as your needs grow.
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span>Instant Activation</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

