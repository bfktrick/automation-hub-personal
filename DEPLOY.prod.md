# Guía de Despliegue en Producción - Automation Hub

Esta guía te ayudará a desplegar Automation Hub en un servidor Ubuntu Server con acceso remoto seguro vía **Cloudflare Tunnel**.

## 📋 Requisitos Previos

- Ubuntu Server 20.04 LTS o superior
- Docker & Docker Compose instalados
- Acceso SSH al servidor
- **Cuenta gratuita en Cloudflare** (cloudflare.com)
- Dominio agregado a Cloudflare (o subdominio)
- `cloudflared` CLI instalada (se descargará con Docker, pero necesitas la CLI para generar tokens)

---

## 🚀 Pasos de Despliegue

### 1. Instalar Docker & Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 2. Instalar Cloudflared CLI (en tu máquina local o en el servidor)

**Opción A: En tu máquina local (Windows/Mac/Linux)**

```bash
# Windows (PowerShell como Admin)
choco install cloudflare-warp  # o descargar de https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# macOS
brew install cloudflare/warp/cloudflared

# Linux
curl -L --output cloudflared.linux-amd64.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.linux-amd64.deb
```

**Opción B: En Ubuntu Server**

```bash
# En el servidor Ubuntu
sudo apt-get update
sudo apt-get install -y wget
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
cloudflared --version
```

### 3. Autenticar Cloudflared y Crear el Túnel

**NOTA:** Los pasos 3a y 3b se ejecutan en tu máquina local (donde instalaste cloudflared). El servidor solo necesita el token generado.

#### 3a. Autenticarse con Cloudflare

```bash
# En tu máquina local (no en el servidor)
cloudflared tunnel login

# Se abrirá un navegador para autenticarte con Cloudflare
# Selecciona el dominio/zona que quieres usar
# Al completar, verás un mensaje: "Successfully authenticated"
```

Esto crea un certificado en:
- **Windows**: `%APPDATA%\cloudflare-one\cert.pem`
- **Mac/Linux**: `~/.cloudflare-warp/cert.pem`

#### 3b. Crear un Túnel Nuevo

```bash
# Crear el túnel
cloudflared tunnel create automation-hub

# Output similar a:
# Tunnel credentials written to /home/user/.cloudflare-warp/XXXXXXXXXXXX.json
# Tunnel automation-hub (UUID) created. Note that currently this tunnel is dormant.
# Before routing traffic to it, make sure to:
# 1. Create a route (cloudflared tunnel route create)
# 2. Start the tunnel (cloudflared tunnel run)
# NOTA: Guarda el UUID del túnel, lo necesitarás después
```

#### 3c. Obtener el Token del Túnel

```bash
# Generar token para ejecutar en Docker
cloudflared tunnel token automation-hub

# Output: eyJhIjoixxxxxxxxxxxxxxxxxxxxxxxx...
# ⚠️ Este es tu CLOUDFLARE_TUNNEL_TOKEN - guárdalo en lugar seguro
```

#### 3d. Configurar la Ruta DNS

```bash
# Apuntar tu dominio al túnel (sustituye por tu dominio real)
cloudflared tunnel route dns automation-hub tu-dominio.com

# Output similar a:
# Successfully routed DNS record for tu-dominio.com
# Esto crea un CNAME en Cloudflare que apunta al túnel
```

**Verificar la ruta:**
```bash
cloudflared tunnel route ls
# Ver todas las rutas configuradas
```

---

### 4. Transferir Código al Servidor

```bash
# Desde tu máquina local, en PowerShell o terminal:
scp -r "C:\Users\PC GAMING\OneDrive\Escritorio\automation-hub" usuario@tu-servidor-ip:/home/usuario/

# O si usas Git:
ssh usuario@tu-servidor-ip
git clone https://tu-repo-url.git automation-hub
cd automation-hub
```

### 5. Configurar Variables de Entorno en el Servidor

```bash
# SSH al servidor
ssh usuario@tu-servidor-ip
cd automation-hub

# Copiar plantilla
cp .env.prod.example .env.prod

# Editar variables
nano .env.prod
```

**Variables a configurar:**

```bash
# 1. Cloudflare Tunnel (REQUERIDO)
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoixxxxxxxxxxxxxxxxxxxxxxxx  # El token que obtuviste en 3c

# 2. Base de Datos
POSTGRES_PASSWORD=miContraseñaSegura123!@#  # Genera una fuerte

# 3. JWT Secret
JWT_SECRET=miJWTSecretAleatorioY32Caracteres123456  # Ejecuta: openssl rand -base64 32

# 4. CORS Origins
CORS_ORIGINS=https://tu-dominio.com  # Tu dominio HTTPS (el que configuraste en 3d)

# 5. Logging
LOG_LEVEL=info
```

