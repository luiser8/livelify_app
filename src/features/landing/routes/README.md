# 🛣️ Sistema de Rutas - Livelify

Sistema de rutas con protección basada en autenticación.

## 📁 Estructura

```
src/routes/
├── AppRouter.tsx         # Configuración principal de rutas
├── ProtectedRoute.tsx    # Componente para rutas protegidas
├── PublicRoute.tsx       # Componente para rutas públicas (login/register)
├── index.ts             # Exportaciones
└── README.md            # Este archivo
```

## 🔐 Tipos de Rutas

### 1. Rutas Públicas (sin restricción)
Accesibles para todos, autenticados o no.

**Ejemplo:** `/` (OnboardingPage)

```tsx
<Route path="/" element={<OnboardingPage />} />
```

### 2. Rutas de Autenticación (PublicRoute)
Solo accesibles si **NO** estás autenticado.  
Si ya tienes sesión, redirige a `/home`.

**Ejemplo:** `/login`, `/register`

```tsx
<Route 
  path="/login" 
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  } 
/>
```

**Comportamiento:**
- ❌ Sin autenticación → Muestra la página
- ✅ Con autenticación → Redirige a `/home`

### 3. Rutas Protegidas (ProtectedRoute)
Solo accesibles si **SÍ** estás autenticado.  
Si no tienes sesión, redirige a `/login`.

**Ejemplo:** `/home`

```tsx
<Route 
  path="/home" 
  element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  } 
/>
```

**Comportamiento:**
- ✅ Con autenticación → Muestra la página
- ❌ Sin autenticación → Redirige a `/login`

## 🔄 Flujo de Navegación

### Usuario NO Autenticado

```
/                    ✅ Onboarding (accesible)
/login               ✅ Login (accesible)
/register            ✅ Register (accesible)
/home                ❌ Redirige a /login
```

### Usuario Autenticado

```
/                    ✅ Onboarding (accesible, muestra logout)
/login               ❌ Redirige a /home
/register            ❌ Redirige a /home
/home                ✅ HomePage (accesible)
```

## 🎯 OnboardingPage Adaptativa

La página de onboarding cambia según el estado de autenticación:

### Sin Autenticación
```
┌─────────────────────────────────────┐
│  I have an account     [Sign up]    │ ← Botones visibles
├─────────────────────────────────────┤
│                                     │
│           Livelify Logo             │
│                                     │
│       [Explore the App]             │ ← Va a /login
│    [Start My Assessment]            │
└─────────────────────────────────────┘
```

### Con Autenticación
```
┌─────────────────────────────────────┐
│ Bienvenido, Juan    [Cerrar sesión] │ ← Muestra nombre + logout
├─────────────────────────────────────┤
│                                     │
│           Livelify Logo             │
│                                     │
│         [Go to App]                 │ ← Va a /home
│    [Start My Assessment]            │
└─────────────────────────────────────┘
```

## 📝 Componentes de Protección

### ProtectedRoute

```tsx
import { ProtectedRoute } from '@/routes';

<ProtectedRoute>
  <MiComponenteProtegido />
</ProtectedRoute>
```

**Características:**
- Verifica `isAuthenticated` del contexto
- Muestra loading mientras verifica la sesión
- Redirige a `/login` si no hay sesión
- Permite acceso si hay sesión válida

### PublicRoute

```tsx
import { PublicRoute } from '@/routes';

<PublicRoute>
  <LoginPage />
</PublicRoute>
```

**Características:**
- Verifica `isAuthenticated` del contexto
- Muestra loading mientras verifica la sesión
- Redirige a `/home` si ya hay sesión
- Permite acceso si no hay sesión

## 🔍 Verificación de Sesión

Ambos componentes usan el hook `useAuth()`:

```tsx
const { isAuthenticated, isLoading } = useAuth();

// isLoading = true → Muestra pantalla de carga
// isLoading = false → Verifica isAuthenticated
```

### Estado de Loading

Mientras se verifica la sesión (cargando desde localStorage):

```tsx
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Cargando...</div>
    </div>
  );
}
```

## 🎨 Ejemplo Completo

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/routes';

<BrowserRouter>
  <Routes>
    {/* Siempre accesible */}
    <Route path="/" element={<OnboardingPage />} />
    
    {/* Solo sin autenticación */}
    <Route 
      path="/login" 
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } 
    />
    
    {/* Solo con autenticación */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } 
    />
  </Routes>
</BrowserRouter>
```

## 🚀 Agregar Nueva Ruta Protegida

1. **Crear el componente de la página:**
```tsx
// src/features/profile/pages/ProfilePage.tsx
export const ProfilePage = () => {
  return <div>Mi Perfil</div>;
};
```

2. **Agregar ruta en AppRouter.tsx:**
```tsx
import { ProfilePage } from '../features/profile/pages';

<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

## 🛡️ Seguridad

- ✅ **Verificación automática** de sesión en cada navegación
- ✅ **Redirecciones automáticas** según estado de autenticación
- ✅ **Loading states** para evitar parpadeos
- ✅ **Persistencia** de sesión en localStorage
- ✅ **Limpieza automática** de sesión en logout

## 🔄 Actualización de Estado

El sistema se actualiza automáticamente cuando:

1. **Login exitoso** → `isAuthenticated = true`
2. **Logout** → `isAuthenticated = false`
3. **Refresh de página** → Lee desde localStorage
4. **Token expirado** → Redirige a login (401)

## 📊 Flujo Completo

```
Usuario → Abre /home
    │
    ├─ ProtectedRoute verifica sesión
    │   │
    │   ├─ isLoading = true
    │   │   └─► Muestra "Cargando..."
    │   │
    │   ├─ isLoading = false
    │   │   │
    │   │   ├─ isAuthenticated = true
    │   │   │   └─► Muestra HomePage
    │   │   │
    │   │   └─ isAuthenticated = false
    │   │       └─► Redirige a /login
```

## 🎯 Mejores Prácticas

1. **Siempre proteger rutas privadas** con `ProtectedRoute`
2. **Envolver login/register** con `PublicRoute` para evitar re-autenticación
3. **Mantener OnboardingPage sin protección** para landing page pública
4. **Usar loading states** para mejor UX
5. **Manejar 404** redirigiendo a página apropiada

## 🐛 Debugging

### Ver estado de autenticación
```tsx
const { isAuthenticated, user, isLoading } = useAuth();
console.log({ isAuthenticated, user, isLoading });
```

### Verificar redirecciones
```tsx
// En ProtectedRoute o PublicRoute
console.log('isAuthenticated:', isAuthenticated);
console.log('Should redirect:', !isAuthenticated);
```

### Revisar localStorage
```javascript
// En DevTools Console
console.log('access_token:', localStorage.getItem('access_token'));
console.log('userId:', localStorage.getItem('userId'));
```

## ✨ Características Adicionales

- 🔄 Auto-refresh cuando cambia el estado de autenticación
- 🎨 Pantalla de loading personalizada
- 🚀 Navegación fluida sin parpadeos
- 🔐 Protección a nivel de ruta, no solo componente

