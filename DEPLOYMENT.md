# LocalYapper Deployment Guide

## Overview

This guide covers deploying LocalYapper to various platforms. Since LocalYapper is designed for local use with Ollama, deployment options focus on self-hosting scenarios.

## Prerequisites

- Node.js 18+ installed on the target system
- Ollama installed and accessible
- SQLite database access
- Network access to Ollama (default: localhost:11434)

## Local Development Deployment

### Using npm scripts

```bash
# Install dependencies
npm install

# Set up database
npm run prisma:migrate
npm run prisma:generate

# Seed demo data (optional)
npm run seed

# Build for production
npm run build

# Start production server
npm run start
```

### Using Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  localyapper:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OLLAMA_HOST=http://host.docker.internal:11434
    volumes:
      - ./prisma/data:/app/prisma/data
      - ./data/uploads:/app/data/uploads
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

volumes:
  ollama_data:
```

Run with Docker Compose:

```bash
# Build and start services
docker-compose up -d

# Initialize database
docker-compose exec localyapper npx prisma migrate deploy
docker-compose exec localyapper npx prisma db seed
```

## Server Deployment

### Ubuntu/Debian Server

1. **Install Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install Ollama**:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
sudo systemctl enable ollama
sudo systemctl start ollama
```

3. **Clone and setup application**:
```bash
git clone <repository-url>
cd localyapper
npm install
npm run prisma:migrate
npm run build
```

4. **Create systemd service**:
```bash
sudo nano /etc/systemd/system/localyapper.service
```

Add to the service file:
```ini
[Unit]
Description=LocalYapper Chat Application
After=network.target ollama.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/localyapper
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=OLLAMA_HOST=http://localhost:11434

[Install]
WantedBy=multi-user.target
```

5. **Enable and start service**:
```bash
sudo systemctl daemon-reload
sudo systemctl enable localyapper
sudo systemctl start localyapper
```

### Using PM2

1. **Install PM2**:
```bash
npm install -g pm2
```

2. **Create ecosystem file**:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'localyapper',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      OLLAMA_HOST: 'http://localhost:11434'
    },
    cwd: '/path/to/localyapper'
  }]
}
```

3. **Start with PM2**:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Cloud Deployment

### Railway

1. **Connect repository** to Railway
2. **Set environment variables**:
   - `OLLAMA_HOST`: Your Ollama endpoint
   - `NODE_ENV`: `production`
3. **Deploy**: Railway will automatically build and deploy

### Render

1. **Create Web Service** from your repository
2. **Set build command**: `npm run build`
3. **Set start command**: `npm start`
4. **Add environment variables**:
   - `OLLAMA_HOST`: Your Ollama endpoint
5. **Deploy**

### Vercel

**Note**: Vercel deployment is not recommended for LocalYapper since it requires persistent database storage and Ollama access. Use server-based deployment instead.

## Environment Configuration

### Required Environment Variables

```env
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434

# Database (optional, defaults to local SQLite)
DATABASE_URL="file:./prisma/data/app.db"

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Ollama Remote Access

If Ollama is running on a different machine:

1. **Configure Ollama for remote access**:
```bash
# Edit Ollama service
sudo systemctl edit ollama

# Add environment variables
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

2. **Restart Ollama**:
```bash
sudo systemctl restart ollama
```

3. **Set OLLAMA_HOST** in your application:
```env
OLLAMA_HOST=http://remote-server:11434
```

## Database Setup

### SQLite (Default)

SQLite is the default database and requires no additional setup. The database file is created automatically in `prisma/data/app.db`.

### PostgreSQL (Alternative)

1. **Install PostgreSQL**:
```bash
sudo apt-get install postgresql postgresql-contrib
```

2. **Create database and user**:
```sql
CREATE DATABASE localyapper;
CREATE USER localyapper_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE localyapper TO localyapper_user;
```

3. **Update DATABASE_URL**:
```env
DATABASE_URL="postgresql://localyapper_user:your_password@localhost:5432/localyapper"
```

4. **Run migrations**:
```bash
npx prisma migrate deploy
```

## Networking & Security

### Reverse Proxy (nginx)

Create nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS, Ollama
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 11434
sudo ufw enable
```

## Monitoring & Maintenance

### Health Checks

Add health check endpoint monitoring:

```bash
# Check if service is running
curl http://localhost:3000/api/health

# Check Ollama connectivity
curl http://localhost:11434/api/tags
```

### Logs

```bash
# PM2 logs
pm2 logs localyapper

# Systemd logs
sudo journalctl -u localyapper -f

# Application logs (if configured)
tail -f /path/to/localyapper/logs/app.log
```

### Backup Strategy

1. **Database backup**:
```bash
# SQLite
cp prisma/data/app.db backup/app-$(date +%Y%m%d).db

# PostgreSQL
pg_dump localyapper > backup/app-$(date +%Y%m%d).sql
```

2. **File uploads backup**:
```bash
tar -czf backup/uploads-$(date +%Y%m%d).tar.gz data/uploads/
```

3. **Automated backups** (add to crontab):
```bash
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Common Issues

#### Application won't start
- Check Node.js version: `node --version`
- Verify dependencies: `npm list --depth=0`
- Check database connection: `npx prisma db push`

#### Ollama connection failed
- Verify Ollama is running: `ollama list`
- Check OLLAMA_HOST environment variable
- Test connection: `curl http://localhost:11434/api/tags`

#### Database errors
- Run migrations: `npx prisma migrate deploy`
- Reset database: `npx prisma migrate reset`
- Check file permissions on database file

#### Performance issues
- Monitor memory usage: `htop` or `top`
- Check Ollama model size and system resources
- Adjust context window settings in bot configurations

### Performance Tuning

1. **Node.js optimization**:
```bash
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"
```

2. **Database optimization**:
- Use connection pooling for PostgreSQL
- Enable WAL mode for SQLite
- Regular VACUUM operations

3. **Ollama optimization**:
- Use GPU acceleration if available
- Choose appropriate model sizes
- Monitor GPU memory usage

## Scaling Considerations

### Horizontal Scaling
- Use load balancer for multiple instances
- Shared database (PostgreSQL recommended)
- Redis for session storage (if implementing auth)

### Vertical Scaling
- Increase server resources (CPU, RAM, GPU)
- Use SSD storage for better I/O
- Monitor and optimize memory usage

### High Availability
- Database replication
- Backup and recovery procedures
- Monitoring and alerting setup

## Security Best Practices

1. **Keep dependencies updated**:
```bash
npm audit
npm update
```

2. **Use environment variables** for secrets
3. **Regular backups** of data
4. **Monitor logs** for suspicious activity
5. **Firewall configuration** to limit access
6. **SSL/TLS encryption** for web traffic

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify Ollama connectivity
4. Check system resources

For feature requests or bug reports, please create an issue on the GitHub repository.