ARG JAVA_VERSION=17

FROM maven:3-eclipse-temurin-${JAVA_VERSION}-alpine AS builder
ARG MAVEN_OPTS="-Dmaven.test.skip=true"
WORKDIR /app
COPY . .
RUN mvn clean package ${MAVEN_OPTS}

FROM eclipse-temurin:${JAVA_VERSION}-jre-alpine AS production
ARG JAVA_OPTS="-Xms256m -Xmx2048m -XX:ActiveProcessorCount=1"
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

LABEL authors="sinenomine"