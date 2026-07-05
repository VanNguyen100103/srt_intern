# ===== Giai đoạn 1: Build frontend React =====
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Build ra thu muc dist (ghi de outDir trong vite.config.js)
RUN npm run build -- --outDir=dist --emptyOutDir

# ===== Giai đoạn 2: Build backend Spring Boot =====
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Tải dependency trước để tận dụng Docker layer cache
COPY backend/.mvn/ .mvn/
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

COPY backend/src ./src
# Nhung giao dien React da build vao static cua Spring Boot
COPY --from=frontend /app/frontend/dist ./src/main/resources/static
RUN ./mvnw package -DskipTests -q

# ===== Giai đoạn 3: Run =====
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
