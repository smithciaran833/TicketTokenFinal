#!/bin/bash

echo "=== BACKEND FILE COLLECTION ==="
echo "Generated on: $(date)"
echo "================================"

# Function to print file with header
print_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo ""
        echo "=== FILE: $file ==="
        echo "=== START OF FILE ==="
        cat "$file"
        echo "=== END OF FILE ==="
        echo ""
    fi
}

# Collect all service files
for service in backend/services/*; do
    if [ -d "$service" ]; then
        service_name=$(basename "$service")
        echo ""
        echo "========================================"
        echo "SERVICE: $service_name"
        echo "========================================"
        
        # Package files
        print_file "$service/package.json"
        print_file "$service/tsconfig.json"
        
        # Prisma schema
        print_file "$service/prisma/schema.prisma"
        
        # Source files
        print_file "$service/src/main.ts"
        
        # Controllers
        for controller in "$service/src/controllers"/*.ts; do
            print_file "$controller"
        done
        
        # Services
        for svc in "$service/src/services"/*.ts; do
            print_file "$svc"
        done
        
        # DTOs
        for dto in "$service/src/dto"/*.ts; do
            print_file "$dto"
        done
        
        # Modules
        for module in "$service/src"/*.module.ts; do
            print_file "$module"
        done
    fi
done

# Shared files
echo ""
echo "========================================"
echo "SHARED FILES"
echo "========================================"

# Shared configurations
for shared in backend/shared/*; do
    if [ -f "$shared" ]; then
        print_file "$shared"
    fi
done

# Docker files
print_file "backend/docker-compose.yml"
print_file "backend/Dockerfile"

echo ""
echo "=== COLLECTION COMPLETE ==="
