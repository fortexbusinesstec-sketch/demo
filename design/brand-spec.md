# Brand Spec — Azur Constructora e Inmobiliaria

Extraído de https://www.azurconstruye.com/

## Paleta

```css
:root {
  --bg:      oklch(97% 0.002 30);
  --surface: oklch(100% 0 0);
  --fg:      oklch(18% 0.02 30);
  --muted:   oklch(48% 0.01 30);
  --border:  oklch(88% 0.005 30);
  --accent:  oklch(46% 0.18 30);    /* rojo #c12128 */

  --red:     oklch(46% 0.18 30);    /* #c12128 */
  --red-hover: oklch(40% 0.18 30);
  --gold:    oklch(78% 0.14 85);    /* #ffd266 */
  --dark:    oklch(22% 0.04 280);   /* #292134 */
  --green:   oklch(58% 0.18 145);
  --yellow:  oklch(75% 0.15 85);
  --purple:  oklch(50% 0.12 290);

  --font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-body:    -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono:    ui-monospace, 'SF Mono', Menlo, monospace;
}
```

## Postura de diseño
- Rojo corporativo #c12128 como color primario dominante.
- Blanco como fondo principal, grises muy claros para superficies secundarias.
- Dorado #ffd266 como acento secundario (uso muy restringido).
- Botones grandes, touch-friendly (≥48px), esquinas redondeadas (12–16px).
- Badges de estado con color semántico.
- Layout responsivo: cards en móvil, tabla en desktop.
