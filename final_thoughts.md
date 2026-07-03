# III. Kết quả thực hiện và đánh giá

## 3.1. Kết quả thực hiện

Dự án đã triển khai được một hệ thống NetTrace phục vụ tra cứu, phân tích, trực quan hóa và xuất dữ liệu alarm cho bối cảnh vận hành NOC. Hệ thống hiện gồm backend API, frontend dashboard và lớp lưu trữ dữ liệu kết hợp giữa ClickHouse và PostgreSQL.

Các chức năng chính đã hoàn thành:

- **Alarm Explorer:** cho phép người dùng tra cứu danh sách alarm thông qua `GET /api/v1/alarms`, hỗ trợ lọc theo thời gian, severity, status, device, error code và các metadata như device type, vendor, station, station ID, province. Màn hình cũng hỗ trợ tìm kiếm theo một trường được chọn, phân trang, sắp xếp và lựa chọn cột hiển thị.
- **Dashboard Analytics:** cung cấp dashboard theo template, hiển thị KPI và nhiều loại widget như line chart, bar chart, pie chart, table và heatmap. Các widget gọi các API tương ứng như `GET /api/v1/analytics/summary`, `POST /api/v1/analytics/query`, `POST /api/v1/analytics/heatmap` và `GET /api/v1/alarms`.
- **Template & Preset Management:** cho phép tạo, chỉnh sửa, xóa template và preset thông qua các API `/api/v1/templates` và `/api/v1/presets`. Template lưu bố cục dashboard, còn preset lưu cấu hình widget có thể tái sử dụng.
- **Data Export:** cho phép xuất dữ liệu alarm đã lọc thông qua `POST /api/v1/export`, hỗ trợ các định dạng CSV, XLSX và JSON. Người dùng có thể chọn cột dữ liệu, filter, sort và giới hạn số bản ghi.
- **Metadata Options:** cung cấp API `GET /api/v1/metadata/options` để frontend lấy danh sách device type, vendor, station và province phục vụ các bộ lọc.
- **Data Federation:** backend đã triển khai cơ chế kết hợp dữ liệu giữa ClickHouse và PostgreSQL ở tầng Service. ClickHouse xử lý dữ liệu alarm và analytics khối lượng lớn, trong khi PostgreSQL lưu metadata và cấu hình dashboard.
- **Validation và response chuẩn hóa:** backend sử dụng Zod để validate request và trả response theo envelope thống nhất `{ success, data, meta }` hoặc `{ success, error }`.

## 3.2. Kết quả triển khai giao diện

Phần giao diện được triển khai bằng React, TypeScript, Vite, Tailwind CSS và TanStack Query. Ứng dụng có sidebar điều hướng và các màn hình chính phục vụ các nghiệp vụ NOC.

### Dashboard

**Ảnh minh họa:** thêm sau.

Màn hình Dashboard tại route `/dashboard` dùng để theo dõi tình trạng alarm qua KPI và các widget phân tích. Dashboard hoạt động theo template: khi chưa chọn template, hệ thống hiển thị trạng thái rỗng; khi chọn template, frontend render các widget đã lưu trong template đó.

Các widget chính gồm:

- KPI tổng số alarm, alarm active, alarm closed, critical alarm và affected devices.
- Biểu đồ line, bar, pie dựa trên API analytics.
- Heatmap theo weekday hoặc calendar.
- Table widget hiển thị alarm dạng bảng.

Khi người dùng thay đổi cấu hình widget như date range, metric, group by, time bucket, chart type, heatmap mode hoặc table columns, frontend cập nhật query key và TanStack Query tự động gọi lại API phù hợp.

### Alarm Explorer

**Ảnh minh họa:** thêm sau.

Màn hình Alarm Explorer tại route `/alarms` dùng để tra cứu và phân tích danh sách alarm. Người dùng có thể lọc theo thời gian, severity, status, device, vendor, station, province, error code; chọn trường search; sắp xếp; phân trang; và tùy chỉnh cột hiển thị.

Frontend gọi:

- `GET /api/v1/metadata/options` để lấy danh sách metadata filter.
- `GET /api/v1/alarms` để lấy danh sách alarm đã lọc, sắp xếp và phân trang.

Khi người dùng chọn một alarm, màn hình mở detail panel dựa trên dữ liệu alarm đã được backend enrich bằng `device_details` và `error_details`.

### Templates & Presets

