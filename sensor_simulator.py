import random
import time
import requests

# Cấu hình API Endpoint của Backend
API_URL = "http://localhost:5000/api/smoke-logs"
DEVICE_CODE = "DEV_A_001"

print(f"📡 Đã khởi động Trạm cảm biến IoT Giả lập [{DEVICE_CODE}]...")
print("-------------------------------------------------------")

try:
    while True:
        # Giả lập xác suất: 80% trạng thái Bình thường, 20% trạng thái Báo động khói
        is_alert = random.random() < 0.2

        if is_alert:
            smoke_level = random.randint(550, 900)  # Nồng độ khói vượt ngưỡng (>500)
            gas_level = random.randint(180, 350)
            status = "ALERT"
        else:
            smoke_level = random.randint(50, 200)  # Nồng độ khói an toàn (<200)
            gas_level = random.randint(20, 80)
            status = "NORMAL"

        payload = {
            "device_code": DEVICE_CODE,
            "smoke_level": smoke_level,
            "gas_level": gas_level,
            "status": status,
        }

        # Gửi dữ liệu qua API POST /api/smoke-logs
        response = requests.post(API_URL, json=payload, timeout=5)

        if response.status_code == 201:
            icon = "🚨 [CẢNH BÁO KHÓI]" if status == "ALERT" else "✅ [AN TOÀN]"
            print(
                f"{icon} Khói: {smoke_level} ppm | "
                f"Gas: {gas_level} ppm | Status: {status}"
            )
        else:
            print(f"❌ Lỗi gửi dữ liệu: {response.status_code}")

        # Tần suất gửi: 3 giây / lần
        time.sleep(3)

except KeyboardInterrupt:
    print("\n🛑 Đã dừng trạm cảm biến giả lập.")