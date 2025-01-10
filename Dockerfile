FROM ghcr.io/puppeteer/puppeteer:23.10.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
# Копируем файл .env в контейнер
COPY .env /app/.env

# Устанавливаем переменные среды из .env
RUN export $(cat /app/.env | xargs)

# Удаляем файл .env после использования
RUN rm /app/.env
RUN npm ci
COPY . .
CMD ["nodemon", "--exec", "babel-node", "src/app.js"]