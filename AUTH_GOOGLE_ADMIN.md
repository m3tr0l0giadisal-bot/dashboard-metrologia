# Login seguro con Google

## Objetivo

Quitar del frontend el correo administrador y validar el acceso administrador fuera del codigo publico.

## Flujo

1. El usuario inicia sesion con Google.
2. Google devuelve un ID token al navegador.
3. El navegador envia ese token al backend `authEndpoint`.
4. El backend valida el token contra Google.
5. El backend compara el correo validado contra una variable de entorno `ADMIN_EMAIL`.
6. El frontend recibe solamente el rol:
   - `admin`
   - `readOnly`

El correo administrador no queda publicado en GitHub.

## Archivos

- `auth-config.js`: configuracion publica del frontend.
- `auth/google-auth-worker.js`: backend ejemplo para Cloudflare Worker.

## Configuracion del frontend

Editar `auth-config.js` despues de crear Google OAuth y el Worker:

```js
window.METROLOGIA_AUTH_CONFIG = {
  googleClientId: "876259994510-4kvo2777u3v2cpi15tf3599v8jneg2ht.apps.googleusercontent.com",
  authEndpoint: "https://TU-WORKER.TU-CUENTA.workers.dev"
};
```

El `googleClientId` es publico. No es una contrasena.

## Configuracion del backend

En Cloudflare Worker configurar variables de entorno:

- `GOOGLE_CLIENT_ID`: mismo Client ID publico de Google.
- `ADMIN_EMAIL`: correo administrador. No se debe commitear.
- `ALLOWED_DOMAIN`: `grupodisal.com.ar`.

Ya queda preparado `auth/wrangler.toml.example` con el Client ID publico. Copiarlo como `auth/wrangler.toml` al desplegar el Worker.

## Google Cloud Console

Crear credencial OAuth tipo Web application.

Authorized JavaScript origins:

- `https://m3tr0l0giadisal-bot.github.io`

Authorized redirect URIs:

- No es necesario para Google Identity Services con callback en JavaScript.

## Seguridad

GitHub Pages no puede proteger rutas ni validar identidad por si solo. La seguridad real del rol administrador depende de que el backend valide el token de Google y mantenga `ADMIN_EMAIL` fuera del repositorio.
