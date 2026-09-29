# Fase C — Generar la skill hija

## Mapa de archivos

Crea `~/.claude/skills/mi-consultor-<slug>/` (slug = del `perfil.json → skill.nombre`,
kebab-case):

```
mi-consultor-<slug>/
  SKILL.md                     ← desde 04-plantilla-skill-hija.md, rellenada con el perfil
  references/
    perfil-negocio.md          ← el perfil.json convertido a prosa clara + la tabla resumen
    arquitectura-app.md        ← COPIA LITERAL de assets/motor-refs/arquitectura-app.md
    captura-y-rgpd.md          ← COPIA LITERAL de assets/motor-refs/captura-y-rgpd.md
    calidad-cero-humo.md       ← COPIA LITERAL de assets/motor-refs/calidad-cero-humo.md
    modo-agencia.md            ← COPIA LITERAL, SOLO si perfil.modo == "agencia"
  perfil.json                  ← el perfil confirmado
```

## Reglas de generación

1. **El método se copia literal, el negocio se escribe a medida.** No parafrasees los
   motor-refs (pierden precisión); no metas en ellos nada del perfil.
2. **Neutralización total**: la skill hija no menciona a `forja-consultor`, ni al autor
   del paquete, ni a ningún negocio que no sea el del perfil. Búscalo antes de terminar:
   `grep -ri "forja" mi-consultor-<slug>/` debe devolver cero.
3. **La descripción (frontmatter) de la hija** debe disparar con el vocabulario de SU
   negocio (ej. si es clínica dental: "mi calculadora de presupuesto dental",
   "actualiza mi captador de pacientes"…) además de los genéricos ("mi consultor",
   "mi lead magnet", "despliega mi app de leads").
4. **perfil-negocio.md** es la única fuente del negocio para la hija: concepto, textos
   clave (título gancho, subtítulo, nombre del asistente), colores/tono, referencias
   numéricas reales del sector, destino del lead, CTA, dominio, y los `pendientes`.
5. Si `modo == agencia`, la hija gana un modo de invocación extra ("nueva demo para
   [cliente]") documentado en su SKILL.md y apoyado en `modo-agencia.md`.

## Smoke test (antes de dar por generada)

- La skill aparece al listar `~/.claude/skills/` y su frontmatter parsea (YAML válido).
- `perfil.json` completo (sin campos vacíos críticos: regalo, captura, cta).
- El grep de neutralización da cero.
- Léele en voz alta (resumen) lo que su skill sabe hacer y confirma que se reconoce.
