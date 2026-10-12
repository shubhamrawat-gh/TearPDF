FROM node:24-bookworm-slim AS frontend
WORKDIR /source/frontend
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
COPY app/core/src/main/resources/static/fonts/ /source/app/core/src/main/resources/static/fonts/
RUN npm run build

FROM eclipse-temurin:25-jdk-noble AS backend
WORKDIR /source
COPY . .
COPY --from=frontend /source/frontend/editor/dist/ frontend/editor/dist/
RUN chmod +x gradlew && ./gradlew :tearpdf:bootJar -PbuildWithFrontend=false -PbuildWithPortal=false -PjpdfiumPlatforms=linux-x64 --no-daemon

FROM eclipse-temurin:25-jre-noble
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin ghostscript qpdf libreoffice-writer libreoffice-impress libreoffice-calc imagemagick fonts-dejavu-core fontconfig && python3 -m venv /opt/venv && /opt/venv/bin/pip install --no-cache-dir ocrmypdf fonttools && rm -rf /var/lib/apt/lists/*
ENV PATH="/opt/venv/bin:${PATH}" SERVER_ADDRESS=0.0.0.0 SERVER_PORT=8080
WORKDIR /app
COPY --from=backend /source/app/core/build/libs/TearPDF.jar /app/TearPDF.jar
COPY LICENSE COPYRIGHT /app/
RUN useradd --uid 10001 --create-home tearpdf && mkdir -p data configs customFiles pipeline /documents && chown -R tearpdf:tearpdf /app /documents
USER tearpdf
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx2g", "-jar", "/app/TearPDF.jar"]
