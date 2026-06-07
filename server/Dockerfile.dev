FROM maven:3.9.6-eclipse-temurin-21-jammy

WORKDIR /app

COPY pom.xml .

COPY src ./src

EXPOSE 8080

CMD ["mvn", "spring-boot:run"]