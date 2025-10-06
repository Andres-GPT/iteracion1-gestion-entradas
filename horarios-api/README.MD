# Horarios API - Sistema de Gestión de Horarios UFPS

API desarrollada en **FastAPI** para procesar archivos PDF de horarios de la UFPS y extraer información estructurada de materias, salones y horarios.

## 🛠️ Tecnologías

- **Python 3.8+** - Lenguaje de programación
- **FastAPI** - Framework web moderno y rápido
- **pdfplumber** - Extracción de tablas desde PDF
- **Uvicorn** - Servidor ASGI

## 📦 Instalación

```bash
pip install -r requirements.txt
```

## 🚀 Ejecución

### Modo Desarrollo (con auto-reload)

```bash
uvicorn app.main:app --reload
```

### Modo Producción

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Alternativa con Python

```bash
python -m uvicorn app.main:app --reload
```

La API estará disponible en:

- **URL Base**: `http://127.0.0.1:8000`
- **Documentación Interactiva (Swagger)**: `http://127.0.0.1:8000/docs`
- **Documentación Alternativa (ReDoc)**: `http://127.0.0.1:8000/redoc`

## 📂 Estructura del Proyecto

```
horarios-api/
├── app/
│   ├── main.py          # API principal con FastAPI
│   ├── services.py      # Funciones para extraer y parsear PDF
│   └── __pycache__/     # Cache de Python (auto-generado)
│
├── requirements.txt     # Dependencias del proyecto
├── Dockerfile           # Imagen para despliegue (opcional)
├── .dockerignore        # Archivos a excluir en Docker
├── .gitignore           # Archivos ignorados en Git
└── README.md            # Este archivo
```

## 🔌 Endpoint Principal

### POST `/procesar-pdf`

Procesa un archivo PDF de horarios y devuelve un JSON estructurado.

**Request:**

```bash
curl -X POST "http://127.0.0.1:8000/procesar-pdf" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@Horarios.pdf"
```

**Response:**

```json
{
  "SA401": {
    "Lunes": [
      {
        "codigo": "1155605A",
        "codigo_p": "12345",
        "nombre": "FUNDAMENTOS DE PROGRAMACION",
        "hora": "06:00-08:00"
      }
    ],
    "Martes": [
      {
        "codigo": "1155606B",
        "codigo_p": "67890",
        "nombre": "ESTRUCTURAS DE DATOS",
        "hora": "10:00-12:00"
      }
    ]
  },
  "SA402": {
    "Miercoles": [
      {
        "codigo": "1155607C",
        "codigo_p": "11111",
        "nombre": "ALGORITMOS",
        "hora": "14:00-16:00"
      }
    ]
  }
}
```

## 📋 Formato de Respuesta

### Estructura del JSON

```typescript
{
  [codigo_salon: string]: {           // Ej: "SA401", "SA402"
    [dia_semana: string]: [           // Ej: "Lunes", "Martes"
      {
        codigo: string,               // Código de la materia + grupo (ej: "1155605A")
        codigo_p: string,             // Código del profesor
        nombre: string,               // Nombre de la materia
        hora: string                  // Rango horario (ej: "06:00-08:00")
      }
    ]
  }
}
```

### Campos Extraídos

- **`codigo`**: Código completo del curso (materia + grupo). Ejemplo: `1155605A`
  - Los primeros 7 dígitos son el código de la materia: `1155605`
  - La última letra es el código del grupo: `A`
- **`codigo_p`**: Código del profesor asignado al curso
- **`nombre`**: Nombre completo de la materia
- **`hora`**: Rango horario en formato `HH:MM-HH:MM`

## 🔍 Lógica de Filtrado

### Filtros Aplicados

La API aplica los siguientes filtros al procesar el PDF:

1. **Materias con código 115**: Solo se procesan materias cuyo código inicie con `115`
2. **Salones SA4**: Solo se consideran salones que inicien con `SA4` (Aula Sur)
3. **Días de la semana**: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado

## 🧩 Funciones Principales

### `extraer_tabla_pdf(archivo_stream)`

Extrae todas las tablas de un PDF y las convierte en una lista de filas.

```python
# Entrada: Stream del archivo PDF
# Salida: Lista de listas (filas de la tabla)
filas = extraer_tabla_pdf(archivo_stream)
```

### `parsear_materias(filas)`

Parsea las filas extraídas y organiza la información por salones y días.

```python
# Entrada: Lista de filas
# Salida: Diccionario organizado por salón → día → cursos
salones = parsear_materias(filas)
```

**Proceso:**

1. Filtra materias con código `115`
2. Itera sobre los días de la semana
3. Extrae horarios y salones usando regex
4. Filtra solo salones `SA4*`
5. Organiza y ordena por salón y día

## 🔗 Integración con el Backend

Esta API es consumida por el backend de Node.js para importar horarios:

1. El backend recibe un PDF desde el frontend
2. El backend envía el PDF a esta API (`POST /procesar-pdf`)
3. Esta API procesa el PDF y devuelve el JSON estructurado
4. El backend toma el JSON y crea registros en la base de datos:
   - **Materias**: Crea las materias si no existen
   - **Grupos**: Vincula materia + período + profesor
   - **Horarios**: Asigna horarios a grupos en salones específicos

**Flujo completo:**

```
Frontend → Backend → Horarios API → Backend → Base de Datos
```

## 📝 Notas Importantes

- **Puerto por defecto**: La API corre en el puerto `8000`
- **CORS habilitado**: La API acepta peticiones desde cualquier origen (`allow_origins=["*"]`)
- **Formato de archivo**: Solo acepta archivos `.pdf`
- **Materias filtradas**: Solo procesa materias con código `115` (departamento específico)
- **Salones filtrados**: Solo considera salones `SA4*` (Aula Sur, 4to piso)
- **Regex de horarios**: Usa el patrón `\d{2}:\d{2}-\d{2}:\d{2}` para detectar rangos horarios

## ⚙️ Dependencias (requirements.txt)

```txt
fastapi
uvicorn[standard]
pdfplumber
python-multipart
```

## 🚀 Despliegue (Opcional)

### Con Docker

```bash
docker build -t horarios-api .
docker run -p 8000:8000 horarios-api
```

### En la nube (Google Cloud Run, AWS Lambda, etc.)

La API es compatible con despliegues serverless gracias a FastAPI.