Guarda el archivo (Ctrl+O, Enter, Ctrl+X en nano).

### 6. Crear Directorios de Soporte

```bash
# Crear directorio de backups
mkdir -p ./backups

# (Opcional) Crear directorio de logs
mkdir -p ./logs
```

### 7. Levantar los Contenedores

```bash
# Construcción e inicio
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar que todos están corriendo
docker-compose -f docker-compose.prod.yml ps

# Debería ver:
# NAME                      STATUS
# automation-hub-postgres   Up (healthy)
# automation-hub-redis      Up (healthy)
# automation-hub-api        Up (healthy)
# automation-hub-frontend   Up
# automation-hub-cloudflared Up
```

### 8. Ejecutar Migraciones de Base de Datos

```bash
# Ejecutar migraciones de Prisma
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Crear usuario admin (si aún no existe)
# Accede a tu aplicación y usa el formulario de registro, O:
# POST /api/v1/auth/register vía curl/Postman
```

### 9. Verificar que el Túnel está Activo

```bash
# Ver estado del túnel desde tu máquina local
cloudflared tunnel list

# Ver conectividad del túnel
cloudflared tunnel info automation-hub

# Logs en tiempo real (en tu máquina local)
cloudflared tunnel run automation-hub --token eyJhIjoixxxxxxxxxxxxxxxxxxxxxxxx
# (Nota: Esto es solo para debugging; en Docker ya se ejecuta automáticamente)
```

### 10. ✅ Acceder a tu Aplicación

**Abre en el navegador:**
```
https://tu-dominio.com
```

Debería ver la página de login de Automation Hub con HTTPS automático.

---

## 🔐 Cloudflare Tunnel: Cómo Funciona

```
[Internet]
    ↓ (HTTPS)
[Cloudflare Edge]
    ↓ (Túnel encriptado)
[Servidor Ubuntu - Cloudflared]
    ↓
[Docker Network]
    ├── Frontend (Nginx)
    ├── API (NestJS)
    ├── PostgreSQL
    └── Redis
```

**Ventajas:**
- ✅ Sin puertos abiertos en el router/firewall
- ✅ HTTPS automático (certificado Cloudflare)
- ✅ DDoS protection incluido
- ✅ Túnel encriptado de extremo a extremo
- ✅ IP pública del servidor oculta
- ✅ Gratuito con cuenta Cloudflare gratuita

---

## 📊 Monitoreo y Logs

```bash
# Logs en tiempo real (todos los servicios)
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos por servicio
docker-compose -f docker-compose.prod.yml logs cloudflared --tail=50
docker-compose -f docker-compose.prod.yml logs api --tail=50
docker-compose -f docker-compose.prod.yml logs frontend --tail=30

# Verificar salud de servicios
docker-compose -f docker-compose.prod.yml ps

# Acceder al dashboard de Cloudflare
# https://dash.cloudflare.com/ → Zero Trust → Networks → Tunnels
```

---

## 🔄 Backup y Restauración

### Backup de PostgreSQL

```bash
# Crear backup
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U admin automation_hub > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar desde backup
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U admin automation_hub
```

### Backup de Redis

```bash
# Redis ya usa AOF (Append-Only File) por defecto
# Los datos se guardan automáticamente en el volumen
docker-compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE

# Verificar que el backup existe
docker volume inspect automation-hub_redis_data
```

---

## 🛠️ Mantenimiento

### Actualizar la Aplicación

```bash
# 1. Crear backup
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U admin automation_hub > backup_before_update_$(date +%Y%m%d).sql

# 2. Detener servicios
docker-compose -f docker-compose.prod.yml down

# 3. Actualizar código
git pull origin main

# 4. Reconstruir e iniciar
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Ejecutar migraciones si es necesario
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# 6. Verificar estado
docker-compose -f docker-compose.prod.yml ps
```

### Renovar Token de Cloudflare Tunnel

```bash
# Ejecutar en tu máquina local si el token expira
cloudflared tunnel token automation-hub > /tmp/token.txt

# Actualizar en .env.prod del servidor
ssh usuario@servidor
nano .env.prod
# Reemplaza CLOUDFLARE_TUNNEL_TOKEN con el nuevo valor

# Reiniciar el servicio cloudflared
docker-compose -f docker-compose.prod.yml restart cloudflared
```

### Limpieza de Imágenes Antiguas

```bash
# Eliminar imágenes sin usar
docker image prune -a -f

# Eliminar volúmenes sin usar
docker volume prune -f

# Eliminar contenedores parados
docker container prune -f
```

