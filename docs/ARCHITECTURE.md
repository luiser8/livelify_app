# 🏗️ Arquitectura del Proyecto

Este proyecto sigue los principios de **Arquitectura Limpia** (Clean Architecture) adaptada para aplicaciones React/TypeScript.

## 📁 Estructura de Carpetas

```
src/
├── core/                 # 🎯 Núcleo de la aplicación (lógica de negocio)
│   ├── entities/        # Modelos de dominio y entidades
│   └── usecases/        # Casos de uso (lógica de negocio)
│
├── features/            # 🎨 Características de la aplicación (módulos)
│   └── home/
│       ├── components/  # Componentes específicos del módulo
│       ├── hooks/       # Hooks personalizados del módulo
│       └── pages/       # Páginas del módulo
│
├── shared/              # 🔧 Código compartido entre módulos
│   ├── components/      # Componentes reutilizables (Button, Input, etc.)
│   ├── hooks/          # Hooks personalizados compartidos
│   ├── types/          # Tipos TypeScript compartidos
│   └── utils/          # Funciones utilitarias
│
├── infrastructure/      # 🌐 Capa de infraestructura
│   ├── api/            # Cliente API y configuración
│   └── services/       # Servicios externos (auth, storage, etc.)
│
├── routes/             # 🛣️ Configuración de rutas
├── config/             # ⚙️ Configuraciones de la app
└── styles/             # 🎨 Estilos globales
```

## 🎯 Principios de la Arquitectura

### 1. **Separación de Responsabilidades**
Cada capa tiene una responsabilidad específica y bien definida.

### 2. **Independencia de Frameworks**
La lógica de negocio (`core/`) no depende de React o cualquier framework específico.

### 3. **Facilidad de Testing**
Cada capa puede ser testeada de forma independiente.

### 4. **Escalabilidad**
Fácil de extender con nuevas características sin afectar el código existente.

## 📚 Descripción de Capas

### 🎯 Core (Núcleo)
**Propósito**: Contiene la lógica de negocio pura, independiente de cualquier framework.

- **entities/**: Modelos de dominio con reglas de negocio
  ```typescript
  // Ejemplo: User.ts
  export class UserEntity {
    constructor(public id: string, public name: string) {}
    isValid(): boolean { /* lógica */ }
  }
  ```

- **usecases/**: Casos de uso que orquestan la lógica de negocio
  ```typescript
  // Ejemplo: loginUseCase.ts
  export const loginUseCase = async (credentials) => {
    // Lógica de autenticación
  }
  ```

### 🎨 Features (Características)
**Propósito**: Módulos de la aplicación organizados por funcionalidad.

Cada feature contiene:
- **pages/**: Páginas/vistas del módulo
- **components/**: Componentes específicos del módulo
- **hooks/**: Hooks personalizados del módulo

```
features/
└── auth/
    ├── pages/
    │   ├── LoginPage.tsx
    │   └── RegisterPage.tsx
    ├── components/
    │   └── LoginForm.tsx
    └── hooks/
        └── useAuth.ts
```

### 🔧 Shared (Compartido)
**Propósito**: Código reutilizable en toda la aplicación.

- **components/**: Componentes UI genéricos (Button, Input, Modal)
- **hooks/**: Hooks personalizados (useAsync, useLocalStorage)
- **types/**: Tipos TypeScript compartidos
- **utils/**: Funciones utilitarias (formateo, validación)

### 🌐 Infrastructure (Infraestructura)
**Propósito**: Interacción con servicios externos y APIs.

- **api/**: Cliente HTTP y configuración
- **services/**: Servicios específicos (authService, userService)

```typescript
// Ejemplo: authService.ts
export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
}
```

### 🛣️ Routes (Rutas)
**Propósito**: Configuración del enrutamiento de la aplicación.

```typescript
// AppRouter.tsx
export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  </BrowserRouter>
)
```

## 🔄 Flujo de Datos

```
User Interaction
      ↓
   Page/Component (features/)
      ↓
   Use Case (core/usecases/)
      ↓
   Service (infrastructure/services/)
      ↓
   API Client (infrastructure/api/)
      ↓
   External API
```

## 📝 Convenciones de Código

### Nomenclatura de Archivos
- **Componentes**: PascalCase (`Button.tsx`, `LoginForm.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`, `useAsync.ts`)
- **Utilities**: camelCase (`format.ts`, `validation.ts`)
- **Types**: PascalCase (`User.ts`, `ApiResponse.ts`)

### Organización de Imports
```typescript
// 1. React y librerías externas
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Core (entidades, casos de uso)
import { loginUseCase } from '@/core/usecases/auth';

// 3. Shared (componentes, hooks, utils)
import { Button } from '@/shared/components';
import { useAsync } from '@/shared/hooks';

// 4. Local (del mismo módulo)
import { LoginForm } from '../components/LoginForm';
```

### Comentarios
Usa JSDoc para documentar funciones y componentes importantes:

```typescript
/**
 * Hook personalizado para manejar autenticación
 * @returns {Object} Estado y métodos de autenticación
 */
export const useAuth = () => {
  // ...
}
```

## 🚀 Cómo Crear una Nueva Feature

1. **Crear la estructura de carpetas**:
   ```bash
   mkdir -p src/features/mi-feature/{pages,components,hooks}
   ```

2. **Crear la página**:
   ```typescript
   // src/features/mi-feature/pages/MiFeaturePage.tsx
   export const MiFeaturePage = () => {
     return <div>Mi Feature</div>
   }
   ```

3. **Exportar desde index.ts**:
   ```typescript
   // src/features/mi-feature/pages/index.ts
   export { MiFeaturePage } from './MiFeaturePage';
   ```

4. **Agregar la ruta**:
   ```typescript
   // src/routes/AppRouter.tsx
   <Route path="/mi-feature" element={<MiFeaturePage />} />
   ```

## 🧪 Testing

Cada capa debe tener sus propios tests:

- **Core**: Tests unitarios de lógica de negocio
- **Components**: Tests de componentes con React Testing Library
- **Services**: Tests de integración con mocks

## 📦 Dependencias y Herramientas

- **React 19**: Framework UI
- **TypeScript**: Tipado estático
- **React Router**: Navegación
- **Tailwind CSS v4**: Estilos
- **Vite**: Build tool

## 🎓 Recursos de Aprendizaje

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Best Practices](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**¿Preguntas?** Consulta este documento o contacta al equipo de desarrollo.

