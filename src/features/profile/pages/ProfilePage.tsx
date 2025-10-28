import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomNav, PageHeader, ConfirmModal, Copyright, Pagination } from '@/shared/components';
import { useAuth } from '@/features/auth/context';
import { contextService, userService, type Context, type UpdateUserData } from '@/infrastructure/services';
import countryCodes from '@/shared/utils/countryCodesData';
import { useStorage, usePagination } from '@/shared/hooks';

/**
 * Página de Profile
 */
export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, logout, setUser } = useAuth();
  const { saveUserToStorage } = useStorage();
  const [allContexts, setAllContexts] = useState<Context[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContextName, setNewContextName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contextToDelete, setContextToDelete] = useState<Context | null>(null);

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    avatarUrl: '',
    password: '',
    confirmPassword: ''
  });
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Función de ordenamiento para contextos (más recientes primero)
  const sortContextsByDate = (a: Context, b: Context) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };

  // Hook de paginación con ordenamiento
  const {
    paginatedData: paginatedContexts,
    totalPages,
    totalItems
  } = usePagination({
    data: allContexts,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortFn: sortContextsByDate
  });

  // Manejador de cambio de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contextsData] = await Promise.all([
          contextService.getMyContexts(),
        ]);
        setAllContexts(contextsData.contexts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateContext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContextName.trim()) return;

    try {
      setCreating(true);
      // Asegurar que siempre tenga el @ al principio
      const contextNameWithAt = newContextName.startsWith('@') ? newContextName : `@${newContextName}`;
      const newContext = await contextService.addContext({ name: contextNameWithAt });
      setAllContexts([...allContexts, newContext]);
      setNewContextName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating context:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenDeleteModal = (context: Context) => {
    if (!context.canDelete) {
      return; // No abrir modal si no se puede eliminar
    }
    setContextToDelete(context);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setContextToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contextToDelete) return;

    try {
      setDeleting(true);
      await contextService.deleteContext(contextToDelete.id);
      setAllContexts(allContexts.filter(ctx => ctx.id !== contextToDelete.id));
      setShowDeleteModal(false);
      setContextToDelete(null);

      // Si después de eliminar la página actual queda vacía, retroceder a la anterior
      if (paginatedContexts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting context:', error);
      alert(t('profile.contexts.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  // Funciones para el modal de edición
  const handleOpenEditModal = () => {
    // Extraer código de país y número de teléfono
    const phone = user?.phone || '';
    let extractedCode = '+1';
    let extractedNumber = '';

    if (phone) {
      // Buscar el código de país que coincida
      const matchedCountry = countryCodes.find(country => phone.startsWith(country.dial_code));
      if (matchedCountry) {
        extractedCode = matchedCountry.dial_code;
        extractedNumber = phone.substring(matchedCountry.dial_code.length);
      } else {
        extractedNumber = phone;
      }
    }

    setEditFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: phone,
      address: user?.address || '',
      avatarUrl: '',
      password: '',
      confirmPassword: ''
    });
    setCountryCode(extractedCode);
    setPhoneNumber(extractedNumber);
    setPasswordError('');
    setShowPasswordFields(false);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    if (!updating) {
      setShowEditModal(false);
      setEditFormData({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        avatarUrl: '',
        password: '',
        confirmPassword: ''
      });
      setCountryCode('+1');
      setPhoneNumber('');
      setCountrySearchTerm('');
      setPasswordError('');
      setShowPasswordFields(false);
    }
  };

  const handleEditFormChange = (field: keyof typeof editFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCountryCodeSelect = (code: string) => {
    setCountryCode(code);
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d\s-()]/g, '');
    setPhoneNumber(value);
  };

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    country.dial_code.includes(countrySearchTerm)
  );

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar contraseñas si se activó el checkbox de cambiar contraseña
    if (showPasswordFields) {
      if (!editFormData.password || !editFormData.confirmPassword) {
        setPasswordError(t('profile.editModal.passwordRequired'));
        return;
      }
      if (editFormData.password !== editFormData.confirmPassword) {
        setPasswordError(t('profile.editModal.passwordMismatch'));
        return;
      }
      if (editFormData.password.length < 6) {
        setPasswordError(t('profile.editModal.passwordTooShort'));
        return;
      }
    }

    setPasswordError('');

    try {
      setUpdating(true);

      // Combinar código de país con número de teléfono
      const fullPhone = phoneNumber ? `${countryCode}${phoneNumber}` : '';

      const updateData: UpdateUserData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: fullPhone,
        address: editFormData.address,
      };

      // Solo agregar avatarUrl si tiene valor
      if (editFormData.avatarUrl) {
        updateData.avatarUrl = editFormData.avatarUrl;
      }

      // Solo agregar password si se activó el checkbox y tiene valor
      if (showPasswordFields && editFormData.password) {
        updateData.password = editFormData.password;
      }

      const response = await userService.updateUser(updateData);

      // Actualizar el contexto de autenticación con los nuevos datos
      if (setUser && user) {
        const updatedUser = {
          ...user,
          firstName: response.firstName || user.firstName,
          lastName: response.lastName || user.lastName,
          phone: response.phone || user.phone,
          address: response.address || user.address,
        };

        // Actualizar el estado del contexto
        setUser(updatedUser);

        // Actualizar el localStorage
        saveUserToStorage(updatedUser);
      }

      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <PageHeader
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        showBackButton={true}
        showSearch={false}
        showFilter={false}
      />

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="space-y-4 sm:space-y-6">
          {/* User Info Card - Full Width */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            {/* Header con avatar y botón logout */}
            <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-lg sm:text-2xl font-bold text-indigo-600">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              {/* Logout Button - Responsive */}
              <button
                onClick={logout}
                className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap shrink-0"
              >
                {t('profile.actions.logout')}
              </button>
            </div>

            {/* Información adicional del usuario */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              {/* Teléfono */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">{t('profile.userInfo.phone')}</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                    {user?.phone || t('profile.userInfo.notProvided')}
                  </p>
                </div>
              </div>

              {/* Dirección */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">{t('profile.userInfo.address')}</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900 wrap-break-word">
                    {user?.address || t('profile.userInfo.notProvided')}
                  </p>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleOpenEditModal}
                  className="px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>{t('profile.userInfo.editPersonalData')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Formulario de edición de datos personales */}
          {showEditModal && (
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-4 sm:p-6 shadow-md">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t('profile.editModal.title')}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t('profile.editModal.subtitle')}</p>
                </div>
                <button
                  onClick={handleCloseEditModal}
                  disabled={updating}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.editModal.firstName')} *
                    </label>
                    <input
                      type="text"
                      value={editFormData.firstName}
                      onChange={handleEditFormChange('firstName')}
                      required
                      disabled={updating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.editModal.lastName')} *
                    </label>
                    <input
                      type="text"
                      value={editFormData.lastName}
                      onChange={handleEditFormChange('lastName')}
                      required
                      disabled={updating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Teléfono con selector de código de país */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.editModal.phone')} *
                  </label>
                  <div className="flex gap-2">
                    {/* Selector de código de país */}
                    <div className="relative w-32">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        disabled={updating}
                        className="w-full h-12 px-3 border border-gray-300 rounded-lg text-gray-900 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                      >
                        <span className="truncate">{countryCode}</span>
                        <svg className="w-4 h-4 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown de códigos de país */}
                      {showCountryDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => {
                              setShowCountryDropdown(false);
                              setCountrySearchTerm('');
                            }}
                          />
                          <div className="absolute top-full left-0 mt-1 w-80 sm:w-96 bg-white border border-gray-300 rounded-xl shadow-2xl z-20 max-h-64 overflow-hidden">
                            <div className="p-2 border-b border-gray-200">
                              <input
                                type="text"
                                placeholder="Buscar país..."
                                value={countrySearchTerm}
                                onChange={(e) => setCountrySearchTerm(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountryCodeSelect(country.dial_code)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                                  >
                                    <span className="text-gray-900 text-sm font-medium group-hover:text-indigo-600 truncate">
                                      {country.name}
                                    </span>
                                    <span className="text-gray-600 text-sm font-semibold group-hover:text-indigo-600 ml-2 shrink-0">
                                      {country.dial_code}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                  No se encontraron países
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Input de número de teléfono */}
                    <input
                      type="tel"
                      placeholder="000-000-0000"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      required
                      disabled={updating}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.editModal.address')} *
                  </label>
                  <textarea
                    value={editFormData.address}
                    onChange={handleEditFormChange('address')}
                    required
                    disabled={updating}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  />
                </div>

                {/* Cambiar contraseña (opcional) */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="changePassword"
                      checked={showPasswordFields}
                      onChange={(e) => {
                        setShowPasswordFields(e.target.checked);
                        if (!e.target.checked) {
                          setEditFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                          setPasswordError('');
                        }
                      }}
                      disabled={updating}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label htmlFor="changePassword" className="text-sm font-semibold text-gray-900 flex items-center gap-2 cursor-pointer">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      {t('profile.editModal.changePassword')}
                    </label>
                  </div>

                  {showPasswordFields && (
                    <div className="space-y-4 pl-7">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.editModal.newPassword')} *
                        </label>
                        <input
                          type="password"
                          value={editFormData.password}
                          onChange={handleEditFormChange('password')}
                          required={showPasswordFields}
                          disabled={updating}
                          placeholder={t('profile.editModal.passwordPlaceholder')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.editModal.confirmPassword')} *
                        </label>
                        <input
                          type="password"
                          value={editFormData.confirmPassword}
                          onChange={handleEditFormChange('confirmPassword')}
                          required={showPasswordFields}
                          disabled={updating}
                          placeholder={t('profile.editModal.confirmPasswordPlaceholder')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      {passwordError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{passwordError}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {t('profile.editModal.passwordHintRequired')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    disabled={updating}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('profile.editModal.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? t('profile.editModal.saving') : t('profile.editModal.save')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid Layout for Subscription and Contexts */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">

            {/* Contexts Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('profile.contexts.title')}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{t('profile.contexts.description')}</p>
                </div>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  {showCreateForm ? t('profile.contexts.cancel') : t('profile.contexts.addContext')}
                </button>
              </div>

              {/* Create Form */}
              {showCreateForm && (
                <form onSubmit={handleCreateContext} className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {t('profile.contexts.contextName')}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 flex items-center border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                      <span className="pl-3 sm:pl-4 text-gray-700 font-medium text-sm sm:text-base select-none">@</span>
                      <input
                        type="text"
                        value={newContextName}
                        onChange={(e) => setNewContextName(e.target.value)}
                        placeholder={t('profile.contexts.placeholder')}
                        className="flex-1 px-2 py-2 text-sm sm:text-base border-0 outline-none bg-transparent"
                        disabled={creating}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={creating || !newContextName.trim()}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {creating ? t('profile.contexts.creating') : t('profile.contexts.create')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {t('profile.contexts.prefixNote')}
                  </p>
                </form>
              )}

              {/* Contexts List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 text-sm mt-2">{t('profile.contexts.loading')}</p>
                </div>
              ) : totalItems === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p className="text-gray-500 mb-2">{t('profile.contexts.noContexts')}</p>
                  <p className="text-sm text-gray-400">{t('profile.contexts.getStarted')}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedContexts.map((context) => (
                      <div
                        key={context.id}
                        className="flex items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
                      >
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{context.name}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                              <p className="text-xs text-gray-500 truncate">
                                {t('profile.contexts.created')} {new Date(context.createdAt).toLocaleDateString()}
                              </p>
                              {context.actionsCount > 0 && (
                                <>
                                  <span className="hidden sm:inline text-xs text-gray-500">•</span>
                                  <p className="text-xs text-indigo-600 font-medium">
                                    {t('profile.contexts.actionsCount', { count: context.actionsCount })}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <span className="hidden sm:inline text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200 whitespace-nowrap">
                            {t('profile.contexts.active')}
                          </span>
                          <button
                            onClick={() => handleOpenDeleteModal(context)}
                            disabled={!context.canDelete}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${context.canDelete
                                ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                                : 'text-gray-300 cursor-not-allowed'
                              }`}
                            title={
                              context.canDelete
                                ? t('profile.contexts.delete')
                                : t('profile.contexts.cannotDelete', { count: context.actionsCount })
                            }
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Componente de paginación mejorado */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              maxVisiblePages={5}
              showPageInfo={false}
            />
          )}
        </div>
      </main>

      <Copyright />
      <BottomNav />

      {/* Modal de confirmación para eliminar contexto */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t('profile.contexts.deleteModalTitle')}
        message={t('profile.contexts.deleteModalMessage', { name: contextToDelete?.name || '' })}
        confirmText={t('profile.contexts.deleteConfirm')}
        cancelText={t('profile.contexts.deleteCancel')}
        isLoading={deleting}
      />
    </div>
  );
};

