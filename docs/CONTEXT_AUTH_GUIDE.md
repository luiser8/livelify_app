# 🔐 Guía de Implementación - Contexto de Autenticación

Esta guía te ayudará a integrar el contexto de autenticación en tu flujo de login existente.

## 📦 Archivos Creados

```
src/
├── shared/
│   ├── types/
│   │   └── auth.types.ts              # Interfaces AuthUser y DecodedToken
│   ├── hooks/
│   │   ├── useStorage.ts              # Hook para localStorage
│   │   └── index.ts                   # Exportaciones
│   └── utils/
│       └── jwt.ts                     # Utilidades para tokens JWT
├── features/
│   └── auth/
│       ├── context/
│       │   ├── AuthContext.tsx        # Contexto principal
│       │   ├── AuthContext.types.ts   # Tipos del contexto
│       │   ├── index.ts               # Exportaciones
│       │   └── README.md              # Documentación detallada
│       └── hooks/
│           └── useAuthContext.example.tsx  # Ejemplos de uso
└── App.tsx                            # ✅ Ya configurado con AuthProvider
```

## 🚀 Pasos para Integrar

### Paso 1: El Provider ya está configurado ✅

Ya hemos envuelto tu aplicación con el `AuthProvider` en `App.tsx`:

```tsx
import { AuthProvider } from './features/auth/context';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
```

### Paso 2: Actualizar el LoginForm

Modifica tu `LoginForm.tsx` para usar el contexto:

```tsx
import { useAuth } from '@/features/auth/context';
import { decodeToken, tokenToAuthUser, isTokenExpired } from '@/shared/utils/jwt';
import { authService } from '@/infrastructure/services/authService';

export const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. Llamar al servicio de login
      const response = await authService.login({ email, password });
      
      // 2. Decodificar el token
      const decoded = decodeToken(response.token);
      
      if (!decoded) {
        throw new Error('Token inválido');
      }
      
      // 3. Verificar que no esté expirado
      if (isTokenExpired(response.token)) {
        throw new Error('Token expirado');
      }
      
      // 4. Convertir a AuthUser
      const authUser = tokenToAuthUser(decoded, response.token);
      
      // 5. Guardar en contexto (automáticamente guarda en localStorage)
      login(authUser);
      
      // 6. Redirigir al home o dashboard
      // navigate('/home');
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Mostrar mensaje de error al usuario
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Tus campos de formulario */}
    </form>
  );
};
```

### Paso 3: Actualizar el loginUseCase

Actualiza `src/core/usecases/auth/loginUseCase.ts`:

```tsx
import { authService } from '../../../infrastructure/services/authService';
import { decodeToken, tokenToAuthUser, isTokenExpired } from '../../../shared/utils/jwt';
import type { AuthUser } from '../../../shared/types/auth.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const loginUseCase = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  // Validaciones de negocio
  if (!credentials.email || !credentials.password) {
    throw new Error('Email y contraseña son requeridos');
  }

  // Llamar al servicio
  const response = await authService.login(credentials);
  
  // Decodificar y validar token
  const decoded = decodeToken(response.token);
  
  if (!decoded) {
    throw new Error('Token inválido');
  }
  
  if (isTokenExpired(response.token)) {
    throw new Error('Token expirado');
  }
  
  // Convertir a AuthUser
  const user = tokenToAuthUser(decoded, response.token);
  
  return {
    token: response.token,
    user,
  };
};
```

### Paso 4: Proteger Rutas

Crea un componente `ProtectedRoute` en `src/routes/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

Luego úsalo en tu `AppRouter.tsx`:

```tsx
import { ProtectedRoute } from './ProtectedRoute';

<Route 
  path="/home" 
  element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  } 
/>
```

### Paso 5: Usar en Componentes

Ahora puedes usar el contexto en cualquier componente:

```tsx
import { useAuth } from '@/features/auth/context';

export const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Bienvenido, {user?.firstName} {user?.lastName}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};
```

### Paso 6: Agregar Token a Peticiones HTTP

Actualiza tu `src/infrastructure/api/client.ts` para incluir el token:

```tsx
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para agregar el token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

## 🎯 Resumen de Funcionalidades

| Funcionalidad | Implementado |
|---------------|--------------|
| ✅ Context Provider | Sí |
| ✅ Hook useAuth | Sí |
| ✅ Almacenamiento en localStorage | Sí |
| ✅ Decodificación JWT | Sí |
| ✅ Validación de expiración | Sí |
| ✅ Login | Listo para implementar |
| ✅ Logout | Sí |
| ✅ Persistencia de sesión | Sí |

## 📚 Recursos Adicionales

- **Documentación completa**: `src/features/auth/context/README.md`
- **Ejemplos de uso**: `src/features/auth/hooks/useAuthContext.example.tsx`
- **Utilidades JWT**: `src/shared/utils/jwt.ts`

## 🔧 API Completa del Hook `useAuth`

```typescript
const {
  // Estado
  user,              // AuthUser | null
  isAuthenticated,   // boolean
  isLoading,         // boolean
  
  // Métodos
  login,             // (userData: AuthUser) => void
  logout,            // () => void
  setUser,           // (user: AuthUser) => void
  getToken,          // () => string | null
  getUserId,         // () => string | null
  getEmail,          // () => string | null
} = useAuth();
```

## 🎨 Ejemplo Completo de Flujo de Login

```tsx
// LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context';
import { loginUseCase } from '@/core/usecases/auth/loginUseCase';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llamar al caso de uso
      const { user } = await loginUseCase({ email, password });
      
      // Guardar en contexto
      login(user);
      
      // Redirigir
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};
```

## ✨ ¡Listo!

Ahora tienes un sistema completo de autenticación con:
- ✅ Gestión de estado global
- ✅ Persistencia en localStorage
- ✅ Manejo de tokens JWT
- ✅ Protección de rutas
- ✅ TypeScript completo

¿Necesitas ayuda? Revisa los ejemplos en:
- `src/features/auth/hooks/useAuthContext.example.tsx`
- `src/features/auth/context/README.md`

