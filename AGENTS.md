# Antigravity Alarms Analytics API - Technical Task Specification

## 📌 Mục Tiêu Hệ Thống

Xây dựng một hệ thống API hiệu năng cao phục vụ truy vấn, tổng hợp và phân tích dữ liệu cảnh báo (Alarm Analytics) từ ClickHouse kết hợp với Metadata được lưu trong PostgreSQL.

Hệ thống phải hỗ trợ:

* Query dữ liệu alarm theo điều kiện lọc.
* Aggregation theo Time Bucket.
* Group By nhiều chiều.
* Top-N Analytics.
* Data Federation giữa ClickHouse và PostgreSQL.
* Tài liệu API tự động bằng Swagger/OpenAPI.
* Khả năng mở rộng đến hàng trăm triệu bản ghi.

---

# 📌 Yêu Cầu Nền Tảng & Công Nghệ

Toàn bộ hệ thống phải được hiện thực hóa bằng:

* Node.js (ES2022+)
* TypeScript (ưu tiên) hoặc JavaScript ES6+
* Express.js 

## Thư viện bắt buộc

### ClickHouse

Sử dụng thư viện chính thức:

```bash
npm install @clickhouse/client
```

### PostgreSQL

Sử dụng:

```bash
npm install pg
```

Không sử dụng ORM.

### Validation

Bắt buộc sử dụng:

```bash
npm install zod
```

Không validate thủ công bằng if/else.

### Logging

Bắt buộc sử dụng:

```bash
npm install pino
```

### Swagger

```bash
npm install swagger-ui-express swagger-jsdoc
```

---

# 📌 Kiến Trúc Hệ Thống

Áp dụng kiến trúc phân tầng:

```text
Request
  ↓
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

## Trách nhiệm từng tầng

### Route

* Định tuyến request.
* Gắn middleware.

### Controller

Chỉ xử lý:

* nhận request
* trả response
* gọi service

Không chứa business logic.

### Service

Chứa:

* business logic
* data federation
* mapping dữ liệu
* aggregation logic

### Repository

Chứa:

* câu lệnh SQL
* ClickHouse query
* database access

### Database Layer

Quản lý:

* connection pool
* retry policy

---

# ⚠️ Nguyên Tắc Federation Giữa ClickHouse Và PostgreSQL

Không được join trực tiếp hai database.

Phải thực hiện theo quy trình:

## Bước 1

Query dữ liệu từ ClickHouse.

Ví dụ:

```sql
SELECT
  alarm_id,
  device_id,
  severity,
  status
FROM alarms
```

## Bước 2

Tạo danh sách device_id duy nhất.

Ví dụ:

```javascript
const ids = [...new Set(deviceIds)];
```

## Bước 3

Query PostgreSQL:

```sql
SELECT *
FROM devices
WHERE id IN (...)
```

## Bước 4

Map dữ liệu tại tầng Service.

Ví dụ:

```javascript
alarm.device = deviceMap[alarm.device_id];
```

---

# ⚠️ Time Window Bound (Bắt Buộc)

Mọi API truy vấn ClickHouse phải giới hạn thời gian.

## Input

```text
from_time
to_time
```

## Nếu người dùng không truyền

Tự động:

```text
to_time = now()
from_time = now() - 7 days
```

---

# ⚠️ ClickHouse Optimization Rules

## Không được sử dụng

```sql
SELECT *
```

Luôn chỉ định danh sách cột cụ thể.

---

## Ưu tiên lọc

```sql
severity
status
timestamp
```

---

## Tận dụng LowCardinality

Các trường:

```sql
severity
status
```

được định nghĩa:

```sql
LowCardinality(String)
```

Ưu tiên:

```sql
WHERE severity = 'critical'
```

hoặc

```sql
GROUP BY severity
```

trước các trường cardinality cao.

---

## PREWHERE

Nếu schema hỗ trợ:

```sql
PREWHERE timestamp BETWEEN ...
```

phải được ưu tiên sử dụng.

---

# ⚠️ Connection Management

## PostgreSQL

Sử dụng Pool.

Ví dụ:

```javascript
new Pool({
  max: 20
});
```

---

## ClickHouse

Client phải là Singleton.

Ví dụ:

```javascript
const clickhouseClient = createClient(...);
```

Khởi tạo duy nhất một lần khi start app.

Không được tạo mới cho từng request.

---

# ⚠️ Query Timeout

## PostgreSQL

```text
5 giây
```

## ClickHouse

```text
30 giây
```

Khi timeout:

* hủy query
* ghi log
* trả HTTP 504

---

# 📌 Validation Requirements

Tất cả endpoint phải sử dụng Zod.

Ví dụ:

```typescript
const QuerySchema = z.object({
  from_time: z.string(),
  to_time: z.string(),
  page: z.number().default(1),
  limit: z.number().max(1000)
});
```

---

# 📌 Pagination Standard

Tất cả API trả danh sách phải hỗ trợ:

```text
page
limit
```

## Mặc định

```text
page = 1
limit = 100
```

## Giới hạn

```text
limit <= 1000
```

---

# 📌 Query Safety Constraints

## Maximum Time Range

```text
90 ngày
```

## Maximum Top-N

```text
1000
```

## Maximum Group By Columns

```text
3 cột
```

---

## Sorting

Chỉ cho phép:

```text
timestamp
severity
status
count
```

Không được cho phép người dùng truyền trực tiếp tên cột SQL.

Phải dùng whitelist mapping.

Ví dụ:

```javascript
const sortMap = {
  timestamp: 'timestamp',
  count: 'count'
};
```

---

# 📌 API Response Standard

## Success Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 100,
    "total": 1234,
    "execution_time_ms": 120
  }
}
```

