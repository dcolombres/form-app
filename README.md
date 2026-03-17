# Generador de Formularios

Este es un proyecto de [Next.js](https://nextjs.org) inicializado con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). Su propósito principal es permitir la creación, gestión y visualización de formularios dinámicos, así como la recolección y análisis de sus respuestas.

## Funcionalidades Principales

*   **Creación de Formularios:** Interfaz intuitiva para diseñar nuevos formularios con diferentes tipos de preguntas.
*   **Gestión de Formularios:** Visualización de todos los formularios creados en formato de tarjeta o lista, con opciones de ordenamiento por título o fecha de creación.
*   **Visualización de Formularios:** Acceso a la vista pública de cada formulario para que los usuarios puedan completarlos.
*   **Análisis de Respuestas:** Consulta de las respuestas enviadas para cada formulario, con visualizaciones básicas.
*   **Eliminación de Formularios:** Funcionalidad para eliminar formularios existentes, incluyendo todas sus respuestas asociadas.
*   **Edición de Formularios:** Permite modificar el título y las preguntas de formularios existentes.
*   **Persistencia de Datos:** Los formularios y sus respuestas se almacenan localmente en archivos JSON dentro del directorio `data/`.

## Empezando (Getting Started)

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno de desarrollo local.

### 1. Clonar el Repositorio (si aplica)

Si este proyecto proviene de un repositorio Git, clónalo primero:

```bash
git clone <URL_DEL_REPOSITORIO>
cd form-app
```

### 2. Instalar Dependencias

Navega al directorio del proyecto (`form-app`) e instala las dependencias necesarias. Puedes usar `npm`, `yarn`, `pnpm` o `bun`.

```bash
cd /usr/local/var/www/Plantilla Form/form-app
npm install
# o
yarn install
# o
pnpm install
# o
bun install
```

### 3. Ejecutar el Servidor de Desarrollo

Una vez que las dependencias estén instaladas, puedes iniciar el servidor de desarrollo.

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

### 4. Abrir en el Navegador

Después de ejecutar el comando anterior, la aplicación estará disponible en tu navegador.

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación en funcionamiento.

La página se actualizará automáticamente a medida que realices cambios en el código fuente.

## Estructura del Proyecto

A continuación, se presenta una descripción de los directorios y archivos más relevantes:

*   `app/`: Contiene las rutas principales de la aplicación Next.js.
    *   `app/page.tsx`: La página de inicio que lista y gestiona los formularios.
    *   `app/layout.tsx`: El layout principal de la aplicación, incluyendo la barra de navegación.
    *   `app/api/forms/`: Rutas de API para la gestión de formularios (creación, lectura, eliminación).
    *   `app/create-form/`: Página para la creación de nuevos formularios.
    *   `app/forms/[formId]/`: Página para visualizar un formulario específico.
    *   `app/edit-form/[formId]/`: Página para editar un formulario específico.
    *   `app/results/[formId]/`: Página para ver los resultados y respuestas de un formulario.
*   `components/`: Componentes React reutilizables, como `AppNavbar.tsx`.
*   `data/`: Directorio donde se almacenan los datos de la aplicación.
    *   `data/forms/`: Archivos JSON que representan las definiciones de los formularios.
    *   `data/responses/`: Archivos JSON que almacenan las respuestas enviadas para cada formulario.
*   `public/`: Archivos estáticos como imágenes y favicons.

## Aprende Más sobre Next.js

Para obtener más información sobre Next.js, consulta los siguientes recursos:

*   [Documentación de Next.js](https://nextjs.org/docs) - Aprende sobre las características y la API de Next.js.
*   [Aprende Next.js](https://nextjs.org/learn) - Un tutorial interactivo de Next.js.

Puedes consultar el [repositorio de GitHub de Next.js](https://github.com/vercel/next.js) - ¡tus comentarios y contribuciones son bienvenidos!

## Despliegue en Vercel

La forma más sencilla de desplegar tu aplicación Next.js es utilizando la [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) de los creadores de Next.js.

Consulta nuestra [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.