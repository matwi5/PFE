// src/app/api/metrics/route.ts

import { Counter, collectDefaultMetrics, register } from 'prom-client';

// Créer un compteur
const counter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests made',
  labelNames: ['method', 'status'],
});

// Collecte des métriques par défaut
collectDefaultMetrics({ register });

// Définir la méthode GET
export async function GET() {
  // Incrémentez le compteur à chaque requête
  counter.inc({ method: 'GET', status: '200' }, 1);

  // Retourner les métriques au format Prometheus
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType },
  });
}

