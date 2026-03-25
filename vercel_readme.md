# Despliegue en Vercel

Este documento proporciona instrucciones detalladas para desplegar tu aplicación Next.js en Vercel.

## 1. Crear una Cuenta en Vercel

1.  Ve a [vercel.com](https://vercel.com/).
2.  Regístrate usando tu cuenta de GitHub. Esto facilitará la integración con tu repositorio y el despliegue continuo.

## 2. Instalar Vercel CLI (Opcional, pero Recomendado)

La interfaz de línea de comandos (CLI) de Vercel te da más control sobre tus despliegues y te permite interactuar con Vercel desde tu terminal.

1.  Abre tu terminal y ejecuta el siguiente comando para instalar la CLI de Vercel globalmente:
    ```bash
    npm install -g vercel
    ```
2.  Una vez instalada, inicia sesión en Vercel desde tu terminal:
    ```bash
    vercel login
    ```
    Se abrirá una ventana en tu navegador para que completes el proceso de inicio de sesión.

## 3. Vincular tu Proyecto a Vercel

1.  Navega al directorio raíz de tu proyecto en la terminal:
    ```bash
    cd /usr/local/var/www/Plantilla Form/form-app/
    ```
2.  Ejecuta el comando para vincular tu proyecto a Vercel:
    ```bash
    vercel link
    ```
3.  Sigue las indicaciones en la terminal:
    *   "Set up and deploy “/usr/local/var/www/Plantilla Form/form-app”?" -> Escribe `Y` y presiona Enter.
    *   "Which scope do you want to deploy to?" -> Elige tu cuenta personal (o la organización si aplica).
    *   "Link to existing project?" -> Escribe `N` (a menos que ya hayas creado un proyecto en Vercel para este repositorio).
    *   "What's your project's name?" -> Introduce un nombre para tu proyecto (ej: `form-app`).
    *   "In which directory is your code located?" -> Escribe `.` (un punto) y presiona Enter, ya que tu código está en el directorio actual.

## 4. Desplegar tu Proyecto

1.  Una vez que tu proyecto esté vinculado, puedes desplegarlo directamente desde la terminal:
    ```bash
    vercel
    ```
2.  Vercel detectará automáticamente que es un proyecto Next.js y configurará los ajustes de compilación necesarios.
3.  El proceso de despliegue tomará unos minutos. Una vez completado, Vercel te proporcionará una URL donde tu aplicación estará en vivo.

## 5. Despliegue Continuo (Recomendado)

Dado que te registraste con GitHub, Vercel configurará automáticamente el despliegue continuo. Esto significa que cada vez que hagas un `git push` a tu rama `main` (o la rama que tengas configurada para producción), Vercel compilará y desplegará automáticamente la nueva versión de tu aplicación.

---

### **¡Advertencia Importante sobre la Persistencia de Datos!**

Tu aplicación actual guarda las definiciones de los formularios y sus respuestas en archivos JSON dentro de los directorios `data/forms/` y `data/responses/` en el sistema de archivos del servidor.

**Vercel (y otras plataformas serverless) utilizan un sistema de archivos efímero.** Esto significa que:

*   **Cualquier formulario que crees o respuesta que envíes después del despliegue se guardará temporalmente, pero se perderá** cuando Vercel reconstruya tu aplicación (por ejemplo, en un nuevo despliegue, o si la función serverless se reinicia por inactividad).
*   **Los datos no serán persistentes.**

**Para tener datos persistentes en Vercel, necesitas usar una base de datos externa.**

Si deseas que los formularios y las respuestas se guarden de forma permanente, sería necesario modificar la aplicación para que utilice una base de datos (como PostgreSQL, MongoDB, etc.) en lugar de archivos JSON locales. Esto implicaría un cambio significativo en la arquitectura de tu aplicación.

Por ahora, puedes desplegarla para verla funcionar, pero ten en cuenta esta limitación crucial sobre la persistencia de los datos.
