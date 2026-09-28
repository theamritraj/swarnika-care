#!/bin/bash
cd "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend"

if [ -f .env ]; then
    echo "Loading environment variables from backend/.env..."
    set -a
    source .env
    set +a
fi

# Apply memory limits for local dev
export MAVEN_OPTS="-Xms128m -Xmx256m"
export SPRING_BOOT_ARGS="-Dspring-boot.run.jvmArguments='-Xms128m -Xmx256m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC'"

# Check if service-registry is already up
if ! curl -s http://localhost:8761 > /dev/null; then
    echo "Starting service-registry..."
    cd service-registry
    nohup mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xms128m -Xmx256m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC" > ../registry.log 2>&1 &
    cd ..
    sleep 10
else
    echo "service-registry already running."
fi

for service in iam-service organization-service doctor-service appointment-service patient-service encounter-service billing-service nursing-service lab-service pharmacy-service ipd-service notification-service api-gateway; do
    echo "Starting $service..."
    cd $service
    nohup mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xms128m -Xmx256m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC" > "../$service.log" 2>&1 &
    cd ..
    sleep 5 # Stagger startup to avoid OOM killer spikes
done

echo "All services started."

