FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY client/ client/
COPY server/ server/
RUN mvn -f server/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /build/server/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
