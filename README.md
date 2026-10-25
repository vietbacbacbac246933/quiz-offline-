# Quiz Offline

Công cụ tạo đề ôn tập chạy trong trình duyệt. Bản deploy tĩnh nằm trong `public/`; `npm run build` sao chép các file cần thiết vào `dist/` để Vercel phục vụ.

## Chạy và build

```powershell
npm run build
```

Vercel dùng `npm run build` và thư mục output `dist` theo `vercel.json`. Chưa deploy thực tế từ repository này.

## Dữ liệu và sử dụng

- Đề được lưu trong localStorage của trình duyệt đang sử dụng. Đề không tự đồng bộ giữa máy hoặc trình duyệt.
- Có thể nhập DOCX qua Mammoth.js, sửa nội dung, lưu đề và sao lưu JSON.
- Chọn đáp án nhập từ Word cần được giáo viên kiểm tra; định dạng đậm/gạch chân và bảng đáp án chỉ được ghi nhận như gợi ý.
- Xuất HTML để học sinh mở làm bài. Bản HTML nhúng câu hỏi, CSS và JavaScript; kết quả được lưu cục bộ và có thể tải thành JSON.
- Giáo viên chọn một hoặc nhiều file kết quả JSON để xuất bảng Excel bằng SheetJS.

## Kiểm thử

```powershell
npm run test:quiz-core
npm run test:quiz-standalone
npm run test:quiz-word
npm run test:offline
npm run test:shortanswer
npm run test:question-editor
npm run test:review
npm run test:mem
```

`test:quiz-standalone` thực thi logic xuất đề trong DOM shim; cần mở thử trên trình duyệt thật cho mỗi thay đổi quan trọng. Không dùng kết quả phía client để xác minh chống gian lận.
