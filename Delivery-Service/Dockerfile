FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/Delivery-Service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9010
ENTRYPOINT ["java", "-jar", "app.jar"]