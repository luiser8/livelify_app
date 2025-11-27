# 🔐 Sistema de Autenticación

Sistema completo de autenticación integrado con el backend en `http://localhost:3000/api/v1/auth/login`.

## 📁 Estructura

```
src/features/auth/
├── components/
│   ├── LoginForm.tsx          # Formulario de login con validación
│   └── index.ts
├── pages/
│   ├── LoginPage.tsx          # Página de login completa
│   └── index.ts
├── context/
│   ├── AuthContext.tsx        # Contexto de autenticación
│   ├── AuthContext.types.ts   # Tipos del contexto
│   ├── index.ts
│   └── README.md              # Documentación detallada
└── hooks/
    └── useAuthContext.example.tsx
```

## 🚀 Flujo de Autenticación

### 1. Usuario ingresa credenciales
El usuario llena el formulario en `LoginPage.tsx`

### 2. Validación del formulario
`LoginForm.tsx` valida:
- Email válido
- Password mínimo 6 caracteres

### 3. Llamada al backend
```typescript
// LoginPage.tsx
const { user } = await loginUseCase({ email, password });
```

### 4. LoginUseCase procesa la autenticación
```typescript
// loginUseCase.ts
1. Valida credenciales
2. Llama a authService.login()
3. authService hace POST a http://localhost:3000/api/v1/auth/login
4. Recibe el token JWT
5. Decodifica el token
6. Valida que no esté expirado
7. Convierte a AuthUser
8. Retorna { token, user }
```

### 5. Guardado en contexto
```typescript
// LoginPage.tsx
login(user); // Guarda en contexto + localStorage
```

### 6. Redirección
```typescript
navigate('/app/home');
```

## 📡 Endpoint del Backend

### POST /auth/login

**URL completa:** `http://localhost:3000/api/v1/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token JWT decodificado:**
```json
{
  "sub": "feb541b1-7f39-46e0-ba27-d0ce18b94a9e",
  "email": "yvanna@gmail.com",
  "firstName": "Yvanna",
  "lastName": "Moreno",
  "phone": "+1234567890",
  "type": "access",
  "iat": 1759331172,
  "exp": 1759334772
}
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Livelify
VITE_APP_ENV=development
```

## 📝 Uso del Contexto

### En cualquier componente:

```tsx
import { useAuth } from '@/features/auth/context';

function MyComponent() {
  const { 
    user,           // Datos del usuario
    isAuthenticated,// true si está autenticado
    isLoading,      // true mientras carga
    login,          // Función para login
    logout,         // Función para logout
    getToken        // Obtener token
  } = useAuth();

  if (isLoading) return <p>Cargando...</p>;
  
  if (!isAuthenticated) return <p>No autenticado</p>;

  return <p>Hola, {user?.firstName}!</p>;
}
```

## 🛡️ Características de Seguridad

- ✅ **Token en headers**: Se envía automáticamente en todas las peticiones
- ✅ **Validación JWT**: Decodifica y valida el token
- ✅ **Expiración**: Verifica que el token no esté expirado
- ✅ **Error 401**: Limpia automáticamente el localStorage
- ✅ **Persistencia**: Mantiene la sesión en localStorage

## 🔄 API Client

El cliente API está en `src/infrastructure/api/client.ts` y:

- Agrega automáticamente el token a las peticiones
- Maneja errores del servidor
- Limpia sesión en errores 401
- Parsea respuestas JSON

## 📦 Datos Almacenados en localStorage

```javascript
localStorage:
  - userId
  - email
  - firstName
  - lastName
  - phone
  - token
```

## 🎯 Ejemplo Completo

```tsx
// 1. Usuario llena el formulario
<LoginForm onSubmit={handleLogin} />

// 2. handleLogin procesa
const handleLogin = async (email: string, password: string) => {
  const { user } = await loginUseCase({ email, password });
  login(user);
  navigate('/app/home');
};

// 3. loginUseCase llama al backend
const response = await authService.login({ email, password });

// 4. authService hace la petición
POST http://localhost:3000/api/v1/auth/login
Body: { email, password }

// 5. Backend responde con token
{ "token": "eyJ..." }

// 6. Se decodifica y guarda
const user = tokenToAuthUser(decoded, token);
login(user); // -> AuthContext + localStorage
```

## 🐛 Debugging

### Ver llamadas al API
```javascript
// En src/infrastructure/api/client.ts
console.log('API Request:', url, config);
```

### Ver respuesta del backend
```javascript
// En src/infrastructure/services/authService.ts
console.log('Login response:', response);
```

### Ver estado del contexto
```javascript
// En cualquier componente
const auth = useAuth();
console.log('Auth state:', auth);
```

## 🔍 Solución de Problemas

### CORS Error
Si ves errores de CORS, asegúrate de que el backend permita:
```javascript
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Token inválido
Verifica que el backend esté retornando un JWT válido con la estructura esperada.

### Error de red
Verifica que el backend esté corriendo en `http://localhost:3000`

## 📚 Documentación Adicional

- **Contexto detallado**: `src/features/auth/context/README.md`
- **Guía de implementación**: `CONTEXT_AUTH_GUIDE.md` (raíz del proyecto)
- **Ejemplos de uso**: `src/features/auth/hooks/useAuthContext.example.tsx`

