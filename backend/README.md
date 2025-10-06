# Backend - Sistema de Gestión de Horarios UFPS

API REST construida con Node.js, Express y TypeScript para el sistema de gestión de horarios y salones de la UFPS.

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **Sequelize** - ORM para MySQL
- **MySQL** - Base de datos
- **JWT** - Autenticación con tokens
- **Bcrypt** - Encriptación de contraseñas
- **Multer** - Manejo de archivos
- **Nodemailer** - Envío de correos
- **Axios** - Cliente HTTP (para API externa de PDF)
- **Morgan** - Logger de peticiones HTTP

## 📦 Instalación

```bash
npm install
```

## 🚀 Ejecución

### Modo Desarrollo (con auto-reload)

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:4444`

### Build de Producción

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`

### Ejecutar Build

```bash
npm start
```

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/         # Controladores de rutas
│   │   ├── authController.ts
│   │   ├── usuariosController.ts
│   │   ├── salonesController.ts
│   │   ├── horariosController.ts
│   │   ├── gruposController.ts
│   │   └── periodosController.ts
│   │
│   ├── models/              # Modelos Sequelize
│   │   ├── Usuario.ts
│   │   ├── Rol.ts
│   │   ├── salones.model.ts
│   │   ├── horarios.model.ts
│   │   ├── materias.model.ts
│   │   ├── grupos.model.ts
│   │   └── periodos_academicos.ts
│   │
│   ├── routes/              # Definición de rutas
│   │   ├── authRoutes.ts
│   │   ├── usuariosRoutes.ts
│   │   ├── salonesRoutes.ts
│   │   ├── horariosRoutes.ts
│   │   ├── gruposRoutes.ts
│   │   └── periodosRoutes.ts
│   │
│   ├── services/            # Lógica de negocio
│   │   └── scheduleProcessor.ts   # Procesamiento de horarios desde PDF
│   │
│   ├── middlewares/         # Middlewares
│   │   └── authMiddleware.ts      # Autenticación JWT
│   │
│   ├── validators/          # Validadores
│   │   └── auth.validator.ts
│   │
│   ├── types/               # Tipos TypeScript
│   │   ├── auth.types.ts
│   │   ├── usuarios.types.ts
│   │   ├── salones.types.ts
│   │   └── periodos.types.ts
│   │
│   ├── utils/               # Utilidades
│   │   ├── jwt.ts                 # Generación y verificación de JWT
│   │   ├── sendEmail.ts           # Envío de correos
│   │   └── emailTemplates.ts      # Plantillas de correo
│   │
│   ├── config/              # Configuración
│   │   └── multer.ts              # Configuración de subida de archivos
│   │
│   ├── db/                  # Conexión a base de datos
│   │   └── db.ts
│   │
│   └── index.ts             # Punto de entrada
│
├── uploads/                 # Archivos subidos (temporal)
├── .env                     # Variables de entorno
├── tsconfig.json           # Configuración de TypeScript
└── package.json
```

## ⚙️ Configuración

### Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del backend con las siguientes variables:

```env
# Puerto del servidor
PORT=4444

# Base de datos MySQL
DB=seminario
DB_USERNAME=root
DB_PASSWORD=root
DB_HOST=localhost

# JWT
JWT_SECRET=Ab12345678.
JWT_EXPIRATION=6h

# Email (para recuperación de contraseña)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_app

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Base de Datos

### Modelos y Relaciones

#### Usuario

- **PK**: `cedula` (string)
- Campos: `codigo`, `nombre`, `correo`, `telefono`, `password_hash`, `token_recuperacion`, `estado`
- **FK**: `id_rol` → `Rol`

#### Rol

- **PK**: `id_rol` (auto-increment)
- Valores: Director Programa, Director Departamento, Profesor, Amigo Académico, Estudiante, Visitante, Vigilante

#### Salon

- **PK**: `id_salon` (auto-increment)
- Campos: `codigo`, `nombre`, `capacidad`, `estado`

#### Materia

- **PK**: `id_materia` (auto-increment)
- Campos: `codigo`, `nombre`

#### PeriodoAcademico

- **PK**: `id_periodo` (auto-increment)
- Campos: `codigo`, `estado` (planificado, abierto, cerrado)

#### Grupo

- **PK**: `id_grupo` (auto-increment)
- **FK**: `id_materia` → `Materia`
- **FK**: `id_periodo` → `PeriodoAcademico`
- **FK**: `id_profesor` → `Usuario.cedula`
- Campos: `codigo_grupo`

#### Horario

- **PK**: `id_horario` (auto-increment)
- **FK**: `id_grupo` → `Grupo`
- **FK**: `id_salon` → `Salon`
- Campos: `dia_semana`, `hora_inicio`, `hora_fin`

### Conexión

La conexión a MySQL se configura en `src/db/db.ts` usando Sequelize:

```typescript
const sequelize = new Sequelize(
  process.env.DB,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    define: { timestamps: false },
  }
);
```

## 🛣️ API Routes

### Autenticación (`/api/auth`)

```
POST   /api/auth/register              - Registrar usuario
POST   /api/auth/login                 - Iniciar sesión
POST   /api/auth/logout                - Cerrar sesión (requiere auth)
POST   /api/auth/forgot-password       - Solicitar recuperación de contraseña
GET    /api/auth/verify-reset-token/:token - Verificar token de recuperación
POST   /api/auth/reset-password        - Restablecer contraseña
```

### Usuarios (`/usuarios`)

