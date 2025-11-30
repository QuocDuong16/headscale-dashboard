# Base stage: Dùng Alpine cho toàn bộ quy trình để đồng nhất
FROM node:20-alpine3.19 AS base

# FIX: Cài pnpm bằng npm cho ổn định, tránh lỗi verify signature của corepack
# Dùng version cụ thể từ package.json
RUN npm install -g pnpm@10.24.0

# Deps stage: Cài dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# TUYỆT CHIÊU CUỐI: node-linker=hoisted
# Ép pnpm chạy ở chế độ phẳng (giống npm), loại bỏ hoàn toàn folder .pnpm (204MB)
# Giúp Next.js standalone copy file chính xác hơn
RUN echo "node-linker=hoisted" > .npmrc

# Use BuildKit cache mount for pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Important: HEADSCALE_API_URL is a RUNTIME environment variable, not a build argument
# DO NOT set it here or pass it as --build-arg
# It will be read from process.env when the container runs
# This allows one image to work for all users with different Headscale servers
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Cleanup: Xóa cache của Next.js
RUN rm -rf .next/cache .next/trace node_modules/.cache

# DỌN RÁC: Với cấu trúc phẳng (hoisted), cleanup sẽ hiệu quả hơn gấp 10 lần
RUN cd .next/standalone/node_modules && \
    # 1. Xóa TypeScript (Tiết kiệm ~22MB) - devDependency không cần trong production
    rm -rf typescript 2>/dev/null || true && \
    # 2. Xóa SWC binaries không cần thiết (Tiết kiệm ~60-80MB)
    # Vì cấu trúc đã phẳng, ta có thể xóa trực tiếp trong @next/swc-*
    rm -rf @next/swc-win32* 2>/dev/null || true && \
    rm -rf @next/swc-darwin* 2>/dev/null || true && \
    rm -rf @next/swc-linux-x64-gnu* 2>/dev/null || true && \
    # Chỉ giữ lại @next/swc-linux-x64-musl (cho Alpine) \
    # 3. Xóa các dev dependencies khác
    rm -rf @types 2>/dev/null || true && \
    rm -rf eslint* 2>/dev/null || true && \
    rm -rf tailwindcss 2>/dev/null || true && \
    rm -rf @tailwindcss 2>/dev/null || true && \
    # 4. Dọn dẹp file rác thông thường (Tiết kiệm ~10-20MB)
    find . -name "*.map" -type f -delete && \
    find . -name "*.d.ts" -type f -delete && \
    find . -name "*.md" -type f -delete && \
    find . -name "LICENSE" -type f -delete && \
    find . -name "README*" -type f -delete

# Runner stage: "Nuclear Option" - Dùng Alpine trần (7MB) thay vì node:20-alpine (170MB)
# Tránh vấn đề Docker layers: thay vì xóa npm/yarn (chỉ tạo whiteout), ta bắt đầu từ Alpine trần
FROM alpine:3.19 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Cài đặt thư viện tối thiểu để chạy được binary Node.js
RUN apk add --no-cache libstdc++ libgcc ca-certificates

# COPY BINARY NODE.JS TỪ BUILDER SANG (Magic happens here!)
# Chỉ lấy file chạy node, bỏ qua npm, yarn, corepack... (tiết kiệm ~100MB)
# Với Next.js standalone mode, không cần copy node_modules từ base image
# vì tất cả dependencies đã được bundle vào .next/standalone rồi
COPY --from=builder /usr/local/bin/node /usr/bin/node

# Setup user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy files theo thứ tự tối ưu (nhỏ nhất trước để tận dụng layer caching)
# Copy public folder (usually small)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Tạo thư mục .next và set permission
RUN mkdir -p .next/static && \
    chown -R nextjs:nodejs .next

# Copy static files (CSS, JS, fonts, images) - changes frequently
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy standalone output last (largest, changes least)
# Standalone folder đã tự động chứa node_modules tối giản
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

