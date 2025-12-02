# ============================
#        BUILD STAGE
# ============================
FROM node:16 AS build

# Ставимо фіксовану робочу директорію
WORKDIR /app

# Копіюємо тільки файли залежностей — важливо для кешу!
COPY package.json package-lock.json ./

# Старий проект → npm ci може ламати
# Тому ставимо:
# --legacy-peer-deps   щоб уникнути peer dependency hell
# --unsafe-perm        бо старі gulp/plugins часто вимагають
RUN npm install --legacy-peer-deps --unsafe-perm

# Далі копіюємо решту
COPY . .

# Перевіряємо наявність gulp
RUN npx gulp --version || npm install -g gulp-cli

# Будуємо проект
RUN npm run build


# ============================
#        NGINX STAGE
# ============================
FROM nginx:alpine

# Очищаємо станд. конфіг Nginx і замінюємо своїм, якщо потрібно
# COPY nginx.conf /etc/nginx/nginx.conf

# Кидаємо зібраний фронтенд
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
