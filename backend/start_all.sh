#!/bin/bash
cd "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend"

if [ -f .env ]; then
    echo "Loading environment variables from backend/.env..."
    set -a
    source .env
    set +a
fi

echo "Starting service-registry..."
cd service-registry
nohup mvn spring-boot:run > ../registry.log 2>&1 &
cd ..
sleep 5

for service in iam-service organization-service doctor-service appointment-service patient-service encounter-service billing-service api-gateway; do
    echo "Starting $service..."
    cd $service
    nohup mvn spring-boot:run > "../$service.log" 2>&1 &
    cd ..
done

echo "All services started."
