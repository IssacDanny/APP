# Hướng dẫn Đóng góp cho Dự án

Chào mừng bạn đến với dự án của chúng tôi! Chúng tôi rất vui mừng khi bạn quan tâm đến việc đóng góp. Mọi sự đóng góp, dù là sửa một lỗi nhỏ, cải thiện tài liệu, hay thêm một tính năng lớn, đều vô cùng quý giá và được hoan nghênh.

Mục tiêu của dự án này là tạo ra một **framework Admin Panel phổ quát, điều khiển bởi schema**, được thiết kế để tương thích với bất kỳ backend SaaS nào. Bằng cách đóng góp, bạn đang giúp xây dựng một công cụ mạnh mẽ giúp các nhà phát triển tăng tốc độ làm việc một cách đáng kể.

Tài liệu này sẽ hướng dẫn bạn qua các khái niệm cốt lõi của dự án và quy trình để đóng góp một cách hiệu quả.

## Mục lục

- [Triết lý Kiến trúc](#triết-lý-kiến-trúc)
- [Bắt đầu](#bắt-đầu)
  - [Yêu cầu cần có](#yêu-cầu-cần-có)
  - [Các bước Cài đặt](#các-bước-cài-đặt)
  - [Chạy Dự án](#chạy-dự-án)
- [Quy trình Phát triển một Tính năng Mới](#quy-trình-phát-triển-một-tính-năng-mới)
  - [Ví dụ: Xây dựng Tính năng "Lời chào"](#ví-dụ-xây-dựng-tính-năng-lời-chào)
- [Hướng dẫn Chi tiết](#hướng-dẫn-chi-tiết)
  - [Bước 1: Cách Tạo một Blueprint](#bước-1-cách-tạo-một-blueprint)
  - [Bước 2: Cách Định nghĩa `uiSchema`](#bước-2-cách-định-nghĩa-uischema)
  - [Bước 3: Cách Viết một Service](#bước-3-cách-viết-một-service)
- [Nguyên tắc về Code & Commit](#nguyên-tắc-về-code--commit)
- [Gửi một Pull Request](#gửi-một-pull-request)

## Triết lý Kiến trúc

Để đóng góp hiệu quả, việc hiểu rõ triết lý thiết kế đằng sau dự án là rất quan trọng. Kiến trúc của chúng tôi được xây dựng dựa trên ý tưởng về một **"Engine Khai báo" (Declarative Engine)**.

Thay vì viết code thủ công cho từng thành phần, nhà phát triển sẽ *khai báo* những gì họ muốn, và platform của chúng ta sẽ tự động *xây dựng* nó.

Hệ thống được chia thành hai phần chính:

1.  **Platform (`platform/`) - The Engine (Động cơ)**
    Đây là trái tim của framework. Nó chứa toàn bộ logic chung, có thể tái sử dụng và không hề biết gì về nghiệp vụ cụ thể của bất kỳ ứng dụng nào. Các thành phần chính của nó bao gồm:
    -   **Blueprint Interpreter:** "Bộ não" đọc các bản thiết kế (blueprint) và tự động xây dựng các route API.
    -   **IoC Container (Dependency Injection):** Quản lý vòng đời và "tiêm" các dependency, giúp giữ cho các module được tách rời và dễ kiểm thử.
    -   **Interceptors:** Xử lý các mối quan tâm xuyên suốt như xác thực, bảo mật, và ghi log, giữ cho logic nghiệp vụ luôn trong sáng.

2.  **Implementation (`implementation/`) - The Logic (Logic Nghiệp vụ)**
    Đây là nơi chứa code dành riêng cho một ứng dụng SaaS cụ thể. Một nhà phát triển sử dụng framework của chúng ta sẽ làm việc chủ yếu ở đây.
    -   **Blueprint (`blueprints/`):** Đây là **bản thiết kế** và là **nguồn chân lý duy nhất** cho một module. Trong tệp này, bạn định nghĩa giao diện người dùng (UI), các điểm cuối API, và các quy tắc sẽ được áp dụng. Về cơ bản, bạn nói với engine: "Tôi muốn một trang quản lý người dùng trông như thế này và hoạt động như thế kia."
    -   **Service (`services/`):** Đây là nơi chứa **logic nghiệp vụ thuần túy** được "tiêm" vào engine. Các lớp Service thực hiện các hành động được khai báo trong blueprint (ví dụ: lấy dữ liệu người dùng từ cơ sở dữ liệu, cập nhật một bản ghi). Chúng hoàn toàn không biết gì về HTTP hay giao diện người dùng.

Mối quan hệ này cho phép chúng ta thêm các tính năng phức tạp một cách nhanh chóng, có cấu trúc và dễ bảo trì.

## Bắt đầu

Phần này sẽ hướng dẫn bạn cách thiết lập môi trường phát triển đầy đủ cho cả backend và frontend để bạn có thể bắt đầu đóng góp.

### Yêu cầu cần có

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các công cụ sau:
- **Node.js**: Phiên bản 18.x trở lên.
- **npm**: Thường được cài đặt sẵn cùng với Node.js.
- **Git**: Để quản lý mã nguồn.
- **Docker Desktop**: để chạy các dịch vụ phụ thuộc như Redis một cách dễ dàng.

### Các bước Cài đặt

Quy trình cài đặt bao gồm việc thiết lập cả hai repository: `admin-panel-backend` (máy chủ) và `admin-panel-generator` (giao diện người dùng).

#### 1. Cài đặt Backend

Backend là "engine" xử lý logic và cung cấp API cũng như schema cho frontend.

1.  **Fork và Clone repository Backend:**
    ```bash
    git clone https://github.com/TEN_CUA_BAN/admin-panel-backend.git
    cd admin-panel-backend
    ```

2.  **Cài đặt các dependency:**
    ```bash
    npm install
    ```

3.  **Cấu hình Môi trường:**
    -   Sao chép tệp `implementation/.env.example` (nếu có) thành một tệp mới tên là `implementation/.env`.
    -   Mở tệp `implementation/.env` và điền các giá trị cần thiết, đặc biệt là `JWT_SECRET`.

4.  **Chạy dịch vụ phụ thuộc (Redis):**
    Nếu bạn đã cài đặt Docker, hãy chạy lệnh sau để khởi động một container Redis:
    ```bash
    docker run -d --name local-redis -p 6379:6379 redis
    ```
    Điều này cần thiết cho các tính năng như Rate Limiting.

#### 2. Cài đặt Frontend

Frontend là "trình biên dịch" và "trình kết xuất" giao diện người dùng dựa trên schema nhận được từ backend.

1.  **Fork và Clone repository Frontend** vào một thư mục khác:
    ```bash
    cd admin-panel-generator
    ```

2.  **Cài đặt các dependency:**
    ```bash
    npm install
    ```

3.  **Cấu hình Môi trường:**
    -   Tạo một tệp mới tên là `.env` ở thư mục gốc của dự án frontend.
    -   Thêm dòng sau vào tệp `.env` để frontend biết địa chỉ của backend:
        ```
        VITE_API_HOST=http://localhost:4000
        ```
    -   Bạn có thể thay đổi cổng `4000` nếu bạn đã cấu hình backend chạy trên một cổng khác.

### Chạy Dự án

Để phát triển, bạn cần chạy cả hai server cùng một lúc. Hãy mở hai cửa sổ terminal riêng biệt.

-   **Trong Terminal 1 (Thư mục Backend):**
    ```bash
    # Khởi động server backend
    npm run dev
    ```

-   **Trong Terminal 2 (Thư mục Frontend):**
    ```bash
    # Khởi động frontend
    npm run dev
    ```

Sau khi cả hai server đã khởi động thành công, bạn có thể truy cập ứng dụng frontend (thường là tại `http://localhost:5173`) trong trình duyệt của mình.

### Chạy Kiểm thử

Trước khi gửi bất kỳ đóng góp nào, hãy đảm bảo rằng tất cả các bài kiểm thử đều vượt qua.

-   **Để chạy bộ kiểm thử của Backend:**
    ```bash
    # Trong thư mục admin-panel-backend
    npm test
    ```

## Quy trình Phát triển một Tính năng Mới

Kiến trúc độc đáo của chúng ta cho phép bạn thêm các module chức năng hoàn chỉnh một cách nhanh chóng và có hệ thống. Quy trình làm việc để thêm bất kỳ tính năng mới nào luôn tuân theo ba bước cốt lõi sau:

1.  **Khai báo (Declare):** Tạo một tệp **Blueprint** để mô tả "cái gì" và "ở đâu". Bạn sẽ định nghĩa giao diện người dùng (UI), các điểm cuối API (endpoints), và các quy tắc bảo mật sẽ được áp dụng. Đây là bước bạn ra chỉ thị cho platform engine.

2.  **Triển khai (Implement):** Viết logic nghiệp vụ trong một lớp **Service** để mô tả "làm thế nào". Lớp này sẽ thực hiện các hành động đã được khai báo trong blueprint, như truy vấn cơ sở dữ liệu hoặc gọi một API khác.

3.  **Xác minh (Verify):** Viết các bài kiểm thử End-to-End (E2E) để đảm bảo tính năng của bạn hoạt động chính xác từ đầu đến cuối, từ giao diện người dùng đến logic nghiệp vụ.

### Ví dụ: Xây dựng Tính năng "Lời chào"

Hãy cùng xem cách áp dụng quy trình này để tạo một mục menu mới có tên "Lời chào". Khi người dùng nhấp vào, trang sẽ hiển thị một thông điệp đơn giản được lấy từ backend. Đây là ví dụ "Hello, World!" hoàn hảo cho platform của chúng ta.

#### Bước 1: Khai báo (Tạo Blueprint)

Đầu tiên, chúng ta cần nói cho platform engine biết chúng ta muốn xây dựng cái gì. Chúng ta sẽ tạo một tệp blueprint mới để định nghĩa một mục menu, một trang mới, và một route API.

**Tạo tệp: `implementation/src/blueprints/greetings.blueprint.js`**
```javascript
export default {
  // --- Định danh Tài nguyên ---
  resource: {
    name: 'greetings',
    prefix: '/greetings', // URL cơ sở cho module này
  },

  // --- Định nghĩa Schema UI ---
  uiSchema: {
    title: 'Công ty', // Tên của nhóm điều hướng trong sidebar
    icon: 'briefcase',
    items: [
      {
        type: 'resource',
        id: 'hello-world',
        name: 'Lời chào', // Tên của liên kết trong sidebar
        icon: 'message-square',
        endpoint: '/greetings/hello', // API mà trang này sẽ gọi
        views: {
          listView: {
            columns: [
              { field: 'message', header: 'Thông điệp từ Máy chủ' },
            ],
          },
        },
        actions: [], // Không có hành động nào trên trang này
      },
    ],
  },

  // --- Ánh xạ Route và Logic ---
  routes: [
    {
      path: '/hello',
      method: 'GET',
      // Ánh xạ route này đến phương thức 'sayHello' của 'greetingService'
      handler: 'greetingService.sayHello',
      interceptors: ['authentication'], // Route này yêu cầu đăng nhập
    },
  ],
};
```
Sau khi lưu tệp này, platform engine sẽ tự động nhận diện và chuẩn bị để xây dựng các thành phần được khai báo.

#### Bước 2: Triển khai (Viết Service)

Blueprint ở trên đã tham chiếu đến một service tên là `greetingService` và một phương thức tên là `sayHello`. Bây giờ, chúng ta cần cung cấp logic thực tế cho nó.

**Tạo tệp: `implementation/src/services/GreetingService.js`**
```javascript
export default class GreetingService {
  /**
   * Phương thức này thực hiện logic cho handler 'greetingService.sayHello'.
   * Nó trả về dữ liệu mà frontend sẽ hiển thị.
   */
  async sayHello(context) {
    // Dữ liệu chúng ta muốn hiển thị trên trang.
    const messageData = {
      id: 1, // 'id' là bắt buộc cho các hàng trong bảng
      message: 'Chào thế giới!',
    };

    // Trả về đối tượng theo đúng hợp đồng của platform.
    return {
      response: [messageData], // 'response' cho listView phải là một mảng
      payloads: {
        audit: { // (Tùy chọn) Gửi payload cho AuditingInterceptor
          message: `Người dùng ${context.user.email} đã xem trang Lời chào.`,
        },
      },
    };
  }
}
```
Sau khi lưu tệp này, IoC container sẽ tự động đăng ký `GreetingService` với tên `greetingService`, sẵn sàng để được `BlueprintInterpreter` sử dụng.

#### Bước 3: Xác minh (Viết Test)

Mọi tính năng mới phải đi kèm với kiểm thử để đảm bảo nó hoạt động đúng và không phá vỡ các chức năng hiện có. Chúng ta sẽ viết một bài kiểm thử End-to-End (E2E) để xác minh rằng route `GET /greetings/hello` hoạt động như mong đợi.

Mở tệp `implementation/full-system.e2e.test.js`. Nếu bạn mới bắt đầu, nó có thể trông giống như thế này:
```javascript
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
// ... các import khác ...

describe('Full System E2E Tests (Backend-Only)', () => {
  // Trống
});
```

Bây giờ, hãy thêm vào đó bộ kiểm thử hoàn chỉnh cho tính năng của chúng ta.

**Sửa đổi tệp: `implementation/full-system.e2e.test.js`**

```javascript
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { startServer } from '#platform/core/Server.js';
import { config } from '#platform/core/config/index.js';
// Nhập 'usersDb' từ database trong bộ nhớ để lấy thông tin người dùng cho việc tạo token
import { usersDb } from './src/data/database.js';

describe('Full System E-to-E Tests (Backend-Only)', () => {
  let app;
  let adminToken; // Chúng ta sẽ lưu trữ một token hợp lệ ở đây để tái sử dụng

  // --- Thiết lập Server và Authentication ---
  // Khối `beforeAll` này sẽ chạy một lần duy nhất trước tất cả các bài kiểm thử trong tệp này.
  beforeAll(async () => {
    // Khởi động server ở chế độ kiểm thử, không có mock nào được truyền vào.
    // Server sẽ tự động tải các blueprint và service thật của bạn.
    app = await startServer();
    
    // Vì route "Lời chào" của chúng ta được bảo vệ, chúng ta cần một token hợp lệ.
    // Chúng ta sẽ tạo một token cho người dùng admin từ database trong bộ nhớ.
    const adminUser = usersDb.get('user-1'); // Giả sử 'user-1' là admin
    adminToken = jwt.sign({ userId: adminUser.id }, config.JWT_SECRET, { expiresIn: '15m' });
  });

  // --- Bộ Kiểm thử cho Module Mới ---
  describe('Greetings Module', () => {
    it('should từ chối truy cập nếu không có token xác thực', async () => {
      // Gửi request mà không có header 'Authorization'
      const response = await request(app).get('/greetings/hello');
      
      // Khẳng định rằng server trả về lỗi 401 Unauthorized
      expect(response.status).toBe(401);
    });
    
    it('should trả về thông điệp chào mừng cho một người dùng đã được xác thực', async () => {
      // Gửi request với token xác thực mà chúng ta đã tạo
      const response = await request(app)
        .get('/greetings/hello')
        .set('Authorization', `Bearer ${adminToken}`);

      // Khẳng định rằng request thành công
      expect(response.status).toBe(200);
      
      // Khẳng định rằng body của response khớp với những gì service của chúng ta trả về
      expect(response.body).toBeInstanceOf(Array); // Vì là listView
      expect(response.body[0].id).toBe(1);
      expect(response.body[0].message).toBe('Chào thế giới!');
    });
  });

});
```

Sau khi thêm mã này, hãy chạy lệnh `npm test` từ terminal. Bạn sẽ thấy các bài kiểm thử của mình được thực thi và vượt qua, xác minh rằng tính năng mới của bạn đã được tích hợp thành công và hoạt động chính xác từ đầu đến cuối.

Sau khi hoàn thành ba bước này, bạn đã thêm thành công một tính năng end-to-end hoàn chỉnh vào hệ thống.

## Hướng dẫn Chi tiết

Phần này đóng vai trò như một tài liệu tham khảo kỹ thuật chi tiết. Sau khi bạn đã hiểu quy trình làm việc chung, hãy sử dụng phần này để tìm hiểu sâu hơn về các tùy chọn cấu hình và các quy tắc cần tuân theo.

### Bước 1: Cách Tạo một Blueprint

Blueprint là một tệp JavaScript nằm trong thư mục `implementation/src/blueprints/`. Tên tệp phải theo quy ước `tenModule.blueprint.js` (ví dụ: `products.blueprint.js`).

Mỗi tệp blueprint phải export một đối tượng JavaScript mặc định. Đối tượng này có 3 thuộc tính cấp cao nhất: `resource`, `uiSchema`, và `routes`.

#### A. Thuộc tính `resource`

Đây là phần định danh cho module của bạn. Nó cho platform biết module này là gì và làm thế nào để truy cập nó qua URL.

-   **`name`** `(string, bắt buộc)`: Một tên định danh duy nhất, viết thường, dạng camelCase (ví dụ: `accessManagement`, `productInventory`). Tên này được sử dụng nội bộ.
-   **`prefix`** `(string, bắt buộc)`: Tiền tố URL sẽ được áp dụng cho tất cả các route được định nghĩa trong blueprint này. Nó phải bắt đầu bằng dấu `/` (ví dụ: `/users`, `/system/configuration`).

**Ví dụ:**
```javascript
resource: {
  name: 'greetings',
  prefix: '/greetings',
},
```

#### B. Thuộc tính `uiSchema`

Phần này mô tả giao diện người dùng sẽ được tạo ra. Chi tiết về các thành phần UI sẽ được giải thích trong "Bước 2".

#### C. Thuộc tính `routes`

Đây là một mảng các đối tượng, mỗi đối tượng định nghĩa một điểm cuối API (endpoint) cho module của bạn. Platform sẽ tự động tạo và đăng ký các route này.

Mỗi đối tượng route trong mảng có các thuộc tính sau:

-   **`path`** `(string, bắt buộc)`: Đường dẫn của route, tương đối so với `prefix` của resource. Nó có thể chứa các tham số động theo cú pháp của Express (ví dụ: `/`, `/:id`, `/:id/status`).

-   **`method`** `(string, bắt buộc)`: Phương thức HTTP cho route này. Phải là một trong các giá trị: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.

-   **`handler`** `(string, bắt buộc)`: Đây là "trái tim" của route, xác định logic nào sẽ được thực thi.
    -   **Đối với logic nghiệp vụ tùy chỉnh:** Sử dụng định dạng `'serviceName.methodName'`. Ví dụ: `'greetingService.sayHello'`. Platform sẽ tìm service có tên `greetingService` trong IoC container và gọi phương thức `sayHello` của nó.
    -   **Đối với proxy chung:** Sử dụng chuỗi đặc biệt `'proxy'`. Route này sẽ chuyển tiếp request đến một dịch vụ bên ngoài. Khi sử dụng `'proxy'`, bạn cũng phải cung cấp `targetServiceUrl` và `downstreamPath`.

-   **`interceptors`** `(array, tùy chọn)`: Một mảng các interceptor sẽ được thực thi tuần tự *trước khi* handler chính được gọi.
    -   **Sử dụng đơn giản:** `['authentication', 'auditing']`.
    -   **Sử dụng với tùy chọn:** Để truyền cấu hình cho một interceptor, sử dụng một đối tượng: `{ name: 'rbac', options: { allowedRoles: ['admin'] } }`.

-   **`transform`** `(object, tùy chọn)`: Định nghĩa các hàm chuyển đổi dữ liệu cho lớp Anti-Corruption Layer (ACL).
    -   `request`: Chuỗi định dạng `'transformerName.methodName'` để chuyển đổi body của request *trước khi* nó được gửi đến service hoặc proxy.
    -   `response`: Chuỗi định dạng `'transformerName.methodName'` để chuyển đổi body của response *sau khi* nhận được từ service hoặc proxy.

**Ví dụ về một route đầy đủ:**
```javascript
{
  path: '/:id/roles',
  method: 'PUT',
  handler: 'accessAdapter.updateUserRoles',
  interceptors: [
    'authentication',
    { name: 'rbac', options: { allowedRoles: ['admin'] } },
    { name: 'rateLimiting', options: { max: 5, windowMs: 60000, keyGenerator: (req, ctx) => ctx.user.id } }
  ],
  transform: {
    request: 'userTransformer.rolesToPermissionIds',
    response: 'userTransformer.permissionsToRoles'
  }
}
```

### Bước 2: Cách Định nghĩa `uiSchema`

`uiSchema` là trái tim của blueprint. Nó là một đối tượng JSON mô tả chính xác cách tính năng của bạn sẽ được hiển thị trên giao diện người dùng. Cấu trúc của nó tuân theo một "ngữ pháp" được định nghĩa trong meta-schema của chúng ta. Dưới đây là các thành phần chính bạn có thể sử dụng, cùng với các ví dụ cụ thể.

#### A. Cấu trúc Điều hướng (Navigation Structure)

`uiSchema` của bạn định nghĩa một mục trong thanh điều hướng chính. Về cơ bản, nó là một `navigationItem`, có thể là một trong hai loại sau:

**1. `resourceGroup` (Nhóm Tài nguyên)**
   - **Mục đích:** Để nhóm các liên kết điều hướng liên quan với nhau. Đây là loại phổ biến nhất.
   - **Ví dụ (một nhóm "System" chứa một thư mục "Security"):**
     ```json
     "uiSchema": {
       "type": "resourceGroup",
       "id": "system-group",
       "display": "section",
       "title": "System",
       "icon": "cpu",
       "items": [
         {
           "type": "resourceGroup",
           "id": "security-folder",
           "display": "folder",
           "title": "Security",
           "icon": "shield",
           "items": [ /* ... chứa các resource ... */ ]
         }
       ]
     }
     ```

**2. `userMenu` (Menu Người dùng)**
   - **Mục đích:** Để định nghĩa một nhóm các hành động dành riêng cho người dùng đang đăng nhập (ví dụ: "Hồ sơ của tôi", "Đăng xuất").
   - **Ví dụ:**
     ```json
     "uiSchema": {
       "type": "userMenu",
       "id": "user",
       "title": "Tài khoản",
       "items": [ /* ... chứa các navigationLinkAction hoặc simpleApiAction ... */ ]
     }
     ```

#### B. Các Thành phần Con của `resourceGroup`

**`resource` (Tài nguyên)**
   - **Mục đích:** Thành phần cốt lõi, đại diện cho một trang quản lý có thể nhấp được (ví dụ: trang "Users" hoặc "Products").
   - **Ví dụ (một trang quản lý "Users"):**
     ```json
     {
       "type": "resource",
       "id": "user-list",
       "name": "Users",
       "icon": "users",
       "endpoint": "/users",
       "views": { /* ... xem bên dưới ... */ },
       "actions": [ /* ... xem bên dưới ... */ ]
     }
     ```

#### C. Các Dạng xem (Views)

`views` định nghĩa giao diện cho các trang chính của một `resource`.

**1. `listView` (Dạng xem Danh sách)**
   - **Mục đích:** Hiển thị một bảng dữ liệu. Được định nghĩa bởi `view-table`.
   - **Ví dụ:**
     ```json
     "listView": {
       "columns": [
         { "field": "id", "header": "User ID" },
         { "field": "email", "header": "Email Address" },
         { "field": "status", "header": "Status", "type": "tags" }
       ]
     }
     ```

**2. `detailView` (Dạng xem Chi tiết)**
   - **Mục đích:** Hiển thị thông tin chi tiết của một mục duy nhất. Được định nghĩa bởi `view-details`.
   - **Ví dụ:**
     ```json
     "detailView": {
       "fields": [
         { "field": "id", "label": "Unique User ID" },
         { "field": "email", "label": "Email Address" },
         { "field": "createdAt", "label": "Date Joined" }
       ]
     }
     ```

#### D. Các Hành động (Actions)

`actions` là một mảng mô tả các nút hoặc các yếu tố tương tác khác trên trang.

**1. `formAction` (Hành động Dạng Form)**
   - **Mục đích:** Định nghĩa một nút mở ra một modal form để tạo hoặc cập nhật dữ liệu.
   - **Ví dụ (nút "Create User"):**
     ```json
     {
       "type": "form",
       "id": "create-user",
       "name": "New User",
       "target": "global",
       "method": "POST",
       "endpoint": "/users",
       "formSchema": {
         "schema": {
           "title": "Create a New User",
           "type": "object",
           "properties": {
             "email": { "type": "string", "format": "email" },
             "role": { "type": "string", "enum": ["admin", "editor", "viewer"] }
           },
           "required": ["email", "role"]
         }
       }
     }
     ```

**2. `simpleApiAction` (Hành động API Đơn giản)**
   - **Mục đích:** Định nghĩa một nút thực hiện một lệnh gọi API đơn giản (ví dụ: "Xóa", "Đăng xuất").
   - **Ví dụ (nút "Delete" trên mỗi hàng):**
     ```json
     {
       "type": "simpleAction",
       "id": "delete-user",
       "name": "Delete",
       "target": "item",
       "method": "DELETE",
       "endpoint": "/users/{id}",
       "confirmationText": "Are you sure you want to permanently delete this user?"
     }
     ```

**3. `navigationLinkAction` (Hành động Điều hướng)**
   - **Mục đích:** Định nghĩa một liên kết hoặc nút thực hiện việc điều hướng bên trong ứng dụng, thường được sử dụng trong `userMenu`.
   - **Ví dụ (liên kết "My Profile" trong userMenu):**
     ```json
     {
       "type": "navigationLink",
       "id": "view-my-profile",
       "name": "My Profile",
       "targetResource": "user-list",
       "targetView": "detailView",
       "targetId": "@currentUser"
     }
     ```

### Bước 3: Cách Viết một Service

Service là nơi chứa toàn bộ logic nghiệp vụ (business logic) của bạn. Nó là một lớp JavaScript nằm trong thư mục `implementation/src/services/` và phải export một class mặc định (`export default class ...`). Platform engine sẽ tự động tìm, khởi tạo và inject các dependency cần thiết cho service của bạn.

Dưới đây là các quy tắc và ràng buộc quan trọng bạn phải tuân theo khi viết một Service.

#### A. Quy ước Đặt tên và Đăng ký Tự động

IoC container của chúng ta sử dụng một quy ước đặt tên đơn giản để tự động đăng ký service của bạn:

-   **Tên tệp:** `MyCustomService.js` (PascalCase)
-   **Tên đăng ký:** `myCustomService` (camelCase)

Tên đăng ký này phải khớp chính xác với phần `serviceName` mà bạn đã định nghĩa trong thuộc tính `handler` của blueprint (ví dụ: `handler: 'myCustomService.doSomething'`).

#### B. Method Signature

Mỗi phương thức trong service của bạn mà được gọi bởi một `handler` trong blueprint sẽ nhận một đối tượng `context` duy nhất làm tham số. **Đây là quy tắc quan trọng nhất.**

```javascript
export default class MyService {
  // KHÔNG ĐÚNG: async myMethod(req, res) { ... }
  // ĐÚNG:
  async myMethod(context) {
    // ... logic của bạn ở đây ...
  }
}
```

Đối tượng `context` này chứa mọi thứ bạn cần để xử lý request:
-   `context.req`: Đối tượng request gốc của Express. Bạn có thể truy cập `req.params`, `req.query`, và `req.body` từ đây.
-   `context.user`: Đối tượng người dùng đã được xác thực (nếu route có `authentication` interceptor). Nó chứa thông tin như `id`, `email`, và `roles`.
-   `context.payloads`: Một đối tượng trống `{}`. Bạn có thể thêm dữ liệu vào đây để các `postHandle` interceptor (như `auditing`) có thể sử dụng.

#### C. Hợp đồng Trả về (Return Contract)

Phương thức của bạn **không được** gọi `res.json()` hay `res.send()`. Thay vào đó, bạn **phải** `return` một đối tượng có cấu trúc cụ thể để platform engine có thể xử lý.

Cấu trúc trả về chung:
```javascript
return {
  status: 200,          // (Tùy chọn) Mã trạng thái HTTP. Mặc định là 200.
  response: data,       // Dữ liệu sẽ được gửi về client dưới dạng JSON.
  payloads: { /*...*/ } // (Tùy chọn) Dữ liệu cho các interceptor.
};
```

**Các trường hợp cụ thể:**

**1. Đối với `listView`:**
   - `response` **phải là một mảng** các đối tượng. Mỗi đối tượng trong mảng phải có thuộc tính `id`.
   ```javascript
   async getGreetings(context) {
     const greetings = [
       { id: 1, message: 'Chào thế giới!' },
       { id: 2, message: 'Xin chào!' }
     ];
     return { response: greetings };
   }
   ```

**2. Đối với các hành động `create` (`POST`) hoặc `update` (`PUT`/`PATCH`):**
   - `response` nên là đối tượng đã được tạo hoặc cập nhật.
   - `status` thường là `201` (Created) hoặc `200` (OK).
   ```javascript
   async updateUser(context) {
     const { id } = context.req.params;
     const { email } = context.req.body;
     const updatedUser = { id, email, roles: ['editor'] };
     return { 
       status: 200,
       response: updatedUser,
       payloads: { audit: { message: `Cập nhật người dùng ${id}` } }
     };
   }
   ```
**3. Đối với các hành động `delete` (`DELETE`) hoặc không cần trả về nội dung:**
   - Trả về một đối tượng không có `response` hoặc `response: null`.
   - `status` phải là `204` (No Content).
   ```javascript
   async deleteUser(context) {
     const { id } = context.req.params;
     // ... logic xóa người dùng ...
     return { 
       status: 204,
       payloads: { audit: { message: `Xóa người dùng ${id}` } }
     };
   }
   ```
**4. Xử lý Lỗi:**
   - Để trả về một lỗi cho client (ví dụ: `404 Not Found`, `400 Bad Request`), bạn phải `throw` một `HttpError`.
   ```javascript
   import { HttpError } from '#platform/core/errors.js';

   async getUserById(context) {
     const { id } = context.req.params;
     const user = // ... tìm người dùng ...
     if (!user) {
       throw new HttpError(`Người dùng với ID '${id}' không tồn tại.`, 404);
     }
     return { response: user };
   }
   ```

Bằng cách tuân thủ các quy tắc này, bạn đảm bảo rằng logic nghiệp vụ của mình được tách biệt hoàn toàn khỏi framework, dễ dàng kiểm thử, và tích hợp một cách liền mạch với platform engine.

## Nguyên tắc về Code & Commit

Để duy trì chất lượng và sự nhất quán của codebase, chúng tôi yêu cầu tất cả các đóng góp phải tuân thủ các nguyên tắc và quy ước dưới đây.

### Nguyên tắc về Code

Chúng tôi tin rằng code tốt không chỉ hoạt động đúng mà còn phải dễ đọc và dễ bảo trì. Hãy ghi nhớ các nguyên tắc sau:

1.  **Tuân thủ SOLID:** Kiến trúc của chúng ta được xây dựng dựa trên các nguyên tắc SOLID. Hãy đảm bảo code của bạn tuân thủ chúng:
    -   **Single Responsibility Principle (SRP):** Mỗi lớp, mỗi phương thức nên chỉ có một lý do duy nhất để thay đổi. Ví dụ: `Service` chỉ chứa logic nghiệp vụ, `Adapter` chỉ làm cầu nối HTTP, `Interceptor` chỉ xử lý một mối quan tâm xuyên suốt.
    -   **Open/Closed Principle (OCP):** Viết code có thể mở rộng (bằng cách thêm blueprint, service mới) mà không cần phải sửa đổi code cốt lõi của platform.
    -   **Dependency Inversion Principle (DIP):** Luôn phụ thuộc vào sự trừu tượng (các "hợp đồng" service), không phụ thuộc vào các triển khai cụ thể. Hãy để IoC container lo việc "tiêm" dependency.

2.  **Sử dụng JavaScript Hiện đại:**
    -   Luôn sử dụng cú pháp ES Modules (`import`/`export`).
    -   Ưu tiên `async/await` cho các tác vụ bất đồng bộ.
    -   Sử dụng các tính năng của ES6+ như `const`/`let`, arrow functions, và destructuring một cách hợp lý để code rõ ràng hơn.

3.  **Rõ ràng hơn Thông minh (Clarity over Cleverness):**
    -   Viết code một cách thẳng thắn và dễ hiểu. Tránh các cấu trúc phức tạp hoặc "thông minh" một cách không cần thiết mà có thể gây khó khăn cho người khác khi đọc lại.
    -   Thêm bình luận (comment) cho các đoạn code phức tạp hoặc có logic quan trọng không thể hiện rõ qua tên biến/hàm.

4.  **Xử lý Lỗi một cách Rõ ràng:**
    -   Không "nuốt" lỗi một cách âm thầm. Nếu một hàm có thể thất bại, hãy đảm bảo nó được bọc trong `try...catch` hoặc trả về một Promise bị `reject`.
    -   Sử dụng các lớp Error tùy chỉnh của chúng ta (`HttpError`, `ProxyError`) khi cần thiết để cung cấp phản hồi có ý nghĩa cho client.

### Quy ước cho Commit Message

Chúng tôi tuân thủ nghiêm ngặt theo tiêu chuẩn **[Conventional Commits](https://www.conventionalcommits.org/)**. Điều này giúp chúng tôi tự động tạo changelog, quản lý phiên bản và giữ cho lịch sử commit luôn sạch sẽ và có ý nghĩa.

Mỗi commit message phải có định dạng sau:

```
type(scope): subject
<dòng trống>
<body>
<dòng trống>
<footer>
```

-   **`type` (bắt buộc):** Phải là một trong các loại sau:
    -   `feat`: Một tính năng mới (a new **feat**ure).
    -   `fix`: Một bản sửa lỗi (a bug **fix**).
    -   `docs`: Chỉ thay đổi tài liệu.
    -   `style`: Các thay đổi không ảnh hưởng đến ý nghĩa của code (dấu chấm phẩy, định dạng, v.v.).
    -   `refactor`: Một thay đổi code không sửa lỗi cũng không thêm tính năng mới.
    -   `perf`: Một thay đổi code giúp cải thiện hiệu suất.
    -   `test`: Thêm hoặc sửa các bài kiểm thử.
    -   `chore`: Các thay đổi về quy trình build, công cụ phụ trợ, v.v.

-   **`scope` (tùy chọn):** Một danh từ mô tả phần của codebase bị ảnh hưởng bởi commit.
    -   Ví dụ: `(rbac)`, `(blueprint)`, `(interpreter)`, `(config)`, `(deps)`.

-   **`subject` (bắt buộc):** Một mô tả ngắn gọn, súc tích về thay đổi, viết ở thì hiện tại.
    -   Bắt đầu bằng chữ thường.
    -   Không có dấu chấm ở cuối.

#### Ví dụ về Commit Message Tốt:

-   `feat(security): add rate limiting interceptor module`
-   `fix(interpreter): correctly handle root path in blueprints`
-   `docs(contributing): add detailed guide for writing a service`
-   `refactor(adapters): simplify service method call signature`
-   `chore(deps): upgrade pino and pino-pretty to latest versions`
-   `test(e2e): add verification for feature flag management UI`

## Gửi một Pull Request

Sau khi bạn đã hoàn thành việc phát triển và kiểm thử tính năng hoặc bản sửa lỗi của mình, đây là các bước để gửi đóng góp của bạn để được xem xét.

#### Quy trình Từng bước

1.  **Đồng bộ hóa Fork của bạn:** Trước khi bắt đầu, hãy đảm bảo fork của bạn được cập nhật với những thay đổi mới nhất từ repository gốc (`upstream`):
    ```bash
    # (Nếu chưa làm) Thêm remote upstream
    git remote add upstream https://github.com/ORIGINAL_OWNER/admin-panel-backend.git
    
    # Lấy các thay đổi mới nhất và rebase nhánh main của bạn
    git fetch upstream
    git checkout main
    git rebase upstream/main
    ```

2.  **Tạo một Nhánh Mới:** Luôn tạo một nhánh mới từ `main` cho các thay đổi của bạn. Đặt tên nhánh một cách rõ ràng.
    ```bash
    # Ví dụ:
    git checkout -b feat/add-billing-management
    # Hoặc:
    git checkout -b fix/user-role-update-bug
    ```

3.  **Thực hiện Thay đổi và Commit:**
    -   Thực hiện các thay đổi code của bạn.
    -   Commit các thay đổi của bạn theo từng đơn vị logic nhỏ.
    -   Sử dụng quy ước commit message mà chúng tôi đã nêu ở phần trên.

4.  **Đảm bảo tất cả Kiểm thử đều Vượt qua:**
    Đây là bước cực kỳ quan trọng. Trước khi push, hãy chạy toàn bộ bộ kiểm thử để đảm bảo bạn không vô tình làm hỏng bất kỳ tính năng nào hiện có.
    ```bash
    npm test
    ```
    Nếu có bất kỳ bài kiểm thử nào thất bại, hãy sửa chúng trước khi tiếp tục.

5.  **Push Nhánh của bạn lên Fork:**
    ```bash
    git push origin feat/add-billing-management
    ```

6.  **Mở một Pull Request (PR):**
    -   Truy cập repository gốc trên GitHub. Bạn sẽ thấy một thông báo đề xuất tạo một Pull Request từ nhánh bạn vừa push.
    -   Nhấp vào nút đó để bắt đầu tạo PR.
    -   **Base Repository:** Repository gốc của dự án.
    -   **Base Branch:** `main`.
    -   **Head Repository:** Fork của bạn.
    -   **Compare Branch:** Nhánh chứa các thay đổi của bạn (ví dụ: `feat/add-billing-management`).

7.  **Viết một Mô tả PR Rõ ràng:**
    -   **Tiêu đề:** Tiêu đề của PR nên súc tích và tuân theo quy ước commit message (ví dụ: `feat(billing): add invoice management module`).
    -   **Mô tả:** Trong phần mô tả, hãy giải thích rõ ràng:
        -   **Tại sao** thay đổi này là cần thiết? (Nó giải quyết vấn đề gì? Nó thêm giá trị gì?)
        -   **Làm thế nào** bạn đã giải quyết vấn đề? (Mô tả ngắn gọn về cách tiếp cận kỹ thuật của bạn).
        -   **Làm thế nào để kiểm tra?** (Các bước để người review có thể xác minh rằng thay đổi của bạn hoạt động đúng).
        -   Nếu PR của bạn có liên quan đến một Issue đã có, hãy liên kết nó bằng cách sử dụng các từ khóa như `Closes #123`.

#### Sau khi Gửi PR

-   Maintainer (người bảo trì) của dự án sẽ xem xét code của bạn.
-   Hãy sẵn sàng nhận phản hồi và thực hiện các thay đổi bổ sung nếu được yêu cầu. Chúng tôi xem xét code một cách hợp tác để đảm bảo chất lượng cao nhất.
-   Khi PR của bạn được chấp thuận, nó sẽ được merge vào nhánh `main`.

Cảm ơn bạn một lần nữa vì đã dành thời gian và công sức để đóng góp cho dự án. Chúng tôi rất mong chờ được xem xét những ý tưởng tuyệt vời của bạn!