/// <reference types="node" />
import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: baseUrl,
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'pnpm dev',
    url: baseUrl,
    reuseExistingServer: true,
    cwd: currentDir,
    timeout: 120_000,
  },
});
