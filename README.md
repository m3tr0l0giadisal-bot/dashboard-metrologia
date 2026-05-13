# Dashboard de Gestion Metrologica

APP para gestion de equipos y ensayos de Disal.

Dashboard local para visualizar el maestro de instrumentos por sede, planta, linea, tipo de equipo y estado de calibracion.

## Publicacion en GitHub Pages

Esta app es estatica y puede publicarse directamente desde la rama `main`.

1. En GitHub, abrir `Settings > Pages`.
2. En `Build and deployment`, seleccionar `Deploy from a branch`.
3. Elegir la rama `main` y la carpeta `/root`.

La pagina quedara disponible en:

```text
https://m3tr0l0giadisal-bot.github.io/dashboard-metrologia/
```

Nota: el boton `Abrir etiquetas PDF` apunta a un archivo local `file:///C:/...`; desde GitHub Pages solo funcionara si se reemplaza por una URL web o si se agrega el PDF al repositorio con una ruta relativa.

## Abrir

Abrir `index.html` en el navegador.

## Actualizar datos

Cuando cambie el archivo maestro, ejecutar en PowerShell desde esta carpeta:

```powershell
.\actualizar-datos.ps1
```

Tambien se puede pasar otra ruta:

```powershell
.\actualizar-datos.ps1 -ExcelPath "C:\ruta\maestro.xlsx"
```

El script lee la hoja `INSTRUMENTOS`, toma los encabezados de la fila 2 y regenera:

- `data/instrumentos.json`
- `data/instrumentos.js`
- `data/columnas.txt`

El dashboard usa `data/instrumentos.js` para poder abrirse directo como archivo local, sin servidor web.