---

## 🚨 Solución de Problemas

### El túnel no conecta

```bash
# Verificar logs de cloudflared
docker-compose -f docker-compose.prod.yml logs cloudflared --tail=100

# Posibles causas:
# 1. Token inválido o expirado
# 2. Ruta DNS no configurada correctamente
# 3. Zona de Cloudflare no apunta a Cloudflare nameservers

# Solución: Regenerar token
cloudflared tunnel token automation-hub
# Actualizar .env.prod y reiniciar
docker-compose -f docker-compose.prod.yml restart cloudflared
```

### Frontend muestra 502 Bad Gateway

```bash
# Verificar que el API está corriendo
docker-compose -f docker-compose.prod.yml ps api

# Ver logs del API
docker-compose -f docker-compose.prod.yml logs api --tail=50

# Verificar conectividad interna
docker-compose -f docker-compose.prod.yml exec frontend curl http://api:5000/api/v1/health
```

### Conexión rechazada a PostgreSQL

```bash
# Verificar que PostgreSQL está sano
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U admin

# Verificar variables de entorno
docker-compose -f docker-compose.prod.yml config | grep DATABASE_URL

# Ver logs de PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres --tail=50
```

### Cloudflare muestra timeout

```bash
# 1. Verificar que todos los contenedores están running
docker-compose -f docker-compose.prod.yml ps

# 2. Verificar logs de nginx/frontend
docker-compose -f docker-compose.prod.yml logs frontend

# 3. Verificar que el puerto 80 está disponible en el contenedor
docker-compose -f docker-compose.prod.yml exec frontend netstat -tlnp
```

---

## 📈 Performance & Optimizaciones

### Aumentar recursos de PostgreSQL

```yaml
# En docker-compose.prod.yml, bajo el servicio postgres:
environment:
  POSTGRES_INITDB_ARGS: "-c max_connections=300 -c shared_buffers=256MB"
```

### Configurar cache de Cloudflare

En el dashboard de Cloudflare:
1. Ve a **Caching** → **Cache Rules**
2. Agrega una regla: `Path contains /api/` → **Cache Level**: Skip
3. Para assets: `Path matches *.js OR *.css` → **Cache Level**: Cache Everything

### Habilitar compresión Nginx

Ya está configurado en `nginx.conf` automáticamente.

---

## 🔐 Checklist de Seguridad

- [ ] ✅ Cloudflare Tunnel habilitado (sin puertos abiertos)
- [ ] ✅ HTTPS automático vía Cloudflare
- [ ] ✅ `JWT_SECRET` cambiad a valor único y fuerte (32+ caracteres)
- [ ] ✅ `POSTGRES_PASSWORD` cambiad a valor único y fuerte (20+ caracteres)
- [ ] ✅ `CORS_ORIGINS` apunta a https://tu-dominio.com
- [ ] ✅ `CLOUDFLARE_TUNNEL_TOKEN` guardado de forma segura
- [ ] ✅ Firewall del servidor: solo SSH (puerto 22) abierto
- [ ] ✅ Acceso SSH con SSH keys (sin contraseña)
- [ ] ✅ Backups automáticos de PostgreSQL configurados
- [ ] ✅ Logs monitoreados regularmente
- [ ] ✅ Actualizaciones de seguridad aplicadas regularmente

---

## 📞 Soporte y Debugging

### Ver logs completos de todos los servicios

```bash
docker-compose -f docker-compose.prod.yml logs --tail=200 --follow
```

### Acceder a la shell del contenedor API para debugging

```bash
docker-compose -f docker-compose.prod.yml exec api sh

# Dentro del contenedor puedes:
# - npm list (verificar dependencias)
# - node -e "console.log(process.env)" (ver variables de entorno)
# - curl http://localhost:5000/api/v1/health (verificar API está viva)
```

### Verificar estado del túnel en tiempo real

```bash
# En tu máquina local
cloudflared tunnel info automation-hub
# Muestra: Connected, Disconnected, Reconnecting, etc.
```

---

## 🎯 Próximos Pasos (Opcionales)

1. **Implementar CI/CD**: Usar GitHub Actions para auto-deploy en cada push
2. **Monitoreo avanzado**: Integrar Sentry.io para error tracking
3. **Alertas**: Configurar alertas en Cloudflare Zero Trust
4. **Rate Limiting**: Habilitar en Cloudflare para proteger contra abuso
5. **WAF Rules**: Agregar reglas de Web Application Firewall en Cloudflare

---

**Última actualización**: 2026-03-26
**Versión**: 1.0 con Cloudflare Tunnel
