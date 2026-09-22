# Образ для разработки: vite с горячей перезагрузкой.
# Debian, а не alpine, — нативные бинарники rolldown/esbuild берутся под glibc,
# как и в package-lock.json, собранном на хосте.
FROM node:24-slim

# vite лежит в devDependencies, поэтому production-режим их бы выбросил.
ENV NODE_ENV=development

WORKDIR /app

# Зависимости отдельным слоем: правка исходников не переустанавливает их заново.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
