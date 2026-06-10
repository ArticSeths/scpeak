# Especificación de Arquitectura: StarCitizen Comms App

## Visión General del Proyecto
Desarrollo de una aplicación de escritorio nativa, ultraligera y de alta capacidad para comunicación por voz en tiempo real al estilo "Walkie-Talkie".
* **Capacidad:** Soporte para más de 100 usuarios simultáneos por sala.
* **Características:** Efectos de voz personalizados, cancelación de ruido por IA y despliegue simplificado.

## Estructura de Desarrollo (Monorepo)
Dado que el proyecto se desarrollará en un monorepositorio, la lógica se dividirá en los siguientes componentes principales:

### 1. El Cliente (Frontend & App Nativa)
Diseñado para consumir los mínimos recursos posibles en el sistema operativo del usuario.
* **Empaquetador Nativo:** Tauri. Genera ejecutables ligeros (5-10 MB) utilizando el motor web nativo del SO (WebView).
* **Framework UI:** Nuxt 3 (configurado estrictamente como SPA con `ssr: false`) combinado con TailwindCSS.
* **Gestión de Salas y Voz:** Uso del paquete oficial `@livekit/components-vue` para manejar el estado de las conexiones, micrófonos y participantes activos.

#### Procesamiento de Audio (El Pipeline)
* **Fase 1 (Limpieza):** Uso de RNNoise (vía WebAssembly) para la cancelación de ruido de fondo por Inteligencia Artificial en tiempo real, procesado íntegramente en el cliente.
* **Fase 2 (Efecto):** Uso de la Web Audio API para aplicar filtros pasa-banda y distorsión, logrando el efecto "Walkie-Talkie" deseado antes de enviar la transmisión.

### 2. El Backend (Comando Central / API de Gestión)
Microservicio dedicado a la lógica de negocio, reglas de acceso y base de datos, desvinculado del tráfico de audio.
* **Entorno:** Node.js con Express.
* **Lenguaje:** TypeScript, para compartir tipado estricto con el cliente Nuxt.
* **Base de Datos:** PostgreSQL, gestionada a través de Drizzle ORM.
* **Misión Principal:** Gestionar usuarios, contraseñas, listado de salas y actuar como autoridad emisora de tokens de acceso temporales.

### 3. El Motor de Medios (Servidor SFU)
* **Servidor SFU:** LiveKit (Open-source).
* **Optimizaciones:** Maneja automáticamente NAT Traversal, adaptación de bitrate y emplea Opus DTX (corta paquetes silenciosos ahorrando hasta un 80% de ancho de banda).
* **Despliegue:** Empaquetado en Docker junto a la base de datos (PostgreSQL) y Redis.

### 4. Estrategia de Red e Infraestructura (Single Port)
Para evadir problemas comunes en Docker y Firewalls corporativos, se emplea una estrategia de puerto único:
* **UDP Multiplexing:** LiveKit canaliza toda la transferencia de voz de todos los usuarios a través de un único puerto UDP (ej. 7882/udp), similar a TeamSpeak.

#### Asignación de Puertos (Infraestructura)
| Servicio | Puerto | Protocolo | Propósito Principal |
| :--- | :--- | :--- | :--- |
| **LiveKit (Voz)** | 7882 | UDP | Transferencia masiva de voz (Single Port). |
| **LiveKit (Fallback)** | 7881 | TCP | Conexiones de voz de emergencia para redes restrictivas. |
| **LiveKit (Señal)** | 7880 | TCP | Handshake inicial y conexión WebSocket para unirse a la sala. |
| **PostgreSQL** | 5432 | TCP | Conexión local para que Drizzle ORM lea y escriba datos. |
| **Redis** | 6379 | TCP | Comunicación interna exclusiva para el cluster de LiveKit. |

### 5. Flujo de Autenticación y Conexión Segura
El sistema se basa en delegación de confianza mediante tokens:
1.  **Login:** El usuario (Nuxt) se autentica en la API (Express). Drizzle valida y la API devuelve un JWT estándar de sesión.
2.  **Petición de Entrada:** El usuario pide entrar a una sala enviando su JWT. La API valida permisos en la base de datos (PostgreSQL).
3.  **Generación de Pase:** Si está autorizado, la API usa el SDK de LiveKit para generar un "Token de Acceso a LiveKit" con reglas estrictas (sala, permisos).
4.  **Transmisión:** El cliente usa el token de LiveKit para conectarse directamente al servidor Docker. LiveKit valida la firma, abre la conexión por el puerto único y empieza a distribuir la voz.
