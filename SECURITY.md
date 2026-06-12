# Política de Seguridad

## Reportar una vulnerabilidad

Si descubres una vulnerabilidad de seguridad en SCPeak, por favor **no la reportes públicamente**.
Envía un email a los maintainers del proyecto o abre un [GitHub Security Advisory](https://github.com/ArticSeths/scpeak/security/advisories/new).

## Medidas implementadas

- **Autenticación**: bcrypt + JWT con expiración de 7 días
- **LiveKit**: tokens firmados de corta duración — las API keys nunca se exponen al cliente
- **Base de datos**: Drizzle ORM con parámetros — sin riesgo de SQL injection
- **Secretos**: únicamente via variables de entorno (`.env`); nunca hardcodeados
- **CI/CD**: GITHUB_TOKEN limitado al mínimo necesario por job

## Mejores prácticas al desplegar

1. **Cambia TODOS los secretos** en tu `.env` de producción
2. Usa `openssl rand -hex 32` para generar valores seguros
3. No expongas el puerto de PostgreSQL (5432) a internet — solo acceso interno vía Docker network
4. Usa un reverse proxy (nginx, Caddy) con HTTPS para la API
5. Configura un firewall que solo permita `3001/tcp`, `7880/tcp`, `7881/tcp`, `7882/udp`

## Versiones soportadas

| Versión | Soportada |
|---|---|
| latest (`master`) | ✅ |
| Releases (`v*`) | ✅ |
