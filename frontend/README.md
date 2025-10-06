# Frontend - Sistema de Gestión Entradas UFPS

Aplicación web frontend construida con React + TypeScript + Vite para el sistema de gestión de horarios y salones de la UFPS.

## 🛠️ Tecnologías

- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Radix UI** - Componentes de UI accesibles
- **Tailwind CSS** - Framework de CSS
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **React Hot Toast / Sonner** - Notificaciones
- **Recharts** - Gráficas y visualizaciones
- **Lucide React** - Iconos

## 📦 Instalación

```bash
npm install
```

## 🚀 Ejecución

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Build de Producción

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`

### Vista Previa de Build

```bash
npm run preview
```

## 📂 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes de UI reutilizables (Radix UI)
│   │   ├── figma/          # Componentes exportados de Figma
│   │   ├── DirectorDashboard.tsx
│   │   ├── DepartmentDirectorDashboard.tsx
│   │   ├── AcademicAssistantDashboard.tsx
│   │   ├── GuardDashboard.tsx
│   │   ├── ProfessorDashboard.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── PasswordRecoveryScreen.tsx
│   │   ├── ResetPasswordScreen.tsx
│   │   ├── UserManagementScreen.tsx
│   │   ├── ClassroomManagementScreen.tsx
│   │   ├── ScheduleManagementScreen.tsx
│   │   └── ...
│   │
│   ├── contexts/            # Context API
│   │   ├── AuthContext.tsx         # Autenticación y usuario
│   │   ├── UsuariosContext.tsx     # Gestión de usuarios
│   │   ├── SalonesContext.tsx      # Gestión de salones
│   │   └── PeriodosContext.tsx     # Períodos académicos
│   │
│   ├── services/            # Servicios de API
│   │   ├── authService.ts          # Autenticación
│   │   ├── salonService.ts         # Salones
│   │   └── periodoService.ts       # Períodos académicos
│   │
│   ├── config/              # Configuración
│   │   └── axios.ts                # Instancia de Axios
│   │
│   ├── styles/              # Estilos globales
│   │   └── globals.css
│   │
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos base
│
├── public/                  # Archivos estáticos
├── index.html              # HTML principal
├── vite.config.ts          # Configuración de Vite
├── tailwind.config.js      # Configuración de Tailwind
├── tsconfig.json           # Configuración de TypeScript
└── package.json
```

## ⚙️ Configuración

### Variables de Entorno

El frontend se conecta al backend a través de la configuración de Axios en `src/config/axios.ts`:

```typescript
export const api = axios.create({
  baseURL: "http://localhost:4444", // URL del backend
});
```

Si necesitas cambiar la URL del backend, edita este archivo.

### Alias de Importación

El proyecto está configurado con el alias `@` para importaciones absolutas:

```typescript
import { Button } from "@/components/ui/button";
```

## 🎨 Sistema de Diseño

El frontend utiliza **Radix UI** para componentes accesibles y **Tailwind CSS** para estilos. Los componentes base están en `src/components/ui/`.

### Componentes UI Disponibles

- `accordion` - Acordeones
- `alert` - Alertas
- `alert-dialog` - Diálogos de alerta
- `avatar` - Avatares
- `badge` - Insignias
- `button` - Botones
- `card` - Tarjetas
- `checkbox` - Checkboxes
- `dialog` - Diálogos
- `dropdown-menu` - Menús desplegables
- `form` - Formularios
- `input` - Inputs
- `label` - Etiquetas
- `select` - Selectores
- `table` - Tablas
- `tabs` - Pestañas
- `toast` / `sonner` - Notificaciones
- Y más...

## 🔐 Autenticación

El sistema de autenticación se maneja mediante:

1. **AuthContext** (`src/contexts/AuthContext.tsx`):

   - Gestiona el estado del usuario autenticado
   - Almacena el token JWT en `localStorage`
   - Provee métodos `login()` y `logout()`

2. **Interceptor de Axios** (`src/config/axios.ts`):
   - Añade automáticamente el token JWT a todas las peticiones
   - Maneja errores de autenticación (401)

### Uso del AuthContext

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MiComponente() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // ...
}
```

## 📱 Roles y Navegación

El sistema soporta los siguientes roles:

1. **Director del Programa** → `DirectorDashboard`
2. **Director del Departamento** → `DepartmentDirectorDashboard`
3. **Profesor** → `ProfessorDashboard`
4. **Amigo Académico** → `AcademicAssistantDashboard`
5. **Estudiante** → `ProfessorDashboard` (mismo dashboard)
6. **Visitante** → `ProfessorDashboard` (mismo dashboard)
7. **Vigilante** → `GuardDashboard`

El mapeo de roles se realiza en `App.tsx` mediante el objeto `roleMapping`.

### Navegación

El sistema usa **navegación hash-based**:

- Rutas: `#/reset-password/{token}`
- Estado de pantalla: Variable `currentScreen` en `App.tsx`

## 🧩 Context Providers

Los providers están anidados en `App.tsx` en el siguiente orden:

```tsx
<AuthProvider>
  <UsuariosProvider>
    <SalonesProvider>
      <PeriodosProvider>
        <AppContent />
      </PeriodosProvider>
    </SalonesProvider>
  </UsuariosProvider>
</AuthProvider>
```

## 🔄 Servicios de API

### authService.ts

```typescript
login(credentials) - Iniciar sesión
logout() - Cerrar sesión
forgotPassword(email) - Solicitar recuperación de contraseña
resetPassword(token, password) - Restablecer contraseña
```

### salonService.ts

```typescript
getSalones() - Obtener todos los salones
createSalon(data) - Crear salón
updateSalon(id, data) - Actualizar salón
deleteSalon(id) - Eliminar salón
```

### periodoService.ts

```typescript
getPeriodos() - Obtener períodos académicos
createPeriodo(data) - Crear período
updatePeriodo(id, data) - Actualizar período
```

## 🎯 Características Principales

### 1. Gestión de Usuarios

- Carga masiva desde Excel (Estudiantes y Profesores)
- Creación manual (otros roles)
- Edición y eliminación

### 2. Gestión de Horarios

- Importación desde PDF
- Vista de tabla con filtros
- Vista interactiva por Salón
- Vista interactiva por Materia
- Vista interactiva por Profesor

### 3. Gestión de Salones

- CRUD completo de salones
- Visualización de disponibilidad

### 4. Períodos Académicos

- Crear, planificar y abrir períodos
- Gestión de estados (planificado, abierto, cerrado)

### 5. Recuperación de Contraseña

- Envío de correo con token
- Restablecimiento seguro

## 📝 Notas Importantes

- El frontend asume que el backend está corriendo en `http://localhost:4444`
- El token JWT se almacena en `localStorage` con la clave `"token"`
- Los datos del usuario se almacenan en `localStorage` con la clave `"user"`
- Las notificaciones usan `react-hot-toast` por defecto
- El servidor de desarrollo de Vite corre en el puerto **3000** (configurable en `vite.config.ts`)
