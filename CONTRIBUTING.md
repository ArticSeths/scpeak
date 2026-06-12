# Contribuir a SCPeak

¡Gracias por tu interés en contribuir! 🎙️

## Desarrollo rápido

```bash
git clone https://github.com/ArticSeths/scpeak.git
cd scpeak
pnpm install
cp .env.example .env
pnpm dev:infra   # Docker: LiveKit + PostgreSQL + Redis
pnpm dev          # Infra + server + client
```

Abre `http://localhost:3000` en el navegador.

## Antes de enviar un PR

```bash
pnpm check   # Lint + TypeCheck + Tests
```

Si añades funcionalidad nueva, incluye tests en `__tests__/`.

## Convenciones de código

- TypeScript estricto (`strict: true`)
- ESLint flat config
- Prettier para formato (`pnpm format`)
- Commits en español con el formato: `tipo(scope): descripción`

## Reportar bugs

Usa [GitHub Issues](https://github.com/ArticSeths/scpeak/issues) con:
- Versión de la app
- SO y navegador
- Pasos para reproducir
- Logs de consola (F12)
