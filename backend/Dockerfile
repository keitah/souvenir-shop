FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

ARG GRADLE_VERSION=8.10.2

# Ставим нужный Gradle 8.10.2 вручную
RUN apt-get update && apt-get install -y wget unzip \
    && wget https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip \
    && unzip gradle-${GRADLE_VERSION}-bin.zip -d /opt/gradle \
    && ln -s /opt/gradle/gradle-${GRADLE_VERSION}/bin/gradle /usr/bin/gradle \
    && rm gradle-${GRADLE_VERSION}-bin.zip \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN gradle bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
