#!/bin/bash
echo "Terminating any existing backend service processes on ports 8761, 8080-8095..."
lsof -ti :8761,8080,8081,8082,8083,8084,8085,8086,8087,8088,8089,8090,8091,8092,8093,8094 | xargs kill -9 2>/dev/null || true
pkill -f "spring-boot:run" 2>/dev/null || true
sleep 2

cd backend
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
fi

echo "Starting Service Registry..."
mvn spring-boot:run -f service-registry/pom.xml > registry.log 2>&1 &
sleep 15

echo "Starting API Gateway..."
mvn spring-boot:run -f api-gateway/pom.xml > gateway.log 2>&1 &

echo "Starting IAM Service..."
mvn spring-boot:run -f iam-service/pom.xml > iam.log 2>&1 &

echo "Starting Organization Service..."
mvn spring-boot:run -f organization-service/pom.xml > org.log 2>&1 &

echo "Starting Doctor Service..."
mvn spring-boot:run -f doctor-service/pom.xml > doctor.log 2>&1 &

echo "Starting Patient Service..."
mvn spring-boot:run -f patient-service/pom.xml > patient.log 2>&1 &

echo "Starting Appointment Service..."
mvn spring-boot:run -f appointment-service/pom.xml > appointment.log 2>&1 &

echo "Starting Notification Service..."
mvn spring-boot:run -f notification-service/pom.xml > notification.log 2>&1 &

echo "Starting Encounter Service..."
mvn spring-boot:run -f encounter-service/pom.xml > encounter.log 2>&1 &

echo "Starting Nursing Service..."
mvn spring-boot:run -f nursing-service/pom.xml > nursing.log 2>&1 &

echo "Starting Billing Service..."
mvn spring-boot:run -f billing-service/pom.xml > billing.log 2>&1 &

echo "Starting Pharmacy Service..."
mvn spring-boot:run -f pharmacy-service/pom.xml > pharmacy.log 2>&1 &

echo "Starting IPD Service..."
mvn spring-boot:run -f ipd-service/pom.xml > ipd.log 2>&1 &

echo "Starting Lab Service..."
mvn spring-boot:run -f lab-service/pom.xml > lab.log 2>&1 &

echo "Starting Media Service..."
mvn spring-boot:run -f media-service/pom.xml > media.log 2>&1 &

echo "Waiting for services to be up (45 seconds)..."
sleep 45
echo "Done starting services."
