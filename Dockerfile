# ===== Giai đoạn 1: Build =====
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Tải dependency trước để tận dụng Docker layer cache
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Build ứng dụng
COPY src ./src
RUN ./mvnw package -DskipTests -q

# ===== Giai đoạn 2: Run =====
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
