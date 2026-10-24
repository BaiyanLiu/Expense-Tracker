# Build stage: Maven also downloads Node, runs npm install and webpack (frontend-maven-plugin),
# so the React bundle is built fresh inside the image.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY package.json package-lock.json* tsconfig.json webpack.config.js ./
COPY src ./src
RUN mvn -B -DskipTests package

# Run stage: just a JRE and the jar, with the database embedded (H2, stored in /data).
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system expensetracker && mkdir /data && chown expensetracker /data
COPY --from=build /app/target/expensetracker-0.0.1-SNAPSHOT.jar app.jar
USER expensetracker

# Never "dev": that profile sets ddl-auto=create and loads sample data, which wipes the database.
ENV SPRING_PROFILES_ACTIVE=prod,embedded
ENV EXPENSE_DATA_DIR=/data
# Keeps the database outside the container, so it survives rebuilds even when no volume is named.
VOLUME /data
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
