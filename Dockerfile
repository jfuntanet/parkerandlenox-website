FROM node:20.19-alpine AS builder
WORKDIR /app
# NEXT_PUBLIC_APP_URL debe estar disponible en build time — Next.js lo hornea en sitemap/robots (SSG).
ARG NEXT_PUBLIC_APP_URL=https://parkerandlenox.com
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.19-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
USER nextjs
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "server.js"]
