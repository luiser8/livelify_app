# 🌍 Sistema de Internacionalización (i18n)

Sistema completo de internacionalización implementado con **i18next** y **react-i18next** para soporte de múltiples idiomas (Español/Inglés).

## 📁 Estructura

```
src/i18n/
├── config.ts           # Configuración de i18next
├── locales/
│   ├── en.json        # Traducciones en inglés
│   └── es.json        # Traducciones en español
└── README.md          # Este archivo
```

## 🚀 Características Implementadas

✅ **Detección automática de idioma** del navegador  
✅ **Persistencia en localStorage** del idioma seleccionado  
✅ **Selector de idioma** (componente `LanguageSelector`)  
✅ **Traducciones dinámicas** con interpolación de variables  
✅ **Estructura organizada** por features/módulos  

## 🎯 Uso Básico

### 1. En componentes React

```tsx
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
};
```

### 2. Con interpolación de variables

```tsx
// En el componente
<p>{t('home.assessmentInfo.description', { 
  min: '4',
  max: '6',
  time: '10'
})}</p>

// En el archivo de traducción (es.json)
{
  "home": {
    "assessmentInfo": {
      "description": "La mayoría comienza con {{min}}-{{max}}. Toma {{time}} minutos."
    }
  }
}
```

### 3. Cambiar idioma programáticamente

```tsx
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { i18n } = useTranslation();
  
  const changeToSpanish = () => {
    i18n.changeLanguage('es');
  };
  
  const changeToEnglish = () => {
    i18n.changeLanguage('en');
  };
};
```

## 📝 Estructura de Traducciones

Las traducciones están organizadas por módulos/features:

```json
{
  "common": {
    "back": "Volver",
    "loading": "Cargando...",
    "save": "Guardar"
  },
  "nav": {
    "home": "Inicio",
    "dashboard": "Panel"
  },
  "auth": {
    "login": {
      "title": "Bienvenido",
      "email": "Correo"
    }
  },
  "home": {
    "title": "Rueda de la Vida"
  }
}
```

## 🔧 Componentes Convertidos

Los siguientes componentes ya están usando traducciones:

- ✅ **OnboardingPage** - Página de bienvenida
- ✅ **LoginPage** - Página de login
- ✅ **LoginForm** - Formulario de login
- ✅ **HomePage** - Página principal (parcial)
- ✅ **LanguageSelector** - Selector de idioma

## 📋 Cómo Traducir Más Componentes

### Paso 1: Agregar traducciones a los archivos JSON

**src/i18n/locales/es.json:**
```json
{
  "projects": {
    "title": "Proyectos",
    "createNew": "Crear Nuevo Proyecto",
    "description": "Descripción"
  }
}
```

**src/i18n/locales/en.json:**
```json
{
  "projects": {
    "title": "Projects",
    "createNew": "Create New Project",
    "description": "Description"
  }
}
```

### Paso 2: Usar en el componente

```tsx
import { useTranslation } from 'react-i18next';

export const ProjectsPage = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('projects.title')}</h1>
      <button>{t('projects.createNew')}</button>
    </div>
  );
};
```

## 🎨 Componente LanguageSelector

El selector de idioma está disponible para usar en cualquier parte:

```tsx
import { LanguageSelector } from '@/shared/components';

export const MyPage = () => {
  return (
    <div>
      <LanguageSelector />
      {/* resto del contenido */}
    </div>
  );
};
```

**Ubicaciones recomendadas:**
- Header de navegación
- Páginas de auth (login, register)
- Settings/Profile
- Onboarding

## 📦 Archivos Pendientes de Traducir

Los siguientes archivos aún tienen texto hardcodeado:

### Alta prioridad:
- [ ] `RegisterPage.tsx` y `RegisterForm.tsx`
- [ ] `AssessmentIntroPage.tsx`
- [ ] `AssessmentQuestionsPage.tsx`
- [ ] `DashboardPage.tsx`

### Media prioridad:
- [ ] `ProjectsPage.tsx`
- [ ] `AreaProjectsPage.tsx`
- [ ] `CreateProjectPage.tsx`
- [ ] `ProjectGoalsPage.tsx`
- [ ] `ActionsPage.tsx`

### Baja prioridad:
- [ ] `ProfilePage.tsx`
- [ ] `SubscriptionPage.tsx`
- [ ] Componentes compartidos (Input, Button, etc.)
- [ ] Mensajes de error en servicios

## 🛠️ Mantenimiento

### Agregar un nuevo idioma

1. Crear archivo `src/i18n/locales/fr.json` (por ejemplo, francés)
2. Copiar estructura de `es.json` o `en.json`
3. Traducir todas las keys
4. Agregar a `config.ts`:

```ts
import translationFR from './locales/fr.json';

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  fr: { translation: translationFR }, // Nuevo
};
```

5. Actualizar `LanguageSelector` para incluir el botón FR

### Verificar traducciones faltantes

Puedes activar el modo debug en `config.ts`:

```ts
i18n.init({
  // ...
  debug: true, // Muestra advertencias en consola
});
```

## 💡 Mejores Prácticas

1. **Organiza las keys por feature/módulo**
   ```json
   {
     "auth": { "login": {...}, "register": {...} },
     "home": {...},
     "projects": {...}
   }
   ```

2. **Usa nombres descriptivos**
   ❌ `"text1": "Hello"`  
   ✅ `"welcomeMessage": "Hello"`

3. **Agrupa traducciones relacionadas**
   ```json
   {
     "form": {
       "email": "Email",
       "emailPlaceholder": "your@email.com",
       "emailError": "Invalid email"
     }
   }
   ```

4. **Usa interpolación para valores dinámicos**
   ```json
   {
     "greeting": "Hello, {{name}}!"
   }
   ```

5. **Mantén consistencia entre idiomas**
   - Usa la misma estructura de keys
   - Revisa que no falten traducciones

## 🐛 Troubleshooting

### El texto no cambia al cambiar idioma
- Verifica que estés usando `{t('key')}` en lugar de string hardcodeado
- Asegúrate de que la key existe en ambos archivos JSON
- Revisa la consola por errores de i18next

### Texto aparece como "auth.login.title"
- La key no existe en el archivo de traducción
- Verifica el path completo de la key
- Revisa typos en el nombre de la key

### El idioma no persiste al recargar
- Verifica que `i18next-browser-languagedetector` esté instalado
- Revisa la configuración de `detection.caches` en `config.ts`

## 📚 Recursos

- [Documentación oficial de i18next](https://www.i18next.com/)
- [Documentación de react-i18next](https://react.i18next.com/)
- [Language Detector](https://github.com/i18next/i18next-browser-languageDetector)

---

**Última actualización:** 2025-10-06  
**Status:** ✅ Sistema implementado - Traducción en progreso