**Ảnh minh họa:** thêm sau.

Màn hình Templates & Presets tại route `/templates` dùng để quản lý dashboard template và reusable preset. Người dùng có thể tạo, chỉnh sửa, xóa template; tạo, chỉnh sửa, xóa preset; tìm kiếm, lọc và sắp xếp danh sách.

Frontend gọi:

- `GET /api/v1/templates` để lấy danh sách template.
- `GET /api/v1/presets` để lấy danh sách preset.
- `POST /api/v1/templates`, `PUT /api/v1/templates/:id`, `DELETE /api/v1/templates/:id` cho thao tác template.
- `POST /api/v1/presets`, `PUT /api/v1/presets/:id`, `DELETE /api/v1/presets` cho thao tác preset.

Sau các thao tác tạo, cập nhật hoặc xóa, frontend invalidate các query cache liên quan để đồng bộ lại dữ liệu từ backend.

### Export Data

**Ảnh minh họa:** thêm sau.

Màn hình Export Data tại route `/export` cho phép người dùng xuất dữ liệu alarm theo bộ lọc đã chọn. Người dùng có thể chọn format CSV, XLSX hoặc JSON, chọn cột export, filter theo metadata, sort và giới hạn số bản ghi.

Frontend gọi:

- `GET /api/v1/metadata/options` để lấy dữ liệu filter dropdown.
- `POST /api/v1/export` để gửi yêu cầu export.

Kết quả export được frontend xử lý dưới dạng Blob và tải xuống theo định dạng người dùng đã chọn.

## 3.3. Kết quả triển khai hệ thống

### Backend

Backend được triển khai bằng Node.js, Express.js và TypeScript. Source code được tổ chức theo các nhóm chính:

- `routes`: khai báo endpoint và Swagger/OpenAPI annotation.
- `controllers`: nhận dữ liệu đã validate từ middleware và gọi service.
- `services`: xử lý nghiệp vụ, điều phối dữ liệu và thực hiện data federation.
- `repositories`: xây dựng và thực thi raw SQL cho ClickHouse/PostgreSQL.
- `validators`: định nghĩa schema Zod cho query/body/params.
- `middlewares`: logging, validation và xử lý lỗi.
- `database`: cấu hình kết nối ClickHouse và PostgreSQL.

Backend không sử dụng ORM hoặc query builder. Các truy vấn được viết bằng raw SQL và thực thi thông qua `pg` đối với PostgreSQL, `@clickhouse/client` đối với ClickHouse.

### API

Các API được mount dưới namespace `/api/v1`. Nhóm API chính gồm:

- `GET /api/v1/alarms`: truy vấn danh sách alarm.
- `GET /api/v1/analytics/summary`: lấy KPI summary.
- `POST /api/v1/analytics/query`: truy vấn analytics động.
- `POST /api/v1/analytics/heatmap`: lấy dữ liệu heatmap.
- `GET /api/v1/metadata/options`: lấy metadata filter options.
- `POST /api/v1/export`: export alarm.
- `/api/v1/templates`: CRUD template.
- `/api/v1/presets`: CRUD preset.

API sử dụng Zod để validate đầu vào, response có định dạng thống nhất, và có middleware ghi log thời gian xử lý cũng như thời gian query ClickHouse/PostgreSQL.

### Database

Hệ thống sử dụng hai loại cơ sở dữ liệu:

- **ClickHouse:** lưu và truy vấn dữ liệu alarm khối lượng lớn. Các query phân tích như count, group by, heatmap, summary và export đều dựa trên dữ liệu alarm trong ClickHouse.
- **PostgreSQL:** lưu metadata quan hệ như device, vendor, station, error và các cấu hình dashboard như template, preset, widget.

Backend không join trực tiếp giữa ClickHouse và PostgreSQL ở database level. Thay vào đó, service layer thực hiện federation:

1. Khi filter theo metadata, backend truy vấn PostgreSQL trước để lấy `device_id`, sau đó dùng các ID này để lọc ClickHouse.
2. Khi cần enrich alarm, backend lấy `device_id` và `error_code` từ kết quả ClickHouse, query PostgreSQL theo batch, rồi merge dữ liệu ở service.
3. Khi group by theo metadata, backend lấy dữ liệu trung gian từ ClickHouse theo ID, map metadata từ PostgreSQL, rồi gom nhóm lại ở service.

Một số kỹ thuật tối ưu đã triển khai:

