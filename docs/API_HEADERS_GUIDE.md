# 🔐 Guía de Headers y Autenticación en API

## 📋 Configuración Actual

### Bearer Token Automático ✅

El `apiClient` está configurado para **agregar automáticamente** el Bearer token a todas las peticiones que lo requieran.

**Ubicación:** `src/infrastructure/api/client.ts`

```typescript
// Línea 22-29
const token = localStorage.getItem('access_token');

const config: RequestInit = {
  ...options,
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  },
};
```

### Cómo Funciona

1. **Obtiene el token** del localStorage con key `access_token`
2. **Agrega el header** `Authorization: Bearer ${token}` si el token existe
3. **Se aplica automáticamente** a todos los métodos: GET, POST, PUT, DELETE

## 🔑 Endpoints que Requieren Autenticación

### 1. GET /users/me
**Descripción:** Obtiene el perfil del usuario actual

**Headers enviados automáticamente:**
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Uso:**
```typescript
import { userService } from '@/infrastructure/services';

const user = await userService.getMe();
// ✅ El Bearer token se envía automáticamente
```

**Respuesta:**
```typescript
{
  id: "uuid",
  email: "user@example.com",
  profile: {
    id: "uuid",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    address: "123 Main St",
    phone: "+1234567890",
    avatarUrl: "https://..."
  },
  lifeWheel: {
    id: "uuid",
    globalScore: 0,
    lifeAreas: [...]
  },
  createdAt: "2025-10-01T..."
}
```

---

### 2. PUT /users/update
**Descripción:** Actualiza el perfil del usuario

**Headers enviados automáticamente:**
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Uso:**
```typescript
import { userService } from '@/infrastructure/services';

const updatedUser = await userService.updateUser({
  firstName: "Jane",
  lastName: "Smith",
  phone: "+9876543210"
});
// ✅ El Bearer token se envía automáticamente
```

**Body:**
```typescript
{
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  avatarUrl?: string;
}
```

**Respuesta:** Igual que `/users/me`

---

### 3. POST /auth/login
**Descripción:** Inicia sesión

**Headers enviados:**
```typescript
{
  "Content-Type": "application/json"
  // ❌ NO envía Authorization (no es necesario)
}
```

**Uso:**
```typescript
import { authService } from '@/infrastructure/services';

const response = await authService.login({
  email: "user@example.com",
  password: "password123"
});
// response: { access_token, refresh_token }
```

---

### 4. POST /auth/logout
**Descripción:** Cierra sesión

**Headers enviados automáticamente:**
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🎯 Endpoints que NO Requieren Autenticación

### 1. POST /users/register
**Descripción:** Registra un nuevo usuario

**Headers enviados:**
```typescript
{
  "Content-Type": "application/json"
  // ❌ NO envía Authorization (no existe token aún)
}
```

---

## 🔄 Flujo de Autenticación

```
1. Usuario hace login
   ↓
   POST /auth/login { email, password }
   ↓
   Recibe: { access_token, refresh_token }
   ↓
   Se guarda en localStorage:
   - localStorage.setItem('access_token', token)
   - localStorage.setItem('refresh_token', token)

2. Peticiones subsecuentes
   ↓
   apiClient lee access_token de localStorage
   ↓
   Agrega header: Authorization: Bearer ${token}
   ↓
   Todas las peticiones incluyen el token

3. Token expirado (401)
   ↓
   apiClient detecta error 401
   ↓
   Limpia localStorage
   ↓
   (Opcional) Redirige a /login
```

---

## 🛠️ Verificar Headers en DevTools

### Network Tab

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Filtra por **Fetch/XHR**
4. Haz una petición a `/users/me`
5. Click en la petición
6. Ve a **Headers** → **Request Headers**

Deberías ver:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 🐛 Debugging

### Ver el token actual
```typescript
const token = localStorage.getItem('access_token');
console.log('Token actual:', token);
```

### Ver todos los datos de localStorage
```typescript
console.log('User ID:', localStorage.getItem('userId'));
console.log('Email:', localStorage.getItem('email'));
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));
```

### Simular petición con token
```typescript
const token = localStorage.getItem('access_token');

fetch('http://localhost:3000/api/v1/users/me', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('User data:', data))
.catch(err => console.error('Error:', err));
```

---

## ⚠️ Errores Comunes

### 1. Error 401 Unauthorized
**Causa:** Token inválido o expirado

**Solución:**
```typescript
// El apiClient limpia automáticamente en línea 54-58
if (response.status === 401) {
  localStorage.clear();
  // Redirigir a login
}
```

### 2. Token no se envía
**Causa:** No existe en localStorage

**Verificar:**
```typescript
const token = localStorage.getItem('access_token');
if (!token) {
  console.error('No hay token guardado');
  // Redirigir a login
}
```

### 3. CORS Error
**Causa:** Backend no permite el header Authorization

**Solución en Backend:**
```javascript
// Asegurar en el backend:
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 🎯 Resumen

| Endpoint | Método | Requiere Auth | Header Authorization |
|----------|--------|---------------|---------------------|
| `/users/register` | POST | ❌ No | No se envía |
| `/auth/login` | POST | ❌ No | No se envía |
| `/users/me` | GET | ✅ Sí | ✅ Automático |
| `/users/update` | PUT | ✅ Sí | ✅ Automático |
| `/auth/logout` | POST | ✅ Sí | ✅ Automático |
| `/auth/me` | GET | ✅ Sí | ✅ Automático |

**✅ Configuración Automática:**
- El `apiClient` agrega el Bearer token automáticamente
- No necesitas configurar headers manualmente
- El token se obtiene de `localStorage.getItem('access_token')`

**🔑 Formato del Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

---

## 📚 Referencias

- **API Client**: `src/infrastructure/api/client.ts`
- **User Service**: `src/infrastructure/services/userService.ts`
- **Auth Service**: `src/infrastructure/services/authService.ts`
- **Auth Context**: `src/features/auth/context/AuthContext.tsx`

