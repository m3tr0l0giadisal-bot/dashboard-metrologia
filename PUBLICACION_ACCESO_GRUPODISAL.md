# Publicacion con acceso restringido a Grupo Disal

## Objetivo

Publicar el dashboard de equipos, las etiquetas y los QR como una app web de solo lectura accesible unicamente para usuarios del dominio corporativo `@grupodisal.com.ar`.

## Recomendacion

Usar Azure Static Web Apps con autenticacion Microsoft Entra ID.

GitHub Pages no cumple este requisito porque la publicacion queda expuesta como sitio estatico publico. Puede usarse como origen de codigo, pero no como control de acceso corporativo.

## Contenido protegido

Este paquete protege todo el sitio:

- `/`
- `/dashboard/*`
- `/etiquetas/*`
- `/etiquetas/assets/qr/*`
- `/etiquetas/Etiquetas_Calibracion_Impresion.pdf`

La regla esta definida en `staticwebapp.config.json` con `allowedRoles: ["authenticated"]`.

## Punto critico de seguridad

La regla `authenticated` permite ingresar a usuarios autenticados por Microsoft Entra ID. Para que eso signifique solo Grupo Disal, la Static Web App debe configurarse con proveedor Microsoft Entra ID del tenant corporativo de Grupo Disal, en modo single-tenant.

Si se usa el proveedor preconfigurado sin limitar tenant, podrian autenticarse otras cuentas Microsoft. Por eso este paso debe hacerlo quien tenga permisos de administrador en Azure/Microsoft Entra.

## Pasos de despliegue

1. Subir el contenido completo de `07_Publicacion_Web` a un repositorio GitHub.
2. Crear una Azure Static Web App conectada a ese repositorio.
3. Configurar:
   - App location: `/`
   - Output location: vacio o `/`
   - Build command: vacio
4. En Microsoft Entra ID, registrar la aplicacion como single-tenant del tenant de Grupo Disal.
5. Configurar la Static Web App para usar ese proveedor Entra ID.
6. Validar con:
   - Usuario `@grupodisal.com.ar`: debe ingresar.
   - Cuenta externa: debe quedar bloqueada.
7. Confirmar acceso a:
   - `/dashboard/index.html`
   - `/etiquetas/index.html`
   - `/etiquetas/assets/qr/...`
   - `/etiquetas/Etiquetas_Calibracion_Impresion.pdf`

## URLs esperadas

Cuando Azure cree el sitio, las URLs tendran una forma similar a:

- `https://<nombre-app>.azurestaticapps.net/`
- `https://<nombre-app>.azurestaticapps.net/dashboard/`
- `https://<nombre-app>.azurestaticapps.net/etiquetas/`

Tambien puede configurarse un dominio propio, por ejemplo:

- `https://metrologia.grupodisal.com.ar/`

