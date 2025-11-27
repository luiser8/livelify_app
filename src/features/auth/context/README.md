# Contexto de Autenticación

Este módulo proporciona un sistema completo de gestión de autenticación para la aplicación utilizando React Context API.

## 📋 Estructura

```
src/features/auth/context/
├── AuthContext.tsx          # Implementación del contexto y provider
├── AuthContext.types.ts     # Tipos TypeScript
├── index.ts                 # Exportaciones públicas
└── README.md               # Este archivo
```

## 🚀 Instalación

El `AuthProvider` ya está configurado en `App.tsx` y envuelve toda la aplicación:

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

## 📖 Uso Básico

### 1. Importar el hook

```tsx
import { useAuth } from '@/features/auth/context';
```

### 2. Usar en tu componente

```tsx
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user?.firstName}!</p>
      ) : (
        <p>Por favor inicia sesión</p>
      )}
    </div>
  );
}
```

## 🔑 API del Contexto

### Estado

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `user` | `AuthUser \| null` | Datos del usuario autenticado |
| `isAuthenticated` | `boolean` | Indica si hay un usuario autenticado |
| `isLoading` | `boolean` | Indica si está cargando el estado inicial |

### Métodos

| Método | Firma | Descripción |
|--------|-------|-------------|
| `login` | `(userData: AuthUser) => void` | Inicia sesión con los datos del usuario |
| `logout` | `() => void` | Cierra la sesión y limpia los datos |
| `getToken` | `() => string \| null` | Obtiene el token JWT |
| `getUserId` | `() => string \| null` | Obtiene el ID del usuario |
| `getEmail` | `() => string \| null` | Obtiene el email del usuario |
| `setUser` | `(user: AuthUser) => void` | Actualiza los datos del usuario |

## 💾 Estructura de Datos

### AuthUser

```typescript
interface AuthUser {
  userId: string;        // ID único del usuario (sub del JWT)
  email: string;         // Email del usuario
  firstName: string;     // Nombre
  lastName: string;      // Apellido
  phone: string;         // Teléfono
  token: string;         // Token JWT
}
```

### DecodedToken (JWT)

```typescript
interface DecodedToken {
  sub: string;           // User ID
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  type: 'access' | 'refresh';
  iat: number;          // Issued at
  exp: number;          // Expiration
}
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Login con Token

```tsx
import { useAuth } from '@/features/auth/context';
import { decodeToken, tokenToAuthUser } from '@/shared/utils/jwt';

function LoginComponent() {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    // 1. Llamar a tu API
    const response = await authService.login({ email, password });
    
    // 2. Decodificar el token
    const decoded = decodeToken(response.token);
    
    if (decoded) {
      // 3. Convertir a AuthUser y hacer login
      const authUser = tokenToAuthUser(decoded, response.token);
      login(authUser);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### Ejemplo 2: Petición Autenticada

```tsx
import { useAuth } from '@/features/auth/context';

function ProfileComponent() {
  const { getToken } = useAuth();

  const fetchProfile = async () => {
    const token = getToken();
    
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.json();
  };

  // ...
}
```

### Ejemplo 3: Ruta Protegida

```tsx
import { useAuth } from '@/features/auth/context';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### Ejemplo 4: Logout

```tsx
import { useAuth } from '@/features/auth/context';

function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Opcionalmente redirigir
    window.location.href = '/app/login';
  };

  return (
    <button onClick={handleLogout}>
      Cerrar Sesión
    </button>
  );
}
```

## 🛠️ Utilidades JWT

El módulo incluye utilidades para trabajar con tokens JWT:

```typescript
import { 
  decodeToken, 
  isTokenExpired, 
  tokenToAuthUser,
  getFullNameFromToken 
} from '@/shared/utils/jwt';

// Decodificar token
const decoded = decodeToken(token);

// Verificar si expiró
const expired = isTokenExpired(token);

// Convertir a AuthUser
const user = tokenToAuthUser(decoded, token);

// Obtener nombre completo
const fullName = getFullNameFromToken(token);
```

## 💡 Mejores Prácticas

1. **Siempre verificar `isLoading`** antes de renderizar contenido protegido
2. **Validar el token** antes de hacer login con `isTokenExpired()`
3. **Usar `useAuth` hook** en lugar de acceder directamente al contexto
4. **Manejar errores** cuando el token expire o sea inválido
5. **Limpiar datos sensibles** al hacer logout

## 🔒 Seguridad

- Los datos se almacenan en `localStorage` (considera usar `sessionStorage` para mayor seguridad)
- El token se envía en el header `Authorization: Bearer <token>`
- Verifica la expiración del token antes de hacer peticiones
- Implementa refresh token para renovar sesiones

## 🚧 Próximas Mejoras

- [ ] Implementar refresh token automático
- [ ] Agregar interceptores para peticiones HTTP
- [ ] Manejo de errores centralizado
- [ ] Persistencia opcional en sessionStorage
- [ ] Encriptación de datos en localStorage