- ClickHouse dùng `PREWHERE` cho filter.
- Query alarm hỗ trợ chọn cột để tránh lấy dữ liệu không cần thiết.
- Long date range được chia thành các chunk tối đa 90 ngày.
- Sort field được whitelist.
- PostgreSQL dùng connection pool và query timeout 5 giây.
- ClickHouse dùng `max_execution_time` 30 giây.
- Template update/create dùng PostgreSQL transaction.

### Frontend

Frontend được triển khai bằng React 18, TypeScript, Vite, Tailwind CSS và TanStack Query. Ứng dụng sử dụng React Router cho các route chính:

- `/dashboard`
- `/alarms`
- `/templates`
- `/export`

API client được đặt tại `frontend/src/services/generated/nettrace-api.ts`. Frontend quản lý server state bằng TanStack Query, sử dụng query key để cache/refetch dữ liệu và invalidate cache sau mutation như tạo, cập nhật hoặc xóa template/preset.

Giao diện sử dụng dark-themed NOC dashboard với neon accent. Các component dùng chung nằm ở `src/components/ui` và `src/components/shared`; các component đặc thù dashboard nằm trong `src/features/dashboard/components`.

### Tích hợp

Frontend và backend tích hợp thông qua REST-style API dưới `/api/v1`. Các màn hình frontend gọi trực tiếp các endpoint tương ứng thông qua `nettraceApi`. Backend đảm nhiệm validate, xử lý nghiệp vụ, truy vấn ClickHouse/PostgreSQL và trả dữ liệu đã chuẩn hóa cho frontend.

Luồng tích hợp tiêu biểu:

- Alarm Explorer gọi metadata options để dựng bộ lọc, sau đó gọi alarms API để lấy dữ liệu.
- Dashboard gọi templates/presets để dựng dashboard, sau đó từng widget gọi analytics/summary/heatmap/alarms API.
- Templates & Presets gọi API template/preset để quản lý cấu hình dashboard.
- Export gửi filter và selected columns tới backend, nhận file Blob và tải xuống.

## 3.4. Đánh giá

### 3.4.1. Ưu điểm

- **Phân tách trách nhiệm rõ ràng:** backend được tổ chức theo controller, service, repository và database client, giúp dễ theo dõi luồng xử lý.
- **Phù hợp dữ liệu lớn:** ClickHouse được dùng cho dữ liệu alarm và analytics, trong khi PostgreSQL dùng cho metadata và cấu hình dashboard.
- **Không phụ thuộc ORM:** raw SQL giúp kiểm soát trực tiếp câu truy vấn và tối ưu theo từng database.
- **Data federation rõ ràng:** hệ thống không join trực tiếp giữa hai database mà merge dữ liệu ở service layer.
- **Validation chặt chẽ:** Zod được dùng cho query, body và params, giúp giảm lỗi đầu vào.
- **Frontend đồng bộ dữ liệu tốt:** TanStack Query hỗ trợ cache, refetch và invalidation sau mutation.
- **Dashboard linh hoạt:** người dùng có thể dùng template/preset để tái sử dụng cấu hình dashboard và widget.
- **Export thực tế:** hỗ trợ CSV, XLSX và JSON, phù hợp nhu cầu chia sẻ dữ liệu và phân tích bên ngoài hệ thống.
- **Có test backend:** source code có test cho validator, service, repository query shape và template transaction.

### 3.4.2. Hạn chế

- **Chưa có authentication/authorization:** source code hiện tại chưa triển khai đăng nhập, phân quyền hoặc JWT.
- **Chưa có frontend test:** không tìm thấy test tự động cho frontend trong source code hiện tại.
- **Chưa có migration framework đầy đủ:** PostgreSQL dashboard tables có init script, nhưng chưa có hệ thống migration versioned chính thức.
- **Một số UI logic còn nằm trực tiếp trong page:** Alarm Explorer và Export vẫn chứa nhiều logic filter/menu trong page component, chưa tách hoàn toàn thành shared component.
- **Chưa có Docker/CI-CD trong source code hiện tại:** không tìm thấy Dockerfile, docker-compose hoặc workflow CI/CD.
- **Một số tài liệu cần tiếp tục đồng bộ:** docs đã được cập nhật nhiều phần, nhưng vẫn cần rà soát định kỳ để tránh mô tả vượt quá chức năng có thật trong source code.
- **Chưa có real-time push notification:** hệ thống hiện chủ yếu hoạt động theo request/refetch, chưa có WebSocket hoặc streaming event realtime tới frontend.

