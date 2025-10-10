# Hướng dẫn Build APK cho Android PDA

## Yêu cầu cài đặt

### 1. Cài đặt Java Development Kit (JDK)

- Download JDK 17 hoặc mới hơn: https://www.oracle.com/java/technologies/downloads/
- Thiết lập biến môi trường `JAVA_HOME`:
  ```
  JAVA_HOME=C:\Program Files\Java\jdk-17
  ```

### 2. Cài đặt Android Studio

- Download Android Studio: https://developer.android.com/studio
- Trong Android Studio, cài đặt:
  - Android SDK (API Level 33 trở lên)
  - Android SDK Build-Tools
  - Android SDK Platform-Tools
  - Android SDK Command-line Tools

### 3. Thiết lập biến môi trường Android

Thêm vào PATH:

```
ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\build-tools\33.0.0
```

## Các lệnh NPM Scripts có sẵn

### 1. Sync code với Android

```bash
npm run cap:sync
```

Hoặc chỉ sync Android:

```bash
npm run cap:sync:android
```

### 2. Mở project Android trong Android Studio

```bash
npm run cap:open:android
```

### 3. Build và run trên thiết bị/emulator

```bash
npm run cap:run:android
```

### 4. Copy web assets sang Android

```bash
npm run cap:build:android
```

## Cách build APK Debug (nhanh)

### Bước 1: Build web app

```bash
npm run build
```

### Bước 2: Sync với Android

```bash
npx cap sync android
```

### Bước 3: Build APK Debug

```bash
cd android
./gradlew assembleDebug
```

Hoặc trên Windows (PowerShell):

```powershell
cd android
.\gradlew.bat assembleDebug
```

APK Debug sẽ được tạo tại:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Cách build APK Release (cho production)

### Bước 1: Tạo keystore để ký APK

```bash
keytool -genkey -v -keystore shipment-tracker.keystore -alias shipment-tracker -keyalg RSA -keysize 2048 -validity 10000
```

Lưu file `shipment-tracker.keystore` ở nơi an toàn.

### Bước 2: Tạo file `android/key.properties`

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=shipment-tracker
storeFile=../shipment-tracker.keystore
```

### Bước 3: Cập nhật `android/app/build.gradle`

Thêm đoạn code sau trước `android` block:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Trong `android` block, thêm:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### Bước 4: Build APK Release

```bash
cd android
./gradlew assembleRelease
```

Hoặc trên Windows (PowerShell):

```powershell
cd android
.\gradlew.bat assembleRelease
```

APK Release sẽ được tạo tại:

```
android/app/build/outputs/apk/release/app-release.apk
```

## Build bằng Android Studio (Dễ hơn)

### Bước 1: Build web app

```bash
npm run build
```

### Bước 2: Mở Android Studio

```bash
npm run cap:open:android
```

### Bước 3: Build APK trong Android Studio

1. Chọn `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. Đợi build hoàn thành
3. Click vào thông báo "locate" để tìm file APK

## Cài đặt APK lên PDA Android

### Qua USB (ADB)

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Qua file trực tiếp

1. Copy file APK sang PDA
2. Mở file APK trên PDA
3. Cho phép cài đặt từ nguồn không xác định (nếu cần)
4. Nhấn Install

## Troubleshooting

### Lỗi: JAVA_HOME not set

Đảm bảo đã cài JDK và set biến môi trường `JAVA_HOME`.

### Lỗi: "Dependency requires at least JVM runtime version 11"

Nếu bạn thấy lỗi:

```
Dependency requires at least JVM runtime version 11. This build uses a Java 8 JVM.
```

**Nguyên nhân:** Bạn đang dùng Java 8, nhưng Android Gradle Plugin yêu cầu Java 11+.

**Giải pháp:**

1. Download và cài JDK 17 (khuyến nghị): https://www.oracle.com/java/technologies/downloads/
   - Hoặc OpenJDK: https://adoptium.net/
2. Set `JAVA_HOME` trỏ tới JDK mới:
   ```
   JAVA_HOME=C:\Program Files\Java\jdk-17
   ```
3. Thêm vào PATH:
   ```
   PATH=%JAVA_HOME%\bin;%PATH%
   ```
4. Restart PowerShell và kiểm tra:
   ```powershell
   java -version
   ```
   Phải thấy Java 11+ (ví dụ: `java version "17.0.x"`)

**Lưu ý:** Nếu bạn có nhiều JDK, đảm bảo `JAVA_HOME` trỏ đến JDK 17, không phải JDK 8.

### Lỗi: Android SDK not found

Đảm bảo đã cài Android Studio và set biến môi trường `ANDROID_HOME`.

### Lỗi: Build failed

1. Xóa folder `android` và tạo lại:
   ```bash
   rm -rf android
   npx cap add android
   npm run cap:sync:android
   ```

### Lỗi: Capacitor CLI not found

```bash
npm install -g @capacitor/cli
```

### Lỗi: gradlew.bat is not recognized (PowerShell)

Nếu bạn thấy lỗi:

```
gradlew.bat: The term 'gradlew.bat' is not recognized...
```

**Giải pháp:** PowerShell yêu cầu thêm `.\` trước tên file:

```powershell
# SAI (không hoạt động trong PowerShell)
gradlew.bat assembleDebug

# ĐÚNG (hoạt động trong PowerShell)
.\gradlew.bat assembleDebug
```

**Lưu ý:** Tất cả commands trong documentation này đã được cập nhật với `.\gradlew.bat`

## Cập nhật sau khi sửa code

Mỗi khi sửa code web, cần sync lại:

```bash
npm run cap:sync:android
```

Sau đó build lại APK.

## Lưu ý cho PDA

- Hầu hết các PDA Android chạy Android 7-12
- Test kỹ trên thiết bị thực vì emulator có thể không giống PDA
- Cân nhắc tối ưu cho màn hình nhỏ và độ phân giải thấp hơn
- Kiểm tra permissions (Camera, Storage) nếu app cần
- Test barcode scanner trên PDA thực

## Thêm Plugins Capacitor (nếu cần)

### Camera Plugin

```bash
npm install @capacitor/camera
npx cap sync
```

### Filesystem Plugin

```bash
npm install @capacitor/filesystem
npx cap sync
```

### Network Plugin

```bash
npm install @capacitor/network
npx cap sync
```

Xem thêm plugins: https://capacitorjs.com/docs/plugins
