FROM node:22-alpine AS build

ARG SYNCFUSION_LICENSE
ENV SYNCFUSION_LICENSE=${SYNCFUSION_LICENSE}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npx syncfusion-license activate
RUN export SYNCFUSION_LICENSE=""

RUN npm run build

FROM node:22-alpine AS deploy

WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
RUN npm ci --only=production

# Copy the build output (assuming a Next.js app using .next and public folders)
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]