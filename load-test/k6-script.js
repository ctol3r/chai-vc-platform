import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50,
  duration: '1m',
};

export default function () {
  const res = http.get('http://localhost:3000/api/health');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
