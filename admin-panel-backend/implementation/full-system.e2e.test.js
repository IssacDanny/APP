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