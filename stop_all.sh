#!/bin/bash
echo "Stopping all Swarnika Care services and servers..."

# Stop backend services on their ports
echo "Stopping backend services (ports 8761, 8080-8095)..."
lsof -ti :8761,8080,8081,8082,8083,8084,8085,8086,8087,8088,8089,8090,8091,8092,8093,8094,8095 2>/dev/null | xargs kill -9 2>/dev/null || true
pkill -f "spring-boot:run" 2>/dev/null || true

# Stop frontend servers
echo "Stopping frontend servers (ports 3000, 3001)..."
lsof -ti :3000,3001 2>/dev/null | xargs kill -9 2>/dev/null || true

sleep 2
echo "All Swarnika Care services and servers have been stopped."
