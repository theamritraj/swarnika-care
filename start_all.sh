#!/bin/bash
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo " Starting Swarnika Care: All Microservices and Servers"
echo "=========================================================="

# 1. Stop any existing instances first
"$PROJECT_DIR/stop_all.sh"
sleep 2

# 2. Check prerequisites (MySQL & Redis)
echo "Checking prerequisites..."
if ! nc -z localhost 3306 2>/dev/null; then
  echo "⚠️ Warning: MySQL is not running on port 3306. Starting via brew..."
  brew services start mysql 2>/dev/null || true
  sleep 3
fi

if ! nc -z localhost 6379 2>/dev/null; then
  echo "⚠️ Warning: Redis is not running on port 6379. Starting via brew..."
  brew services start redis 2>/dev/null || true
  sleep 2
fi

# 3. Start Backend Services
echo "----------------------------------------------------------"
echo "Starting Backend Microservices..."
echo "----------------------------------------------------------"
cd "$PROJECT_DIR/backend"

if [ -f .env ]; then
  echo "Loading environment variables from backend/.env..."
  export $(grep -v '^#' .env | xargs)
elif [ -f "$PROJECT_DIR/.env" ]; then
  echo "Loading environment variables from project .env..."
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

mkdir -p "$PROJECT_DIR/logs"

echo "1/14. Starting Service Registry (Eureka on port 8761)..."
mvn spring-boot:run -f service-registry/pom.xml > "$PROJECT_DIR/logs/registry.log" 2>&1 &
echo "Waiting for Eureka Registry to initialize..."
sleep 15

echo "2/14. Starting API Gateway (port 8080)..."
mvn spring-boot:run -f api-gateway/pom.xml > "$PROJECT_DIR/logs/gateway.log" 2>&1 &

echo "3/14. Starting IAM Service (port 8081)..."
mvn spring-boot:run -f iam-service/pom.xml > "$PROJECT_DIR/logs/iam.log" 2>&1 &

echo "4/14. Starting Organization Service (port 8082)..."
mvn spring-boot:run -f organization-service/pom.xml > "$PROJECT_DIR/logs/organization.log" 2>&1 &

echo "5/14. Starting Doctor Service (port 8083)..."
mvn spring-boot:run -f doctor-service/pom.xml > "$PROJECT_DIR/logs/doctor.log" 2>&1 &

echo "6/14. Starting Patient Service (port 8084)..."
mvn spring-boot:run -f patient-service/pom.xml > "$PROJECT_DIR/logs/patient.log" 2>&1 &

echo "7/14. Starting Appointment Service (port 8085)..."
mvn spring-boot:run -f appointment-service/pom.xml > "$PROJECT_DIR/logs/appointment.log" 2>&1 &

echo "8/14. Starting Notification Service (port 8086)..."
mvn spring-boot:run -f notification-service/pom.xml > "$PROJECT_DIR/logs/notification.log" 2>&1 &

echo "9/14. Starting Encounter Service (port 8087)..."
mvn spring-boot:run -f encounter-service/pom.xml > "$PROJECT_DIR/logs/encounter.log" 2>&1 &

echo "10/14. Starting Nursing Service (port 8088)..."
mvn spring-boot:run -f nursing-service/pom.xml > "$PROJECT_DIR/logs/nursing.log" 2>&1 &

echo "11/14. Starting Billing Service (port 8089)..."
mvn spring-boot:run -f billing-service/pom.xml > "$PROJECT_DIR/logs/billing.log" 2>&1 &

echo "12/14. Starting Pharmacy Service (port 8090)..."
mvn spring-boot:run -f pharmacy-service/pom.xml > "$PROJECT_DIR/logs/pharmacy.log" 2>&1 &

echo "13/14. Starting IPD Service (port 8091)..."
mvn spring-boot:run -f ipd-service/pom.xml > "$PROJECT_DIR/logs/ipd.log" 2>&1 &

echo "14/14. Starting Lab Service (port 8092)..."
mvn spring-boot:run -f lab-service/pom.xml > "$PROJECT_DIR/logs/lab.log" 2>&1 &

# 4. Start Frontends
echo "----------------------------------------------------------"
echo "Starting Frontends..."
echo "----------------------------------------------------------"

if [ -d "$PROJECT_DIR/frontend/care" ]; then
  echo "Starting Care Portal Frontend (port 3001)..."
  cd "$PROJECT_DIR/frontend/care"
  nohup npm run dev > "$PROJECT_DIR/logs/frontend-care.log" 2>&1 &
fi

if [ -d "$PROJECT_DIR/frontend/public-website" ]; then
  echo "Starting Public Website Frontend (port 3000)..."
  cd "$PROJECT_DIR/frontend/public-website"
  nohup npm run dev > "$PROJECT_DIR/logs/frontend-public.log" 2>&1 &
fi

echo "----------------------------------------------------------"
echo "Waiting for services to warm up (35 seconds)..."
echo "----------------------------------------------------------"
sleep 35

echo "=========================================================="
echo " Swarnika Care is running!"
echo " Logs are saved in $PROJECT_DIR/logs/"
echo " - Eureka Service Registry: http://localhost:8761"
echo " - API Gateway:             http://localhost:8080"
echo " - Care Portal (Next.js):   http://localhost:3001"
echo " - Public Website:          http://localhost:3000"
echo "=========================================================="
