FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY build/libs/iot-timeseries-collector-0.0.1.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]