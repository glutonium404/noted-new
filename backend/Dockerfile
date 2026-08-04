# Stage 1: Build the app using JDK 25 & Maven
FROM maven:3-amazoncorretto-25 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Stage 2: Runtime container with Java 25 JRE/JDK
FROM amazoncorretto:25-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# The SQLite database file lives here (see application.properties /
# NOTED_DB_PATH). Declared as a volume so, on a host that mounts a real
# volume or persistent disk at this path, data survives container
# restarts/redeploys instead of living only in the container's writable
# layer.
RUN mkdir -p /app/db
VOLUME ["/app/db"]

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
