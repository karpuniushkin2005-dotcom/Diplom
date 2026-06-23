#!/usr/bin/env node

import autocannon from 'autocannon';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_JSON = path.join(ROOT, 'reports', 'load-test-results.json');
const API = process.env.API_URL || 'http://localhost:3000';
const VUSERS = Number(process.env.LOAD_USERS || 50);
const DURATION = Number(process.env.LOAD_DURATION || 60);

const SCENARIOS = [
  { name: 'GET /api/programs', method: 'GET', path: '/api/programs' },
  { name: 'GET /api/coaches', method: 'GET', path: '/api/coaches' },
  { name: 'GET /api/schedule', method: 'GET', path: '/api/schedule' },
  { name: 'GET / (главная SPA)', method: 'GET', path: '/' },
  {
    name: 'POST /api/login',
    method: 'POST',
    path: '/api/login',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@fitness.local', password: 'admin123' }),
  },
];

function runScenario(scenario) {
  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url: `${API}${scenario.path}`,
      method: scenario.method,
      headers: scenario.headers,
      body: scenario.body,
      connections: VUSERS,
      duration: DURATION,
      pipelining: 1,
    }, (err, result) => {
      if (err) reject(err);
      else resolve({ scenario, result });
    });
    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  console.log(`\nНагрузочный тест IMPULSE`);
  console.log(`Цель: ${API}`);
  console.log(`Виртуальных пользователей: ${VUSERS}`);
  console.log(`Длительность сценария: ${DURATION} с\n`);

  const started = Date.now();
  const endpoints = [];
  const timeline = {};
  let totalRequests = 0;
  let totalErrors = 0;
  const allLatencies = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n→ ${scenario.name}`);
    const { result } = await runScenario(scenario);
    const count = result.requests.total;
    const errors = result.errors;
    totalRequests += count;
    totalErrors += errors;
    const avg = result.latency.mean;
    const p95 = result.latency.p95;
    allLatencies.push(avg);
    timeline[scenario.name] = result.latency.samples || [];

    endpoints.push({
      name: scenario.name,
      count,
      avg_ms: Math.round(avg * 10) / 10,
      p95_ms: Math.round(p95 * 10) / 10,
      min_ms: Math.round(result.latency.min * 10) / 10,
      max_ms: Math.round(result.latency.max * 10) / 10,
      throughput_rps: Math.round((result.throughput.mean / 1024) * 100) / 100,
      errors,
      error_rate: count ? Math.round((errors / count) * 10000) / 100 : 0,
    });
  }

  const elapsed = (Date.now() - started) / 1000;
  const payload = {
    meta: {
      target: API,
      duration_sec: Math.round(elapsed * 10) / 10,
      virtual_users: VUSERS,
      scenario_duration_sec: DURATION,
      ramp_sec: 0,
      total_requests: totalRequests,
      throughput_rpm: Math.round((totalRequests / elapsed) * 60 * 10) / 10,
      timestamp: new Date().toLocaleString('ru-RU'),
    },
    endpoints,
    summary: {
      avg_ms: Math.round((allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length) * 10) / 10,
      total_errors: totalErrors,
      error_rate: totalRequests ? Math.round((totalErrors / totalRequests) * 10000) / 100 : 0,
    },
  };

  for (const ep of endpoints) {
    const samples = timeline[ep.name] || [];
    const step = Math.max(1, Math.floor(samples.length / 80));
    payload[`timeline_${ep.name}`] = samples
      .filter((_, i) => i % step === 0)
      .map((ms, i) => [started / 1000 + i, ms]);
  }

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`\nИтого: ${totalRequests} запросов, среднее ${payload.summary.avg_ms} мс, ошибок ${totalErrors}`);
  console.log(`Сохранено: ${OUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
