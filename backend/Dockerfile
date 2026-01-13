# Stage 1: Build the project
FROM eclipse-temurin:25-jdk-jammy AS builder

WORKDIR /app
COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the app
FROM eclipse-temurin:25-jre-jammy

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 3000

ENTRYPOINT ["java", "--add-opens=java.base/sun.misc=ALL-UNNAMED", "-jar", "app.jar"]