```
GET    /usuarios                       - Obtener todos los usuarios
GET    /usuarios/:cedula               - Obtener usuario por cédula
POST   /usuarios                       - Crear usuario
PUT    /usuarios/:cedula               - Actualizar usuario
DELETE /usuarios/:cedula               - Eliminar usuario
POST   /usuarios/bulk-upload           - Carga masiva desde Excel
```

### Salones (`/salones`)

```
GET    /salones                        - Obtener todos los salones
GET    /salones/:id                    - Obtener salón por ID
POST   /salones                        - Crear salón
PUT    /salones/:id                    - Actualizar salón
DELETE /salones/:id                    - Eliminar salón
```

### Horarios (`/horarios`)

```
GET    /horarios                       - Obtener todos los horarios
POST   /horarios                       - Crear horario manual
PUT    /horarios/:id                   - Actualizar horario
DELETE /horarios/:id                   - Eliminar horario
POST   /horarios/import                - Importar horarios desde PDF
GET    /horarios/salon/:id/disponibilidad - Verificar disponibilidad de salón
GET    /horarios/profesor/:cedula/disponibilidad - Verificar disponibilidad de profesor
```

### Grupos (`/grupos`)

```
GET    /grupos                         - Obtener todos los grupos
GET    /grupos/:id                     - Obtener grupo por ID
POST   /grupos                         - Crear grupo
PUT    /grupos/:id                     - Actualizar grupo
DELETE /grupos/:id                     - Eliminar grupo
```

### Períodos Académicos (`/periodos`)

```
GET    /periodos                       - Obtener todos los períodos
GET    /periodos/:id                   - Obtener período por ID
POST   /periodos                       - Crear período
PUT    /periodos/:id                   - Actualizar período
DELETE /periodos/:id                   - Eliminar período
```

## 🔐 Autenticación y Autorización

### JWT (JSON Web Tokens)

El sistema usa JWT para autenticación:

1. **Login**: El usuario envía credenciales → el backend devuelve un token JWT
2. **Requests**: El cliente envía el token en el header `Authorization: Bearer {token}`
3. **Middleware**: `authenticateToken` verifica el token antes de permitir acceso

#### Estructura del Token

```typescript
interface TokenPayload {
  cedula: string;
  rol: string;
}
```

#### Uso del Middleware

```typescript
import { authenticateToken } from "./middlewares/authMiddleware";

router.get("/ruta-protegida", authenticateToken, controller);
```

### Encriptación de Contraseñas

Las contraseñas se encriptan con **bcrypt** antes de guardarse en la BD:

```typescript
import bcrypt from "bcrypt";

const hashedPassword = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(password, hashedPassword);
```

## 📄 Importación de Horarios desde PDF

### Flujo de Trabajo

1. El usuario sube un PDF de horarios
2. El backend guarda el archivo temporalmente en `uploads/`
3. El backend envía el PDF a la **API externa de FastAPI** (`http://localhost:8000/procesar-pdf`)
4. La API externa devuelve un JSON estructurado con los horarios
5. El backend procesa el JSON y crea:
   - **Materias** (si no existen)
   - **Grupos** (vinculados a materia, período y profesor)
   - **Horarios** (vinculados a grupo y salón)
6. Se eliminan duplicados verificando registros existentes

### Código de Procesamiento

El procesamiento se maneja en `src/services/scheduleProcessor.ts`:

```typescript
// Llamar a la API externa
const scheduleData = await callScheduleAPI(filePath);

// Procesar el JSON y poblar la BD
const result = await processScheduleData(scheduleData);
```

### Formato del PDF

El PDF debe contener:

- Códigos de curso que inicien con `115` (ej: `1155605A`)
- Códigos de profesor (columna 4)
- Salones que inicien con `SA4` (ej: `SA401`, `SA414`)
- Horarios en formato `HH:MM-HH:MM` (ej: `06:00-08:00`)

## 📧 Envío de Correos

El sistema usa **Nodemailer** para enviar correos de recuperación de contraseña.

### Configuración en `src/utils/sendEmail.ts`

```typescript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Plantillas de Correo

Las plantillas HTML están en `src/utils/emailTemplates.ts`.

## 📤 Manejo de Archivos

El backend usa **Multer** para subir archivos.

### Configuraciones en `src/config/multer.ts`

1. **Excel** (`.xlsx`, `.xls`):

   - Límite: 5MB
   - Uso: Carga masiva de usuarios

2. **PDF** (`.pdf`):
   - Límite: 10MB
   - Uso: Importación de horarios

Los archivos se guardan temporalmente en `uploads/` y se eliminan después de procesarse.

## ⚠️ Validación de Conflictos

### Conflictos de Salones

Verifica si un salón está ocupado en un horario específico:

```typescript
GET /horarios/salon/:id/disponibilidad?dia=Lunes&hora_inicio=08:00:00&hora_fin=10:00:00&id_periodo=1
```

### Conflictos de Profesores

Verifica si un profesor tiene otro horario asignado:

```typescript
GET /horarios/profesor/:cedula/disponibilidad?dia=Lunes&hora_inicio=08:00:00&hora_fin=10:00:00&id_periodo=1
```

### Lógica de Traslape

```typescript
// Hay traslape si: (inicio1 < fin2) && (inicio2 < fin1)
const hayConflicto = inicio1 < fin2 && inicio2 < fin1;
```

## 🔗 Integración con FastAPI

El backend depende de la **API de FastAPI** para procesar PDFs:

- URL: `http://localhost:8000/procesar-pdf`
- Endpoint: `POST /procesar-pdf`
- Input: Archivo PDF
- Output: JSON con horarios organizados por salón

**Importante**: La API de FastAPI debe estar corriendo antes de importar horarios.
