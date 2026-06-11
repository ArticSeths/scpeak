# SCPeak — Guía de Despliegue (Self-Hosted)

Esta guía explica cómo desplegar tu propio servidor SCPeak usando Docker.

## Requisitos

- **Docker** y **Docker Compose** instalados en tu servidor (VPS, VM, o máquina local).
- Puertos abiertos en tu firewall:

| Puerto   | Protocolo | Propósito                    |
| -------- | --------- | ---------------------------- |
| `3001`   | TCP       | API REST (login, salas)      |
| `7880`   | TCP       | LiveKit señalización (WS)    |
| `7881`   | TCP       | LiveKit fallback TCP         |
| `7882`   | UDP       | LiveKit voz (WebRTC)         |

## 1. Obtener los archivos de despliegue

Copia estos archivos a tu servidor:

```
docker-compose.prod.yml
```

O clona el repositorio completo:

```bash
git clone https://github.com/ArticSeths/scpeak.git
cd scpeak
```

## 2. Configurar variables de entorno

Crea un archivo `.env` basado en el ejemplo de producción:

```bash
cp .env.prod.example .env
```

Edita `.env` con tus valores:

```env
# Nombre visible de tu servidor
SERVER_NAME=Mi Servidor SCPeak

# Contraseña para registro (déjala vacía para acceso libre)
SERVER_PASSWORD=

# ── SECRETOS (¡CAMBIAR TODOS!) ──
JWT_SECRET=genera-un-valor-con: openssl rand -hex 32
LIVEKIT_API_KEY=genera-una-key
LIVEKIT_API_SECRET=genera-un-valor-con: openssl rand -hex 32
POSTGRES_PASSWORD=genera-una-contraseña-fuerte

# ── Avanzado (opcional) ──
# POSTGRES_USER=admin
# POSTGRES_DB=sc_comms_db
# API_PORT=3001
# LIVEKIT_SIGNAL_PORT=7880
# LIVEKIT_TCP_PORT=7881
# LIVEKIT_UDP_PORT=7882
```

> **Importante**: Genera secretos seguros con `openssl rand -hex 32` para cada clave.

## 3. Iniciar el servidor

### Opción A: Usando la imagen pre-construida de GHCR

```bash
docker compose -f docker-compose.prod.yml up -d
```

Esto descargará la imagen `ghcr.io/articseths/scpeak-server:latest` automáticamente.

### Opción B: Construyendo la imagen localmente

```bash
docker build -t scpeak/server:latest .
docker compose -f docker-compose.prod.yml up -d
```

## 4. Verificar el despliegue

```bash
# Ver logs de todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Verificar que la API responde
curl http://localhost:3001/info
```

Respuesta esperada:

```json
{ "name": "Mi Servidor SCPeak", "requiresPassword": false }
```

## 5. Actualizar a una nueva versión

```bash
# Descargar la última imagen
docker pull ghcr.io/articseths/scpeak-server:latest

# Recrear los contenedores
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Limpiar imágenes viejas (opcional)
docker image prune -f
```

## 6. Backup de la base de datos

```bash
# Exportar la base de datos PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U admin sc_comms_db > backup_$(date +%Y%m%d).sql
```

## Solución de problemas

### El contenedor `scpeak-api` no arranca

```bash
# Ver logs detallados
docker compose -f docker-compose.prod.yml logs scpeak-api

# Verificar que las variables de entorno están configuradas
docker compose -f docker-compose.prod.yml config
```

### Errores de conexión a PostgreSQL

Asegúrate de que `POSTGRES_PASSWORD` en tu `.env` coincide con la contraseña en `DATABASE_URL` (si usas una URL personalizada).

### Puertos ya en uso

Cambia los puertos en `.env` usando las variables `API_PORT`, `LIVEKIT_SIGNAL_PORT`, etc.
