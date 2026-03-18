# Generador de Formularios (FormMaster)

Este es un proyecto de [Next.js](https://nextjs.org) diseñado para permitir la creación, gestión y visualización de formularios dinámicos, así como la recolección y análisis de sus respuestas de manera segura.

## Funcionalidades Principales

*   **Autenticación de Administrador:** Acceso restringido al panel de gestión mediante contraseña.
*   **Creación de Formularios:** Interfaz intuitiva para diseñar nuevos formularios con diferentes tipos de preguntas (texto, párrafos, opciones únicas, casillas y fechas).
*   **Gestión de Formularios (Dashboard):** Visualización de todos los formularios en formato de tarjeta o lista, con ordenamiento por título o fecha.
*   **Rutas Protegidas:** Solo los administradores autenticados pueden crear, editar, eliminar o ver resultados de los formularios.
*   **Análisis de Respuestas:** Consulta detallada de respuestas enviadas por formulario.
*   **Exportación de Resultados:** Permite descargar las respuestas en formato CSV para análisis externo.
*   **Persistencia Local:** Los datos se almacenan en archivos JSON dentro del directorio `data/`.

## Acceso de Administrador

Para gestionar los formularios, es necesario iniciar sesión en el panel de administración.

*   **Ruta de Login:** `/login` (Redirección automática desde el Dashboard).
*   **Contraseña por defecto:** `admin123`

## Tecnologías Utilizadas

*   **Framework:** [Next.js 15+](https://nextjs.org) (App Router).
*   **Estilos:** [React Bootstrap](https://react-bootstrap.github.io) & [Tailwind CSS](https://tailwindcss.com).
*   **Iconos:** [FontAwesome](https://fontawesome.com).
*   **Notificaciones:** [Sonner](https://sonner.emilkowal.ski).
*   **Utilidades:** [UUID](https://www.npmjs.com/package/uuid) para identificadores únicos.

## Empezando (Getting Started)

### 1. Instalación de Dependencias

```bash
npm install
```

### 2. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

### 3. Abrir en el Navegador

Visita [http://localhost:3000](http://localhost:3000). Serás redirigido al login para acceder al dashboard.

## Estructura del Proyecto

*   `app/`: Rutas de la aplicación.
    *   `app/login/`: Pantalla de autenticación.
    *   `app/forms/[formId]/`: Vista pública del formulario (Sin necesidad de login).
    *   `app/api/`: Endpoints para gestión de datos y respuestas.
*   `context/`: Gestión de estado global (Autenticación).
*   `components/`: Componentes reutilizables como `AppNavbar.tsx`.
*   `data/`: Almacenamiento local de formularios (`/forms`) y respuestas (`/responses`).