---

## Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TIME_RANGE",
    "message": "from_time must be earlier than to_time"
  }
}
```

---

# 📌 HTTP Status Codes

| Code | Meaning            |
| ---- | ------------------ |
| 200  | Success            |
| 400  | Validation Error   |
| 404  | Resource Not Found |
| 429  | Rate Limited       |
| 500  | Internal Error     |
| 504  | Database Timeout   |

---

# 📌 Logging & Observability

Bắt buộc sử dụng:

```text
Pino
```

---

## Mỗi request phải log

```text
request_id
endpoint
duration
```

---

## Metrics bắt buộc

```text
clickhouse_query_time_ms
postgres_query_time_ms
execution_time_ms
records_returned
```

---

## Ví dụ

```json
{
  "request_id": "req_123",
  "endpoint": "/api/alarms",
  "clickhouse_query_time_ms": 95,
  "postgres_query_time_ms": 12,
  "execution_time_ms": 110
}
```

---

# 📌 Swagger Documentation

Tài liệu API được publish tại:

```text
/api-docs
```

---

## Cấu hình Swagger

```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alarms Analytics API',
      version: '1.0.0',
      description:
        'High-performance analytics APIs powered by ClickHouse and PostgreSQL'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

module.exports = swaggerJsdoc(options);
```

---

## Yêu cầu Documentation

Mọi endpoint phải có:

* Summary
* Description
* Query Parameters
* Request Schema
* Response Schema
* Error Responses

Ví dụ:

```javascript
/**
 * @swagger
 * /api/alarms:
 *   get:
 *     summary: Query alarms
 *     description: Retrieve alarms with filtering and pagination
 */
```

Không được merge pull request nếu endpoint chưa có Swagger Documentation.

---

# 📌 Project Structure

```text
src/
├── app.ts
├── server.ts
├── routes/
├── controllers/
├── services/
├── repositories/
├── validators/
├── middlewares/
├── configs/
├── database/
│   ├── clickhouse/
│   └── postgres/
├── swagger/
├── docs/
├── utils/
├── constants/
└── tests/
```

---

# 📌 Performance Requirements

## Query APIs

```text
P95 < 500ms
```

---

## Aggregation APIs

```text
P95 < 2s
```

---

## Group By / Top-N APIs

```text
P95 < 3s
```

---

Mọi request vượt ngưỡng phải được ghi log warning.

---

# 📌 Code Quality Requirements

Bắt buộc:

* ESLint
* Prettier

Khuyến khích:

* Husky
* lint-staged

---

# 📌 Testing Requirements

Bắt buộc có Unit Test cho:

* Service Layer
* Validation Layer

Ưu tiên bổ sung:

* Repository Test
* Integration Test

---

# 📌 Nguyên Tắc Triển Khai

Ưu tiên:

1. Tính đúng đắn dữ liệu.
2. Khả năng mở rộng.
3. Khả năng bảo trì.
4. Hiệu năng.

Không được viết mock implementation hoặc placeholder logic.

Mọi endpoint phải có:

* Validation
* Error Handling
* Logging
* Swagger Documentation
* Unit Test tối thiểu cho Service Layer

Mã nguồn phải ở trạng thái production-ready và có thể triển khai trực tiếp vào môi trường nội bộ của doanh nghiệp.

# Endpoint
```python
import os

