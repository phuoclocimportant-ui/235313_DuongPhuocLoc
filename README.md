
## Chạy backend bằng Docker

    cd backend
    docker build -t locimportant/backend:latest .
    docker run -d --name backend -p 5000:5000 --env-file .env locimportant/backend:latest

Hoặc truyền biến môi trường trực tiếp:

    docker run -d --name backend -p 5000:5000 -e MONGODB_URI="<chuoi ket noi Atlas>" -e CORS_ORIGIN="*" locimportant/backend:latest


cd ~/235313_DuongPhuocLoc/frontend

# Script chạy lúc container khởi động: ghi địa chỉ backend từ biến API_URL
cat > 40-config.sh <<'EOF'
#!/bin/sh
echo "window.__API_URL__ = \"${API_URL:-}\";" > /usr/share/nginx/html/config.js

## Chạy frontend bằng Docker

    cd frontend
    docker build -t locimportant/frontend:latest .
    docker run -d --name frontend -p 3000:80 -e API_URL=http://localhost:5000 locimportant/frontend:latest

- Truy cập: http://localhost:3000
- Biến `API_URL` là địa chỉ backend, đổi được khi triển khai mà không cần build lại image.
- Docker Hub: https://hub.docker.com/r/locimportant/frontend

## Triển khai Frontend (Render)

- URL ứng dụng: https://web-235313.onrender.com
- Cách triển khai: Render Web Service chạy từ Docker image `locimportant/frontend:latest`
- Biến môi trường: `API_URL` = URL backend API

## Triển khai Frontend (Render)

- URL ứng dụng: https://web-235313.onrender.com
- Cách triển khai: Render Web Service chạy từ Docker image `locimportant/frontend:latest`
- Biến môi trường: `API_URL` = URL backend API

## Triển khai Backend API (Render)

- URL API: https://api-235313.onrender.com
- Kiểm tra: https://api-235313.onrender.com/health
- Danh sách thiết bị: https://api-235313.onrender.com/api/devices
- Biến môi trường trên Render: `MONGODB_URI`, `CORS_ORIGIN`

## Triển khai Backend API (Render)

- URL API: https://api-235313.onrender.com
- Kiểm tra: https://api-235313.onrender.com/health
- Danh sách thiết bị: https://api-235313.onrender.com/api/devices
- Biến môi trường trên Render: `MONGODB_URI`, `CORS_ORIGIN`
