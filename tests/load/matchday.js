import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics
const statsDuration = new Trend('stats_req_duration');
const storeDuration = new Trend('store_req_duration');
const transparencyDuration = new Trend('transparency_req_duration');
const checkinDuration = new Trend('checkin_req_duration');

export const options = {
  stages: [
    { duration: '1m', target: 500 },  // Ramp up to 500 users
    { duration: '8m', target: 500 },  // Hold 500 users for 8 minutes
    { duration: '1m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_failed': ['rate<0.001'],  // Error rate must be less than 0.1%
  },
};

export default function () {
  const baseUrl = __ENV.API_URL || 'http://localhost:3001';
  const eventId = __ENV.EVENT_ID || '00000000-0000-0000-0000-000000000000';
  const token = __ENV.QR_TOKEN || 'dummy-token';

  // Randomize actions to simulate a matchday scenario
  const action = Math.random();

  if (action < 0.4) {
    // 40% chance: Check members stats (public counter)
    const res = http.get(`${baseUrl}/stats/members`);
    statsDuration.add(res.timings.duration);
    check(res, {
      'stats status is 200': (r) => r.status === 200,
    });
  } else if (action < 0.7) {
    // 30% chance: Browse products
    const res = http.get(`${baseUrl}/store/products`);
    storeDuration.add(res.timings.duration);
    check(res, {
      'store status is 200': (r) => r.status === 200,
    });
  } else if (action < 0.9) {
    // 20% chance: View transparency portal
    const res = http.get(`${baseUrl}/transparency/posts`);
    transparencyDuration.add(res.timings.duration);
    check(res, {
      'transparency status is 200': (r) => r.status === 200,
    });
  } else {
    // 10% chance: Check-in validation
    const payload = JSON.stringify({ token: token });
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const res = http.post(`${baseUrl}/events/${eventId}/checkin`, payload, params);
    checkinDuration.add(res.timings.duration);
    check(res, {
      // 401/404 are acceptable since we might be using dummy data,
      // but the main goal is load testing the endpoint throughput.
      // If valid data is provided, it should be 200.
      'checkin responded': (r) => r.status === 200 || r.status === 404 || r.status === 401,
    });
  }

  // Think time between 0.5s and 2s
  sleep(Math.random() * 1.5 + 0.5);
}
