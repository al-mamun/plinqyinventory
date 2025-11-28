# Production Deployment Guide - Plinqy Search Engine

## Quick Start - Amsterdam Deployment

### Prerequisites
- AWS Account with eu-west-1 (Amsterdam) access
- Docker installed locally
- Domain name configured
- SSL certificate (AWS Certificate Manager)

## Step 1: Prepare OSRM Data (Local)

### Windows:
```powershell
.\scripts\setup-osrm-netherlands.ps1
```

### Linux/Mac:
```bash
chmod +x ./scripts/setup-osrm-netherlands.sh
./scripts/setup-osrm-netherlands.sh
```

**Time:** ~15-20 minutes
**Size:** ~500MB processed data

## Step 2: Test Locally

```bash
# Start production stack locally
docker-compose -f docker-compose.prod.yml up -d

# Test OSRM
curl 'http://localhost:5000/route/v1/driving/4.9041,52.3676;4.8952,52.3702'

# Test Search Engine
curl http://localhost:3000/health
```

## Step 3: Deploy to AWS

### Option A: EC2 Deployment (Recommended for start)

#### 1. Launch EC2 Instance
```bash
# Instance type: t3.medium (Amsterdam region)
# AMI: Amazon Linux 2023
# Storage: 30GB EBS
# Security Group: Allow 80, 443, 5000 (internal only)
```

#### 2. Connect and Setup
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 3. Deploy Application
```bash
# Clone your repository
git clone https://github.com/yourusername/plinqy.git
cd plinqy

# Copy OSRM data (upload from local)
scp -r -i your-key.pem ./osrm-data ec2-user@your-instance-ip:~/plinqy/

# Set environment variables
cp .env.production .env

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### Option B: ECS Deployment (For auto-scaling)

#### 1. Build and Push Docker Images
```bash
# Login to ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.eu-west-1.amazonaws.com

# Build and push search engine
docker build -f apps/search-engine/Dockerfile.prod -t plinqy-search:latest .
docker tag plinqy-search:latest your-account-id.dkr.ecr.eu-west-1.amazonaws.com/plinqy-search:latest
docker push your-account-id.dkr.ecr.eu-west-1.amazonaws.com/plinqy-search:latest

# Build and push OSRM (with data)
docker build -f docker/osrm/Dockerfile -t plinqy-osrm:latest .
docker tag plinqy-osrm:latest your-account-id.dkr.ecr.eu-west-1.amazonaws.com/plinqy-osrm:latest
docker push your-account-id.dkr.ecr.eu-west-1.amazonaws.com/plinqy-osrm:latest
```

#### 2. Create ECS Task Definitions
See `aws/ecs-task-definition.json`

#### 3. Deploy to ECS
```bash
aws ecs create-service \
  --cluster plinqy-cluster \
  --service-name plinqy-search \
  --task-definition plinqy-search:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

## Step 4: Configure Load Balancer

### Application Load Balancer
```bash
# Create target groups
- plinqy-search (port 3000)
- plinqy-osrm (port 5000, internal only)

# Configure health checks
- Path: /health
- Interval: 30s
- Timeout: 5s
- Healthy threshold: 2
- Unhealthy threshold: 3

# Add SSL certificate
- Use AWS Certificate Manager
- Force HTTPS redirect
```

## Step 5: Configure CloudFront (Optional but Recommended)

```bash
# Create CloudFront distribution
- Origin: ALB DNS name
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- Cache Policy: CachingOptimized
- Origin Request Policy: AllViewer

# Custom domain
- Add CNAME: www.yourdomain.com
- SSL Certificate: From ACM
```

## Step 6: Configure DNS

```bash
# Route53 or your DNS provider
A Record: yourdomain.com → ALB IP
CNAME: www.yourdomain.com → yourdomain.com
```

## Step 7: Monitoring Setup

### CloudWatch Alarms
```bash
# CPU Utilization > 70%
aws cloudwatch put-metric-alarm \
  --alarm-name plinqy-high-cpu \
  --alarm-description "Alert when CPU exceeds 70%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 70 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Error Rate > 5%
# Latency > 2s
# OSRM Response Time > 1s
```

