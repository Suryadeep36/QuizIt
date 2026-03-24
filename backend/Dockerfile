# Stage 1: Build
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# DO NOT use backend/backend
COPY . .

RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=$PORT"]