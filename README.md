# Sistema de Gestión de Entradas UFPS

Sistema integral para la gestión de horarios académicos, salones, usuarios y control de acceso de la Universidad Francisco de Paula Santander.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
- **Python** (v3.8 o superior) - [Descargar](https://www.python.org/)
- **Gestor de Base de Datos MySQL**:
  - [XAMPP](https://www.apachefriends.org/) (recomendado para principiantes), o
  - [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) + [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

## 🚀 Instalación

### 1. Configurar la Base de Datos

1. Inicia tu gestor de base de datos MySQL (XAMPP o MySQL Server)
2. Importa la base de datos:
   - Abre MySQL Workbench o phpMyAdmin (si usas XAMPP)
   - Crea una nueva base de datos llamada `seminario`
   - Importa el archivo SQL de la base de datos (ubicado en la raíz del proyecto)

### 2. Configurar Variables de Entorno

Si las credenciales de tu base de datos **NO SON** las siguientes:

```
Usuario: root
Contraseña: root
Host: localhost
Puerto: 3306
```

Entonces edita el archivo `backend/.env` con tus credenciales:

```env
# Puerto del backend
PORT=4444

# Credenciales de la base de datos
DB=seminario
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=localhost

# JWT
JWT_SECRET=Ab12345678.
JWT_EXPIRATION=6h

# Email (para recuperación de contraseña)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_app

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. Instalar y Ejecutar el Proyecto

Abre el proyecto en **Visual Studio Code** y sigue estos pasos:

#### **Terminal 1: API de Procesamiento de PDF (FastAPI)**

```bash
cd horarios-api
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

✅ La API estará disponible en: `http://localhost:8000`
📖 Documentación interactiva: `http://localhost:8000/docs`

#### **Terminal 2: Backend (Node.js + Express)**

```bash
cd backend
npm i
npm run dev
```

✅ El backend estará disponible en: `http://localhost:4444`

#### **Terminal 3: Frontend (React + Vite)**

```bash
cd frontend
npm i
npm run dev
```

✅ El frontend estará disponible en: `http://localhost:3000`

## 👤 Usuario Inicial

El sistema viene con un usuario predefinido:

```
Correo: dirpro@example.com
Contraseña: 1111
Rol: Director del Programa
```

## 📖 Guía de Uso

### Paso 1: Configuración Inicial del Período Académico

1. Inicia sesión con el usuario `dirpro@example.com` (contraseña: `1111`)
2. Ve a la sección **"Períodos Académicos"**
3. Crea un nuevo período académico (ej: 2025-1)
4. **Planifica** el período
5. **Abre** el período para activarlo

### Paso 2: Crear Usuarios

Hay dos formas de crear usuarios según el rol:

#### **Opción A: Carga Masiva desde Excel** (Para Estudiantes y Profesores)

1. Ve a la sección **"Gestión de Usuarios"**
2. Selecciona la opción de carga masiva
3. Sube un archivo Excel con la información de los usuarios
4. El sistema creará automáticamente los usuarios de tipo **Estudiante** y **Profesor**

#### **Opción B: Creación Manual** (Para otros roles)

1. Ve a la sección **"Gestión de Usuarios"**
2. Crea manualmente usuarios con los siguientes roles:
   - **Vigilante**
   - **Director del Departamento**
   - **Amigo Académico**

### Paso 3: Crear Director del Departamento

1. Crea un usuario con rol **"Director del Departamento"**
2. Cierra sesión
3. Inicia sesión con las credenciales del Director del Departamento

### Paso 4: Importar Horarios desde PDF

1. Como **Director del Departamento**, ve a la sección **"Horarios"**
2. Selecciona la opción **"Importar desde PDF"**
3. Carga el archivo PDF con los horarios del departamento
4. El sistema automáticamente creará:
   - ✅ **Materias** (asignaturas)
   - ✅ **Grupos** (secciones de cada materia)
   - ✅ **Horarios** (horarios asignados a cada grupo)

> **Nota:** Los salones SA401 al SA414 ya están creados en la base de datos.

### Paso 5: Visualizar Horarios

Una vez importados los horarios, puedes visualizarlos de varias formas:

1. **Vista de Tabla**: Con filtros por salón, materia, profesor, día, etc.
2. **Vista Interactiva por Salón**: Ver la carga horaria de cada salón
3. **Vista Interactiva por Materia**: Ver todos los grupos de una materia
4. **Vista Interactiva por Profesor**: Ver la carga horaria de cada profesor

## 🔑 Recuperación de Contraseña

Para probar la funcionalidad de recuperación de contraseña:

1. Edita un usuario existente o crea uno nuevo
2. **Importante:** Asigna un **correo electrónico real** al usuario
3. Cierra sesión
4. En la pantalla de inicio de sesión, haz clic en **"¿Olvidaste tu contraseña?"**
5. Ingresa el correo electrónico del usuario
6. Recibirás un correo con un enlace para restablecer la contraseña

> **Nota:** Asegúrate de haber configurado correctamente `EMAIL_USER` y `EMAIL_PASS` en el archivo `backend/.env`

## 🏗️ Estructura del Proyecto

```
proyecto/
├── frontend/          # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Context API (Auth, Usuarios, etc.)
│   │   ├── services/      # Servicios de API
│   │   └── ...
│   └── package.json
│
├── backend/           # API Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # Controladores de rutas
│   │   ├── models/        # Modelos Sequelize
│   │   ├── routes/        # Definición de rutas
│   │   ├── services/      # Lógica de negocio
│   │   └── ...
│   └── package.json
│
└── horarios-api/      # API Python FastAPI (procesamiento de PDF)
    ├── app/
    │   ├── main.py        # Endpoint principal
    │   └── services.py    # Lógica de extracción de PDF
    └── requirements.txt
```

## 📝 Roles del Sistema

El sistema maneja los siguientes roles de usuario:

1. **Director del Programa** - Gestión completa del sistema
2. **Director del Departamento** - Gestión de horarios y salones
3. **Profesor** - Consulta de horarios propios
4. **Amigo Académico** - Asistencia académica
5. **Estudiante** - Consulta de horarios
6. **Visitante** - Acceso limitado
7. **Vigilante** - Control de acceso a salones
