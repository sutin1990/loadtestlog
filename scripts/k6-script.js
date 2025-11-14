import http from "k6/http";
import { check, sleep } from "k6";

// Config ของ load test
export let options = {
  thresholds: {
    // ค่า SLA ที่อยากให้ผ่าน
    http_req_duration: ["p(95)<140000"], // 95% ของ request ต้องใช้เวลา < 500ms
    http_req_failed: ["rate<0.01"],   // error rate < 1%
  },

  stages: [
    // Warm-up (smoke)
    { duration: "10s", target: 5 },   // จาก 0 → 5 VUs

    // Load (steady state)
    { duration: "30s", target: 20 },  // คงที่ 20 VUs 30 วินาที

    // Stress (peak)
    { duration: "20s", target: 50 },  // เพิ่มขึ้นเป็น 50 VUs

    // Recovery (cool down)
    { duration: "10s", target: 0 },
  ],
};

// จุดหลักในการยิง API
export default function () {
  // const res = http.get("http://loadtestlog-restapitest-1:5213/api/GetMockData", {
  //   headers: { Accept: "application/json" },
  // });

const url = 'https://host.docker.internal:5001/v3/query/QueryOrderDetail';  // เปลี่ยน localhost เป็น host.docker.internal ถ้าใช้ Docker

  const payload = JSON.stringify({
    "CUSTOMER_NAME": "",
    "CUSTOMER_LAST_NAME": "",
    "LIST_ORDER_NO": [
      "SBN-NW-201507-000300",
      "FBB-BC-201811-004942",
      "AIR-NW-201507-000014",
      "AIR-BC-201612-001988",
      "AIR-NW-201804-006749",
      "AIR-NW-202409-000269",
      "AIR-NW-202410-000230"
    ],
    "LIST_CARD_NO": [
      "AIR-NW-202202-026867",
      "AIR-NW-202202-026865",
      "AIR-NW-202202-026858"
    ],
    "LIST_NON_MOBILE_NO": [],
    "LIST_CONTACT_MOBILE_NO": []
  });

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'x-online-query-transaction-id': '202511120751199526346',
    'x-online-query-channel': 'IntegrationTest',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJnQ1lLUEYvV2w2blV5NFBqbWdLZWU1V21ZR1h3L1Rvb1VmUnRaS3AxSTRPVUpoejBlaktrKzVBNmVCUVNFaTRSZ3FXY09ITm5zU2tTOUM4NEwwWEt0Slp5cFF0b1lBWlB2S083ZldEUTVYVT0iLCJqdGkiOiI4YjE4ZjE5OC03YzdkLTQ0OGEtYjFjNC05ZmZjNmYyZGUxMDEiLCJuYmYiOjE2OTQ1MDM3MTEsImV4cCI6MTY5NDUwNTUxMSwiaWF0IjoxNjk0NTAzNzExfQ.paOjYdvLSsGyu9NmPg65UihJorDRDTgIi6klyMwUtNE'
  };

  const res = http.post(url, payload, { headers });

  // ตรวจสอบผลลัพธ์ (assertion)
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  // หน่วงระหว่าง request (จำลองผู้ใช้จริง)
  sleep(0.3);
}