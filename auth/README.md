# Backend de autenticacion Google

Este Worker valida el token de Google y devuelve al dashboard un rol seguro:

- `admin`
- `readOnly`

El correo administrador se configura como secreto del Worker y no queda publicado en GitHub.

## Archivos

- `google-auth-worker.js`: codigo del Worker.
- `wrangler.toml.example`: configuracion base para Cloudflare Workers.

## Configuracion

1. Copiar `wrangler.toml.example` a `wrangler.toml`.
2. Mantener:
   - `GOOGLE_CLIENT_ID = "876259994510-4kvo2777u3v2cpi15tf3599v8jneg2ht.apps.googleusercontent.com"`
   - `ALLOWED_DOMAIN = "grupodisal.com.ar"`
3. Configurar el administrador como secreto:

```powershell
wrangler secret put ADMIN_EMAIL
```

4. Pegar el correo administrador cuando Cloudflare lo pida.
5. Desplegar:

```powershell
wrangler deploy
```

6. Copiar la URL publicada del Worker.
7. Pegar esa URL en `auth-config.js`, en `authEndpoint`.

