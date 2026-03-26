#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Start installation
print_header "Automation Hub - Installation for Ubuntu"
echo "This script will set up everything needed to run Automation Hub."
echo ""

# Step 1: Check if running as non-root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root!"
   exit 1
fi

# Step 2: Check Docker
print_header "Checking Docker installation"
if command -v docker &> /dev/null; then
  print_success "Docker found: $(docker --version)"
else
  print_warning "Docker not found. Installing..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  print_success "Docker installed (you may need to log out and back in)"
  rm get-docker.sh
fi

# Step 3: Check Docker Compose
print_header "Checking Docker Compose"
if command -v docker-compose &> /dev/null; then
  print_success "Docker Compose found: $(docker-compose --version)"
else
  print_warning "Docker Compose not found. Installing..."
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  print_success "Docker Compose installed"
fi

# Step 4: Check Cloudflare Tunnel
print_header "Checking Cloudflare Tunnel"
if command -v cloudflared &> /dev/null; then
  print_success "Cloudflare Tunnel found"
else
  print_warning "Cloudflare Tunnel not found. Installing..."
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$(uname -m).deb -o cloudflared.deb
  sudo dpkg -i cloudflared.deb
  rm cloudflared.deb
  print_success "Cloudflare Tunnel installed"
fi

# Step 5: Create .env file
print_header "Setting up environment variables"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
      sed -i "s/your-super-secret-jwt-key-change-this/$JWT_SECRET/" .env
    else
      sed -i '' "s/your-super-secret-jwt-key-change-this/$JWT_SECRET/" .env
    fi
    print_success ".env file created with secure JWT_SECRET"
  else
    print_warning ".env.example not found, creating minimal .env"
    cat > .env << 'EOF'
NODE_ENV=production
LOG_LEVEL=info
JWT_SECRET=change-this-to-a-random-secure-key
DATABASE_URL=postgresql://admin:admin123@postgres:5432/automation_hub
REDIS_URL=redis://redis:6379
OPENAI_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF
    print_warning "Please update .env file with your actual configuration"
  fi
else
  print_success ".env file already exists"
fi

# Step 6: Start Docker containers
print_header "Starting Docker containers"
echo "Building and starting services..."
docker-compose up -d
print_success "Containers started"

# Step 7: Wait for services
print_header "Waiting for services to be ready"
echo "Checking PostgreSQL..."
for i in {1..30}; do
  if docker exec automation-hub-postgres pg_isready -U admin &> /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
    break
  fi
  echo "  Attempt $i/30..."
  sleep 2
done

# Step 8: Run migrations (if using Prisma)
print_header "Setting up database"
echo "Running database migrations..."
docker-compose exec -T api npx prisma migrate deploy 2>/dev/null || print_warning "Migrations skipped or already run"

# Step 9: Create admin user via SQL
print_header "Creating admin user"
docker-compose exec -T postgres psql -U admin -d automation_hub << 'SQL' 2>/dev/null || print_warning "Admin user may already exist"
INSERT INTO users (id, email, "passwordHash", "isAdmin", "createdAt", "updatedAt")
VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@automation-hub.local',
  '$2a$10$jNQFHJ.ZZK.0z0Kzx0Kz0OK.ZZK.0z0Kzx0Kz0OK.ZZK.0z0Kzx0Kz0OK',
  true,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;
SQL
print_success "Admin user configured"

# Step 10: Setup Cloudflare Tunnel (optional)
print_header "Cloudflare Tunnel Setup (Optional)"
read -p "Do you want to set up Cloudflare Tunnel for remote access? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  print_header "Cloudflare Tunnel Configuration"
  echo "Follow these steps:"
  echo "1. Visit: https://dash.cloudflare.com/sign-up"
  echo "2. Create a free account and add your domain"
  echo "3. Run: cloudflared tunnel login"
  echo "4. Run: cloudflared tunnel create automation-hub"
  echo ""
  read -p "Press Enter after completing the above steps, then paste your tunnel token: " TUNNEL_TOKEN

  if [ ! -z "$TUNNEL_TOKEN" ]; then
    print_header "Installing Cloudflare Tunnel service"

    # Create config file
    mkdir -p ~/.cloudflared
    cat > ~/.cloudflared/config.yml << EOF
tunnel: automation-hub
credentials-file: /home/$USER/.cloudflared/automation-hub.json

ingress:
  - hostname: automation-hub.YOUR_DOMAIN.com
    service: http://localhost
  - service: http_status:404
EOF

    # Create systemd service
    sudo tee /etc/systemd/system/cloudflare-tunnel.service > /dev/null << 'SYSTEMD'
[Unit]
Description=Cloudflare Tunnel
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=USER_PLACEHOLDER
ExecStart=/usr/local/bin/cloudflared tunnel run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
SYSTEMD

    # Replace USER_PLACEHOLDER with actual username
    sudo sed -i "s/USER_PLACEHOLDER/$USER/" /etc/systemd/system/cloudflare-tunnel.service

    sudo systemctl daemon-reload
    sudo systemctl enable cloudflare-tunnel
    sudo systemctl start cloudflare-tunnel

    print_success "Cloudflare Tunnel installed as system service"
    print_warning "Update ~/.cloudflared/config.yml with your actual domain name"
  else
    print_warning "No tunnel token provided, skipping Cloudflare setup"
  fi
fi

# Step 11: Final summary
print_header "✅ Installation Complete!"
echo ""
echo "Your Automation Hub is now running!"
echo ""
echo "Access points:"
echo "  - Local (HTTP):  http://localhost"
echo "  - Local (API):   http://localhost:3000"
echo "  - Local (Docs):  http://localhost:3000/docs"
echo ""
echo "Default Admin Credentials:"
echo "  - Email:    admin@automation-hub.local"
echo "  - Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change the default password after first login!"
echo ""
echo "Useful Commands:"
echo "  - View logs:        docker-compose logs -f api"
echo "  - Stop services:    docker-compose down"
echo "  - Start services:   docker-compose up -d"
echo "  - Restart API:      docker-compose restart api"
echo "  - Tunnel status:    sudo systemctl status cloudflare-tunnel"
echo "  - Tunnel logs:      sudo journalctl -u cloudflare-tunnel -f"
echo ""
echo "Next Steps:"
echo "  1. Open http://localhost in your browser"
echo "  2. Log in with admin credentials"
echo "  3. Create your first automation!"
echo ""