markdown_content = """# Task: Phát Triển Hệ Thống API Query & Aggregation Cho Alarms (ClickHouse & Node.js)

## 📌 Tổng Quan Hệ Thống (Antigravity)
Hệ thống yêu cầu xây dựng tập hợp các API hiệu năng cao dùng để truy vấn, lọc đa chiều, và tổng hợp dữ liệu (aggregation) từ bảng `alarms` lưu trữ trong ClickHouse phục vụ cho hiển thị biểu đồ và dashboard.

### 📊 Cấu Trúc Bảng Hiện Tại (ClickHouse)
```sql
CREATE TABLE alarms
(
    alarm_id String,
    error_code String,
    device_id String,
    time_created DateTime,
    time_solved Nullable(DateTime),
    status LowCardinality(String),
    severity LowCardinality(String),
    raw_log String,
    description String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(time_created)
ORDER BY (status, severity, device_id, time_created);

```

---

## 🛠 Danh Sách Tasks Cần Triển Khai (Node.js)
Nếu bạn muốn mở rộng số lượng API để **phân tách trách nhiệm rõ ràng hơn** (giúp code bên trong mỗi API sạch sẽ, dễ bảo trì, dễ viết tài liệu Swagger và không bị quá nhiều câu lệnh `if/else` lồng nhau), việc tăng số lượng API là hoàn toàn hợp lý.

Nhìn lại danh sách yêu cầu ban đầu của bạn:

1. **Query API với bộ lọc đa chiều** (Time range, device, type, severity).
2. **Tối ưu query cho tập dữ liệu lớn** (Index, pagination).
3. **Aggregation API cho các biểu đồ**:
* **Biểu đồ đường:** Thống kê số lượng theo thời gian; thống kê thời gian xử lý trung bình theo ngày/tháng/năm (Time-bucket).
* **Biểu đồ cột:** Top các trạm/thiết bị hay gặp lỗi nhất; tần số xuất hiện của các mã lỗi (Top-N).
* **Biểu đồ tròn:** Tỷ lệ alarm theo mức độ nguy hiểm (`severity`), tỷ lệ theo miền (`domain`/`type`).



Dưới đây là thiết kế hệ thống **5 API** được phân rã chuẩn chỉ, bao phủ 100% các task và không bỏ sót bất kỳ yêu cầu nào của bạn:

---

## 🧭 Kiến Trúc Hệ Thống 5 API Toàn Diện 

CẦN LƯU Ý LÀ ALARM NẰM RIÊNG TRONG CLICKHOUSE CÒN CÁC BẢNG CÒN LẠI TRONG POSTGRES. THỰC HIỆN CHỪA CÁC VỊ TRÍ ĐỂ ĐIỀN CONNECTION ĐẾN DATABASE TRONG CODE ĐỂ DEV ĐIỀN VÀO (NẾU ĐÃ CÓ CHỖ SETUP .ENV THÌ KHÔNG CẦN)

### 1. API 1: Truy vấn danh sách chi tiết (Phục vụ Table View)

* **Endpoint:** `GET /api/v1/alarms`
* **Nhiệm vụ:** Trả về danh sách chi tiết các cảnh báo chưa xử lý hoặc đã xử lý để hiển thị lên Table.
* **Cách tối ưu tập dữ liệu lớn:**
* **Keyset Pagination (Cursor):** Sử dụng mốc `time_created` và `alarm_id` của bản ghi cuối trang trước để làm điều kiện quét cho trang sau. Tránh tuyệt đối `OFFSET`.
* **Data Federation:** Đọc 20-50 dòng từ ClickHouse trước $\rightarrow$ Lấy mảng `device_id` $\rightarrow$ Quét bảng `devices` bên Postgres bằng `WHERE id IN (...)` $\rightarrow$ Gộp dữ liệu tại Node.js.



### 2. API 2: Thống kê số lượng theo thời gian (Phục vụ Biểu đồ đường - Số lượng)

* **Endpoint:** `GET /api/v1/analytics/time-series/count`
* **Nhiệm vụ:** Đếm số lượng alarm sinh ra theo từng khung giờ/ngày để vẽ biểu đồ đường theo dõi xu hướng cao điểm của lỗi.
* **Cách tối ưu:** Dùng hàm native `toStartOfHour()` hoặc `toStartOfDay()`. Ép buộc truyền `from_time`/`to_time` để kích hoạt **Partition Pruning** trên ClickHouse.

### 3. API 3: Thống kê thời gian xử lý trung bình (Phục vụ Biểu đồ đường - Hiệu năng)

* **Endpoint:** `GET /api/v1/analytics/time-series/duration`
* **Nhiệm vụ:** Tính thời gian từ lúc alarm sinh ra đến lúc được xử lý (`time_solved - time_created`) trung bình theo ngày/tháng/năm để đánh giá hiệu suất của đội vận hành.
* **Cách tối ưu:** Xử lý trực tiếp các trường hợp cảnh báo chưa được đóng bằng hàm `if(isNull(time_solved), now(), time_solved)` ngay trong câu lệnh SQL của ClickHouse để tính toán trên RAM với tốc độ mili-giây.

### 4. API 4: Xếp hạng cảnh báo lặp lại (Phục vụ Biểu đồ cột - Top-N)

* **Endpoint:** `GET /api/v1/analytics/top-n`
* **Tham số:** `by=device` (Top thiết bị lỗi nhiều) HOẶC `by=error_code` (Tần số xuất hiện của mã lỗi).
* **Luồng xử lý chéo DB (Nếu `by=device`):** ClickHouse chạy lệnh `GROUP BY device_id ORDER BY count() DESC LIMIT 10` $\rightarrow$ Node.js mang 10 ID này sang Postgres lấy Tên thiết bị và Tên trạm (`station_id`) để hiển thị nhãn (Label) trực quan trên biểu đồ cột.

### 5. API 5: Phân tích tỷ trọng cấu thành (Phục vụ Biểu đồ tròn - Ratio)

* **Endpoint:** `GET /api/v1/analytics/ratio`
* **Tham số:** `by=severity` (Tỷ lệ theo mức độ nguy hiểm) HOẶC `by=type` (Tỷ lệ theo chủng loại thiết bị: NodeB, Firewall...).
* **Cách tối ưu:** Truy vấn trực tiếp trên các cột dữ liệu đã được tối ưu bằng `LowCardinality(String)` trong ClickHouse giúp giảm dung lượng RAM quét dữ liệu xuống hàng chục lần.

---

1. **Task xử lý "Domain/Device Type" khi Group-By ở API 5 (Biểu đồ tròn):**
* *Vấn đề:* Trong file đạng mẫu bạn gửi, trường `device_type` (NodeB, Firewall...) nằm ở **Postgres**, nhưng dữ liệu Alarm lại nằm ở **ClickHouse**.
* *Cách làm đúng theo Data Federation:* Khi gọi API 5 với tham số `by=type`, ClickHouse không có sẵn trường `type` để `GROUP BY`. Do đó, Node.js phải dùng ClickHouse vẫn `GROUP BY device_id`, sau đó Node.js dùng dữ liệu cấu hình thiết bị từ Postgres để map và tự gộp (cộng dồn) các ID thuộc cùng một loại `device_type` lại với nhau thành dữ liệu biểu đồ tròn.

Thực hiện tương tự khi cần phải query từ cả hai cơ sở dữ liệu

---

## 🚀 Kỹ Thuật Tối Ưu Cho Tập Dữ Liệu Lớn (Big Data Optimization)

1. **Sử dụng Pre-calculated Query Parts / Prepared Statements:** Dùng thư viện `@clickhouse/client` chính thức của Node.js để thực hiện binding parameters chống SQL Injection và tối ưu hóa query plan cache.
2. **Streaming Data:** Đối với API Query danh sách lớn, sử dụng cơ chế Stream (`client.query({ ... }).stream()`) của ClickHouse Node.js client để pipe dữ liệu trực tiếp về client dưới dạng JSONLines, tránh tình trạng block Event Loop và tràn bộ nhớ Node.js (OOM).
3. **Tận dụng Phân vùng (Partition Pruning):** Khi thực hiện bất kỳ câu truy vấn nào, bắt buộc Client phải truyền khoảng thời gian (`from_time`, `to_time`). ClickHouse sẽ chỉ quét trên các partition liên quan thay vì full-scan toàn bộ ổ đĩa.
4. **Sử dụng Mạng thu nhỏ (LowCardinality):** Tận dụng tối đa việc lọc trên các trường `status` và `severity` vì cấu trúc lưu trữ dạng Dictionary index của loại dữ liệu này giúp quét hàng tỷ dòng trong mili-giây.

---

## 📋 Tiêu Chí Nghiệm Thu (Definition of Done)

* [ ] Thiết lập kết nối Connection Pool đến ClickHouse thông qua `@clickhouse/client` ổn định, có cơ chế tự động reconnect.
* [ ] Triển khai đầy đủ 4 API routes với đầy đủ validation đầu vào (sử dụng `Joi` hoặc `Zod`).
* [ ] Tích hợp Logging (Winston/Pino) để đo thời gian phản hồi của ClickHouse trên từng API.
* [ ] Toàn bộ các API phải xử lý được trường hợp dữ liệu lớn mà không bị nghẽn Event Loop (`Promise.all` hoặc Stream hợp lý).
* [ ] Đạt chỉ số performance: Query trong khoảng 1 tháng (< 50M records) phải trả kết quả dưới **200ms**.
