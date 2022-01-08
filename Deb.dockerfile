FROM debian:latest
ENV DEBIAN_FRONTEND="noninteractive"
RUN apt update && apt install -y dpkg-dev
WORKDIR /app_build