#!/bin/bash

cd backend

echo "Starting Service Registry..."
mvn spring-boot:run -f service-registry/pom.xml > registry.log 2>&1 &

sleep 10

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

echo "Waiting for services to be up (30 seconds)..."
sleep 45
echo "Done starting services."
