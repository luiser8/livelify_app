import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomNav, PageHeader, Copyright } from '@/shared/components';
import { subscriptionService, type Subscription, type UserSubscription } from '@/infrastructure/services';
import { decodeToken } from '@/shared/utils';

/**
 * Página de Suscripción y Planes
 */
export const SubscriptionPage = () => {
  const { t } = useTranslation();
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
      
      // Obtener el currencyId del token
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found');
        return;
      }
      
      const decoded = decodeToken(token);
      const currencyId = decoded?.currencyId || '15c0d07a-eb59-443e-8856-7b0f838c97b4'; // Default currency si no está en el token
      
      // Encontrar el plan seleccionado para obtener el amountPaid (basePrice)
      const selectedPlan = plans.find(p => p.id === planId);
      const amountPaid = selectedPlan?.basePrice;
      
      // Si ya tiene suscripción, actualizarla. Si no, crear una nueva.
      if (currentSubscription) {
        await subscriptionService.updateSubscription({
          id: currentSubscription.id,
          planId,
          currencyId,
          amountPaid
        });
        // Después de actualizar, recargar la información completa de la suscripción
        const updatedSub = await subscriptionService.getMySubscription();
        setCurrentSubscription(updatedSub);
      } else {
        await subscriptionService.subscribeToPlan({
          planId,
          currencyId,
          amountPaid
        });
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
      case 'MONTHLY':
        return {
          bg: 'from-blue-400 to-blue-600',
          border: 'border-blue-500',
          text: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          badge: 'bg-blue-500',
        };
      case 'QUARTERLY':
        return {
          bg: 'from-green-500 to-green-700',
          border: 'border-green-500',
          text: 'text-green-600',
          button: 'bg-green-600 hover:bg-green-700',
          badge: 'bg-green-500',
        };
      case 'SEMESTER':
        return {
          bg: 'from-purple-500 to-purple-700',
          border: 'border-purple-500',
          text: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700',
          badge: 'bg-purple-500',
        };
      case 'ANNUAL':
        return {
          bg: 'from-amber-500 to-orange-600',
          border: 'border-amber-500',
          text: 'text-amber-600',
          button: 'bg-amber-600 hover:bg-amber-700',
          badge: 'bg-amber-500',
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
      case 'MONTHLY':
        return '📅';
      case 'QUARTERLY':
        return '🌟';
      case 'SEMESTER':
        return '⚡';
      case 'ANNUAL':
        return '👑';
      default:
        return '📦';
    }
  };

  const getPlanName = (planType: string) => {
    const key = `subscription.planTypes.${planType}.name`;
    return t(key, planType);
  };

  const getPlanDescription = (planType: string) => {
    const key = `subscription.planTypes.${planType}.description`;
    return t(key, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('subscription.loading')}</p>
        </div>
      </div>
    );
  }

  const hasSubscription = currentSubscription !== null;
  const isActivePlan = (planId: string) => currentSubscription?.plan.id === planId;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <PageHeader 
        title={t('subscription.title')}
        subtitle={hasSubscription ? t('subscription.subtitle') : t('subscription.chooseJourney')}
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
                {t('subscription.transformTitle')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t('subscription.transformDescription')}
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Banner - Only show if has subscription */}
        {hasSubscription && currentSubscription && (
          <div className={`mb-8 bg-gradient-to-r ${getPlanColor(currentSubscription.plan.name).bg} rounded-2xl p-6 text-white shadow-xl`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                  {getPlanIcon(currentSubscription.plan.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold">{t('subscription.currentPlan')} {getPlanName(currentSubscription.plan.name)}</h3>
                  </div>
                  <p className="text-white/90 text-sm mb-2">{getPlanDescription(currentSubscription.plan.name)}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 ${currentSubscription.active ? 'bg-white/20' : 'bg-red-500/50'} rounded-full text-sm font-semibold`}>
                      {currentSubscription.active ? `✓ ${t('subscription.active')}` : t('subscription.inactive')}
                    </span>
                    {currentSubscription.autoRenew && (
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                        🔄 Auto-renew
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-4xl font-bold">${currentSubscription.plan.basePrice}</span>
                </div>
                <div className="text-sm text-white/80 mt-1">
                  {currentSubscription.plan.billingCycle} {currentSubscription.plan.billingCycle === 1 ? t('subscription.month') : t('subscription.months')}
                </div>
                <div className="text-xs text-white/70 mt-2">
                  {t('subscription.renews')} {new Date(currentSubscription.renewalDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid - Minimalist Design */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {plans.map((plan) => {
            const isCurrentPlan = isActivePlan(plan.id);
            const isRecommended = plan.name === 'ANNUAL';
            const hasSavings = plan.savings > 0;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
                  isCurrentPlan ? 'border-indigo-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Compact Badge */}
                {isRecommended && !hasSubscription && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-md">
                      ⭐
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      ✓ {t('subscription.active')}
                    </span>
                  </div>
                )}

                <div className="p-5">
                  {/* Plan Header - Compact */}
                  <div className="text-center mb-5">
                    <div className="text-3xl mb-2">{getPlanIcon(plan.name)}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{getPlanName(plan.name)}</h3>
                    <p className="text-gray-500 text-xs">{getPlanDescription(plan.name)}</p>
                  </div>

                  {/* Price - Simplified */}
                  <div className="text-center mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-3xl font-bold text-gray-900">${plan.basePrice}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {plan.billingCycle} {plan.billingCycle === 1 ? t('subscription.month') : t('subscription.months')} • ${plan.pricePerMonth}/{t('subscription.month')}
                    </div>
                    {hasSavings && (
                      <div className="mt-2 inline-block px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                        -{plan.discount}% ({t('subscription.save')} ${plan.savings.toFixed(0)})
                      </div>
                    )}
                  </div>

                  {/* Features - Minimal */}
                  <div className="mb-5 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{plan.features.actions} {t('subscription.actions')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{plan.features.projects} {t('subscription.projects')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{t('subscription.analytics')}</span>
                    </div>
                  </div>

                  {/* CTA Button - Minimal */}
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 bg-gray-50 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed border border-gray-200"
                    >
                      {t('subscription.currentPlanBadge')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing}
                      className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {subscribing ? t('subscription.processing') : hasSubscription ? t('subscription.changePlan') : t('subscription.getStarted')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('subscription.faq.title')}</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('subscription.faq.q1')}</h4>
              <p className="text-gray-600 text-sm">
                {t('subscription.faq.a1')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('subscription.faq.q2')}</h4>
              <p className="text-gray-600 text-sm">
                {t('subscription.faq.a2')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('subscription.faq.q3')}</h4>
              <p className="text-gray-600 text-sm">
                {t('subscription.faq.a3')}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Copyright />
      <BottomNav />
    </div>
  );
};



