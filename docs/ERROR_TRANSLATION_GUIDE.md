# Sistema de Traducción de Errores HTTP

Este documento explica cómo funciona el sistema de traducción automática de errores HTTP en la aplicación.

## 📋 Descripción General

El sistema intercepta errores del servidor (en inglés) y los traduce automáticamente al idioma seleccionado por el usuario (inglés o español).

## 🎯 Errores Soportados

### Errores de Autenticación
- `Invalid credentials` → "Correo o contraseña inválidos" / "Invalid email or password"
- `User not found` → "Usuario no encontrado" / "User not found"
- `Token expired` → "Tu sesión ha expirado" / "Your session has expired"
- `Email already exists` → "Este correo ya está registrado" / "This email is already registered"

### Errores de Red
- `Failed to fetch` → "No se pudo conectar al servidor. Verifica tu conexión a internet." / "Unable to connect to the server. Please check your internet connection."
- `Network error` → Traduce igual que "Failed to fetch"
- `Timeout` → "La solicitud tomó demasiado tiempo" / "The request took too long"

### Errores HTTP (por código de estado)
- `400` Bad Request → "Solicitud inválida. Verifica tus datos." / "Invalid request. Please check your data."
- `401` Unauthorized → "Autenticación requerida. Inicia sesión." / "Authentication required. Please log in."
- `403` Forbidden → "Acceso denegado." / "Access denied."
- `404` Not Found → "El recurso no fue encontrado." / "The requested resource was not found."
- `500` Internal Server Error → "Error del servidor. Intenta más tarde." / "Server error. Please try again later."
- `503` Service Unavailable → "Servicio temporalmente no disponible." / "Service temporarily unavailable."

## 🔧 Uso

### En cualquier componente o página:

```typescript
import { translateError } from '@/shared/utils';
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  const [error, setError] = useState<string>('');

  const handleRequest = async () => {
    try {
      await someApiCall();
    } catch (error) {
      // Traduce automáticamente el error
      const translatedError = translateError(error, t);
      setError(translatedError);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

## 📝 Funciones Disponibles

### `translateError(error, t)`
Traduce cualquier error al idioma actual del usuario.

**Parámetros:**
- `error`: Error del servidor (puede ser string, Error object, o ApiError)
- `t`: Función de traducción de i18next

**Retorna:** Mensaje de error traducido (string)

### `translateHttpStatus(statusCode, t)`
Traduce un código de estado HTTP específico.

**Parámetros:**
- `statusCode`: Código HTTP (número)
- `t`: Función de traducción de i18next

**Retorna:** Mensaje traducido del código de estado

### `isNetworkError(error)`
Verifica si un error es de red/conexión.

**Parámetros:**
- `error`: Error a verificar

**Retorna:** `true` si es un error de red, `false` en caso contrario

## 🌍 Agregar Nuevas Traducciones

### 1. Agregar a `errorTranslator.ts`:

```typescript
const errorMap: Record<string, string> = {
  // ... errores existentes
  'nuevo error del servidor': 'errors.miCategoria.nuevoError',
};
```

### 2. Agregar traducciones en `en.json`:

```json
{
  "errors": {
    "miCategoria": {
      "nuevoError": "My new error message in English"
    }
  }
}
```

### 3. Agregar traducciones en `es.json`:

```json
{
  "errors": {
    "miCategoria": {
      "nuevoError": "Mi nuevo mensaje de error en español"
    }
  }
}
```

## 🎨 Ejemplos de Uso

### Login con traducción de errores:

```typescript
// LoginPage.tsx
try {
  await loginUseCase({ email, password });
} catch (error) {
  const translatedError = translateError(error, t);
  setError(translatedError);
}
```

**Resultado:**
- Error del servidor: `"Invalid credentials"`
- Usuario ve (ES): `"Correo o contraseña inválidos"`
- Usuario ve (EN): `"Invalid email or password"`

### Registro con traducción de errores:

```typescript
// RegisterPage.tsx
try {
  await registerUseCase(formData);
} catch (error) {
  const translatedError = translateError(error, t);
  setError(translatedError);
}
```

**Resultado:**
- Error del servidor: `"Email already exists"`
- Usuario ve (ES): `"Este correo ya está registrado"`
- Usuario ve (EN): `"This email is already registered"`

## 🔍 Comportamiento

1. **Búsqueda por Texto:** Busca coincidencias parciales en el mensaje de error
2. **Búsqueda por Código HTTP:** Si encuentra un código de estado, lo traduce
3. **Fallback Inteligente:** Si no encuentra traducción, detecta si el mensaje es técnico:
   - Mensaje técnico → Muestra error genérico traducido
   - Mensaje legible → Muestra el mensaje original

## ✅ Implementado en:

- ✅ **LoginPage** - Errores de autenticación
- ✅ **RegisterPage** - Errores de registro
- ⚠️ **Otros componentes** - Pueden usar `translateError()` según sea necesario

## 🚀 Próximos Pasos

Para aplicar el traductor en otras partes de la app:

1. Importar `translateError` de `@/shared/utils`
2. Usar en el `catch` block de cualquier llamada a API
3. Pasar el error y la función `t` de `useTranslation()`
4. Mostrar el mensaje traducido al usuario

¡Eso es todo! El sistema maneja automáticamente la detección y traducción de errores. 🎉

