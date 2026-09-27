#!/bin/bash
set -e

echo "Compiling all projects..."
for d in backend/*-service backend/api-gateway; do
  echo "Compiling $d"
  cd "$d"
  mvn clean package -DskipTests
  cd -
done

echo "Starting Discovery Service (8761)..."
java -jar backend/service-discovery/target/service-discovery-0.0.1-SNAPSHOT.jar &
DISCOVERY_PID=$!
sleep 15

echo "Starting API Gateway (8080)..."
java -jar backend/api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar &
GATEWAY_PID=$!

echo "Starting IAM Service (8085)..."
java -jar backend/iam-service/target/iam-service-0.0.1-SNAPSHOT.jar &
IAM_PID=$!

echo "Starting Organization Service (8084)..."
java -jar backend/organization-service/target/organization-service-0.0.1-SNAPSHOT.jar &
ORG_PID=$!

echo "Starting Doctor Service (8082)..."
java -jar backend/doctor-service/target/doctor-service-0.0.1-SNAPSHOT.jar &
DOC_PID=$!

echo "Waiting for services to start..."
sleep 45

echo "All services started. Ready for E2E tests."
wait
