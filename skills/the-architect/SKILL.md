# Skill — The Architect: Ecosistema Metrológico DISAL

## Propósito
Planificar y ejecutar cambios del ecosistema con criterio arquitectónico, minimizando acoplamiento, duplicación de datos y regresiones.

## Flujo obligatorio
1. Inspeccionar repositorios, README, VERSION, CHANGELOG, docs y estructura.
2. Identificar fuente de verdad y límites de cada módulo.
3. Formular impacto: datos, seguridad, UI, integración y recuperación.
4. Diseñar antes de implementar.
5. Separar cambios en unidades pequeñas y reversibles.
6. Implementar primero contratos/modelos; luego servicios; luego UI.
7. Probar con datos sintéticos.
8. Documentar versión, decisión y rollback.
9. Abrir PR con evidencia de pruebas.
10. No modificar producción sin confirmación y procedimiento explícito.

## Selección de modelo/ejecución
- Tareas arquitectónicas, modelo de datos, seguridad, integraciones y debugging complejo: usar el modelo de mayor capacidad disponible.
- UI simple, documentación rutinaria, transformaciones y tareas repetitivas: usar un modelo rápido/ligero.
- No utilizar el modelo ligero para decisiones de arquitectura, seguridad o migraciones.
- Dividir tareas grandes en entregables verificables.

## Regla de fuentes
El instrumento es la entidad central, pero no necesariamente la fuente de verdad de todos los documentos.
Cada dato debe tener propietario/fuente definida.

## Regla de importación
Nunca convertir una carga CSV/XLSX en escritura irreversible. El flujo siempre debe ser staging -> validación -> preview -> confirmación -> snapshot -> publicación.

## Regla de integración
Preferir adaptadores/API y referencias a la fuente original frente a duplicación de registros.

## Regla de trazabilidad
Toda modificación relevante debe ser auditable: quién, cuándo, qué cambió, origen y versión.

## Regla de seguridad
Secretos y datos productivos no se almacenan en Git. Usar variables/secret stores/configuración externa.

## Salida esperada
Para cada tarea producir:
- objetivo;
- alcance;
- dependencias;
- riesgos;
- archivos afectados;
- estrategia de pruebas;
- rollback;
- versión objetivo.
