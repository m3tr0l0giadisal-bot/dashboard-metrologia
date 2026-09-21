# Plan maestro — Ecosistema de Gestión Metrológica DISAL

## 1. Objetivo
Construir un ecosistema modular de gestión metrológica que use al instrumento como entidad central y conecte estado, calibración, certificado, vencimiento, riesgo, historial, responsable y acción.

## 2. Principios heredados de los proyectos existentes
- Versionado semántico mediante archivo VERSION y CHANGELOG.
- Documentación operativa en README y docs/.
- Datos productivos, credenciales y configuraciones sensibles fuera del repositorio.
- Ejemplos sintéticos y pruebas reproducibles.
- Validación local antes de cualquier acción productiva.
- Integridad de documentos mediante SHA-256 cuando corresponda.
- Modos dry-run/simulación para operaciones que puedan modificar información.
- Separación entre código, configuración y datos.
- Recuperación documentada.
- Cada módulo debe declarar alcance, limitaciones y versión.

## 3. Arquitectura funcional
Entidad raíz: Instrumento
  -> Estado
  -> Plan/orden de calibración
  -> Certificado
  -> Vencimiento
  -> Evaluación de riesgo
  -> Historial
  -> Responsable
  -> Acción

Módulos:
1. Dashboard ejecutivo
2. Maestro de instrumentos
3. Calendario de calibraciones
4. Vencimientos críticos
5. Historial metrológico
6. Certificados
7. Verificaciones internas
8. Indicadores/KPI
9. Gestión de proveedores
10. Administración

## 4. Importación de datos
La aplicación deberá aceptar CSV y Excel (.xlsx/.xls) desde una pantalla de Importación/Administración.
Flujo:
Carga -> detección de columnas -> mapeo asistido -> validación -> vista previa -> controles de duplicados -> confirmación -> generación de snapshot -> actualización del índice.
Nunca sobrescribir datos productivos silenciosamente.
Debe existir rollback al último snapshot válido.

## 5. Modelo mínimo de datos
Instrumento:
id, codigo, tipo, magnitud, marca, modelo, serie, capacidad, resolución, ubicación, planta, línea, responsable, estado_operativo, criticidad, frecuencia_calibración, última_calibración, próxima_calibración, estado_calibración, riesgo, certificado_actual_id.

Calibración:
id, instrumento_id, fecha, proveedor, método, resultado, incertidumbre, patrón/referencia, certificado_id, próxima_fecha, observaciones.

Certificado:
id, instrumento_id, tipo, número, fecha_emisión, fecha_vencimiento, proveedor, archivo, hash, estado_documental.

Verificación:
id, instrumento_id, fecha, método, patrón, resultado, criterio, evidencia, responsable, certificado_id.

Acción:
id, instrumento_id, tipo, origen, prioridad, responsable, fecha_objetivo, estado, evidencia, cierre.

## 6. Fases de desarrollo
F0 — Arquitectura y gobierno
- Definir modelo de datos canónico.
- Definir VERSION/CHANGELOG.
- Definir convención de ramas, commits y PR.
- Definir política de datos sensibles.
- Definir contrato CSV/XLSX.
- Crear ADR inicial.

F1 — Shell de aplicación
- Navegación lateral.
- Autenticación/autorización.
- Layout responsive.
- Administración de configuración.
- Versionado visible.

F2 — Maestro de instrumentos
- CRUD controlado.
- Importación CSV/XLSX.
- Validación y mapeo.
- Detección de duplicados.
- Ficha 360° del instrumento.

F3 — Calibraciones y calendario
- Agenda mensual/anual.
- Estados: conforme, por vencer, vencido, fuera de servicio.
- Acciones desde el vencimiento.
- Filtros por planta, responsable, magnitud y criticidad.

F4 — Certificados
- Vinculación instrumento-certificado.
- Metadatos.
- Hash/integridad.
- Consulta y trazabilidad.
- Integración futura con SharePoint.

F5 — Verificaciones internas
- Importar método/criterio.
- Registrar resultados.
- Vincular patrones.
- Generar evidencia/certificado según el módulo existente.

F6 — Riesgo e indicadores
- Matriz de riesgo configurable.
- KPI de cobertura de calibración.
- % conforme.
- vencidos.
- cumplimiento del plan.
- tiempo de cierre de acciones.
- criticidad metrológica.
- tendencia histórica.

F7 — Proveedores
- Maestro.
- Alcances.
- servicios.
- certificados.
- desempeño histórico.
- documentación.

F8 — Integración del ecosistema
- Alertas de calibración.
- Trazabilidad QR.
- Verificaciones internas.
- Repositorio de certificados.
- Contratos/API o adaptadores, sin duplicar fuentes de verdad.

F9 — Validación y despliegue
- Tests unitarios.
- Tests de importación.
- pruebas de regresión.
- seguridad.
- prueba con dataset sintético.
- publicación controlada.
- procedimiento de recuperación.

## 7. Integración de repositorios existentes
- dashboard-metrologia: referencia actual de UI, autenticación, publicación y KPIs.
- alertas-calibracion-disal: motor de vencimientos/avisos; conservar secretos fuera de Git.
- trazabilidad-certificados-qr-disal: identificación, certificados, QR y etiquetas.
- verificaciones-internas-disal: métodos, criterios, calculadores y plantillas.
- certificados-verificacion-interna-disal: archivo e integridad de certificados.

Principio: integrar capacidades; no copiar datos productivos entre repositorios.

## 8. Política de desarrollo
Branches: main protegida conceptualmente; feature/*; fix/*; release/*.
PR obligatorio para cambios funcionales.
Cada PR debe indicar: objetivo, impacto, datos afectados, pruebas y rollback.
Versionado: SemVer MAJOR.MINOR.PATCH.
Cada release actualiza VERSION y CHANGELOG.
Commits: Conventional Commits.
Documentación: README + docs/ + ADR cuando exista decisión arquitectónica.

## 9. Criterio de aceptación del MVP
Un usuario autorizado puede:
1. cargar un CSV/XLSX;
2. mapear columnas;
3. validar y detectar errores/duplicados;
4. confirmar una carga;
5. consultar el maestro;
6. abrir la ficha 360° de un instrumento;
7. ver calendario y vencimientos;
8. consultar certificados e historial;
9. registrar/ver una verificación;
10. visualizar KPI y riesgo;
11. registrar una acción y su cierre.

## 10. Seguridad y datos
No guardar contraseñas, tokens, claves, URLs productivas sensibles ni datos corporativos sensibles en el repositorio.
El repositorio contiene código, documentación, ejemplos sintéticos y configuración de ejemplo.
Los datos reales deben permanecer en la fuente autorizada o almacenamiento protegido.

## 11. Entregables
- README.md
- VERSION
- CHANGELOG.md
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md
- docs/IMPORTACION_DATOS.md
- docs/SECURITY.md
- docs/RECUPERACION.md
- docs/ADR/
- tests/
- skills/the-architect/SKILL.md
- skills/data-import/SKILL.md