### CloudWatch Logs
```bash
# Enable container logging
- Log driver: awslogs
- Log group: /aws/plinqy/production
- Retention: 7 days
```

## Step 8: Security Hardening

### Security Groups
```bash
# ALB Security Group
Inbound:
  - 80 (HTTP) from 0.0.0.0/0
  - 443 (HTTPS) from 0.0.0.0/0

# Application Security Group
Inbound:
  - 3000 from ALB security group
  - 5000 from Application security group (OSRM internal)

# OSRM Security Group
Inbound:
  - 5000 from Application security group only
```

### IAM Roles
```bash
# ECS Task Role
- CloudWatch Logs write
- ECR pull images
- Secrets Manager read

# ECS Execution Role
- ECR pull images
- CloudWatch Logs write
```

### WAF Rules
```bash
# Rate limiting: 100 requests per 5 minutes per IP
# Block common attack patterns
# Geo-blocking (optional)
```

## Step 9: Backup Strategy

### Automated Backups
```bash
# EBS snapshots (daily)
aws dlm create-lifecycle-policy \
  --execution-role-arn arn:aws:iam::account-id:role/AWSDataLifecycleManagerDefaultRole \
  --description "Daily EBS snapshots" \
  --state ENABLED \
  --policy-details file://backup-policy.json

# OSRM data backup to S3
aws s3 sync ./osrm-data s3://plinqy-backups/osrm-data/
```

## Step 10: Testing

### Load Testing
```bash
# Install Apache Bench
sudo yum install httpd-tools -y

# Test search endpoint
ab -n 10000 -c 100 https://yourdomain.com/

# Test OSRM routing (internal)
ab -n 1000 -c 50 http://internal-osrm:5000/route/v1/driving/4.9041,52.3676;4.8952,52.3702
```

### Smoke Tests
```bash
# Health checks
curl https://yourdomain.com/health

# Search functionality
curl https://yourdomain.com/api/search?q=watch

# OSRM routing
curl http://internal-osrm:5000/route/v1/driving/4.9041,52.3676;4.8952,52.3702
```

## Rollback Procedure

### Quick Rollback
```bash
# ECS: Update service to previous task definition
aws ecs update-service \
  --cluster plinqy-cluster \
  --service plinqy-search \
  --task-definition plinqy-search:PREVIOUS_VERSION

# EC2: Switch Docker image tags
docker-compose -f docker-compose.prod.yml down
git checkout PREVIOUS_COMMIT
docker-compose -f docker-compose.prod.yml up -d
```

## Cost Optimization

### Reserved Instances
```bash
# Purchase 1-year reserved instance for OSRM
# Savings: ~40% ($35/month → $21/month)
```

### Auto-scaling
```bash
# Scale down during low traffic hours
# Minimum: 1 instance (night)
# Maximum: 10 instances (peak)
```

### S3 Lifecycle Policies
```bash
# Move old logs to Glacier after 30 days
# Delete after 90 days
```

## Maintenance

### Weekly Tasks
- Review CloudWatch metrics
- Check error logs
- Verify backup completion

### Monthly Tasks
- Update dependencies
- Security patches
- Cost review
- Performance optimization

### Quarterly Tasks
- Update OSRM map data
- Disaster recovery drill
- Security audit

## Troubleshooting

### OSRM Not Responding
```bash
# Check container status
docker ps | grep osrm

# Check logs
docker logs osrm-netherlands

# Restart service
docker-compose -f docker-compose.prod.yml restart osrm-netherlands
```

### High Latency
```bash
# Check CloudWatch metrics
# Verify OSRM cache hit rate
# Check database connection pool
# Review ALB target health
```

### Out of Memory
```bash
# Increase container memory limits
# Add swap space
# Optimize OSRM data loading
```

## Support Contacts

- AWS Support: https://console.aws.amazon.com/support
- OSRM Issues: https://github.com/Project-OSRM/osrm-backend/issues
- Application Issues: your-team@yourdomain.com

## Success Metrics

After deployment, verify:
- ✅ Uptime > 99.9%
- ✅ Response time < 500ms (p95)
- ✅ OSRM routing < 1s
- ✅ Error rate < 1%
- ✅ Cost < $200/month (Phase 1)