## 3.5. Hướng phát triển

Các hướng phát triển tiếp theo có thể thực hiện dựa trên hiện trạng codebase:

- Bổ sung authentication và authorization để quản lý người dùng, vai trò và quyền truy cập dashboard/API.
- Xây dựng migration framework versioned cho PostgreSQL để quản lý thay đổi schema rõ ràng hơn.
- Bổ sung test frontend cho các flow quan trọng như Alarm Explorer, Dashboard widget settings, Templates & Presets và Export.
- Tách thêm các UI pattern lặp lại trong Alarm Explorer và Export thành shared components để giảm duplication.
- Hoàn thiện quy trình triển khai như Dockerfile, docker-compose hoặc CI/CD nếu cần chạy trong môi trường production.
- Bổ sung cơ chế realtime hoặc auto-refresh có kiểm soát cho các màn hình NOC cần theo dõi liên tục.
- Tăng cường observability bằng dashboard log/metric, health checks và cảnh báo khi API vượt SLA.
- Mở rộng khả năng quản lý template/preset như versioning, duplicate template, import/export cấu hình dashboard.
- Tối ưu thêm các truy vấn analytics theo dữ liệu thực tế, đặc biệt với group by metadata và các khoảng thời gian lớn.

# IV. Kết luận

Qua quá trình triển khai, dự án NetTrace đã hình thành được một hệ thống phân tích alarm tương đối đầy đủ cho bối cảnh NOC, bao gồm backend API, frontend dashboard, cơ chế truy vấn dữ liệu alarm, phân tích thống kê, quản lý dashboard template/preset và xuất dữ liệu. Các chức năng chính như Alarm Explorer, Dashboard Analytics, Templates & Presets và Data Export đã được kết nối với các API backend tương ứng và hoạt động theo luồng dữ liệu rõ ràng.

Về mặt kỹ thuật, hệ thống sử dụng ClickHouse cho dữ liệu alarm khối lượng lớn và PostgreSQL cho metadata/cấu hình dashboard. Cách tách vai trò hai database giúp hệ thống phù hợp hơn với cả truy vấn phân tích lẫn dữ liệu quan hệ. Backend đã áp dụng mô hình xử lý theo controller, service, repository; sử dụng Zod để validate dữ liệu đầu vào; dùng raw SQL để kiểm soát truy vấn; và thực hiện data federation ở tầng Service thay vì join trực tiếp giữa hai database. Frontend sử dụng React, Vite, Tailwind CSS và TanStack Query, giúp tổ chức giao diện theo component, quản lý server state và đồng bộ dữ liệu sau các thao tác người dùng.

Hiệu quả triển khai hiện tại thể hiện ở việc hệ thống đã hỗ trợ được các nghiệp vụ cốt lõi: tra cứu alarm có filter/search/sort/pagination, hiển thị KPI và biểu đồ, lưu/tái sử dụng cấu hình dashboard, và export dữ liệu theo nhiều định dạng phổ biến. Một số kỹ thuật tối ưu cũng đã được áp dụng như ClickHouse `PREWHERE`, lựa chọn cột cần truy vấn, chia nhỏ khoảng thời gian dài, whitelist sort field, transaction cho template và cache/refetch bằng TanStack Query.

Tuy nhiên, hệ thống vẫn còn một số giới hạn. Source code hiện chưa có authentication/authorization, chưa có frontend test, chưa có migration framework versioned đầy đủ, chưa có Docker/CI-CD, chưa có realtime update đúng nghĩa và chưa áp dụng đầy đủ các kỹ thuật tăng tốc nâng cao cho workload rất lớn như cache phân tán, precomputed aggregates hoặc materialized views chuyên biệt cho dashboard/analytics.

Trong tương lai, dự án có thể tiếp tục phát triển theo các hướng: bổ sung phân quyền người dùng, hoàn thiện migration và deployment pipeline, tăng coverage test cho frontend/backend, tách thêm shared component để giảm trùng lặp UI, bổ sung cơ chế realtime hoặc auto-refresh có kiểm soát, và tối ưu sâu hơn các truy vấn analytics trên dữ liệu lớn. Các hướng này sẽ giúp NetTrace ổn định hơn, dễ mở rộng hơn và phù hợp hơn với môi trường vận hành NOC thực tế.
