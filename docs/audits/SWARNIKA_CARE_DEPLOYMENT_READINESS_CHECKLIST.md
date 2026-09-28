# SWARNIKA CARE — DEPLOYMENT READINESS CHECKLIST

## 1. Infrastructure Checks
- [x] Docker Compose configured for MySQL, Redis, Zookeeper, Kafka
- [x] Memory constraints (-Xms, -Xmx) validated for local / staging clusters
- [x] Service Registry Eureka configuration valid
- [x] API Gateway proxy configuration valid

## 2. Cloud / Production Deployment Actions (Pending)
- [ ] AWS RDS MySQL Provisioning
- [ ] AWS MSK (Managed Kafka) Provisioning
- [ ] AWS ElastiCache (Redis) Provisioning
- [ ] ECS / EKS Kubernetes Cluster Provisioning for Microservices
- [ ] Vercel / AWS Amplify deployment for Next.js Frontends

## 3. Environment Secrets (Pending)
- [ ] Replace local dummy keys with KMS/SecretsManager managed keys.
- [ ] Rotate `swarnika-iam` JWT RSA Key pair for Production.
- [ ] Rotate MySQL root/app credentials.

## 4. Monitoring & Logging (Pending)
- [ ] Attach Zipkin / Jaeger distributed tracing properly in Production.
- [ ] Wire Spring Boot Actuator to Prometheus & Grafana.
- [ ] Route console logs to CloudWatch/ELK stack.

## 5. Security & Domains (Pending)
- [ ] Obtain SSL/TLS Certificates for Domain.
- [ ] Redirect all HTTP to HTTPS at Load Balancer.
- [ ] Restrict CORS exactly to production frontend domain.

The application codebase is complete. Execution of this checklist will bring the software to a live production state.
