#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/.." && pwd)"
BUILD_DIR="$ROOT_DIR/android_build"
DIST_DIR="$ROOT_DIR/dist"
PUBLIC_DIR="$ROOT_DIR/public"

echo "=== MEMULAI KOMPILASI ANDROID APK L.A KOMPOS ==="
echo "ROOT_DIR: $ROOT_DIR"
echo "BUILD_DIR: $BUILD_DIR"

JAVAC="/usr/lib/jvm/java-17-openjdk-amd64/bin/javac"
KEYTOOL="/usr/lib/jvm/java-17-openjdk-amd64/bin/keytool"
ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
DX="/usr/bin/dalvik-exchange"

mkdir -p "$BUILD_DIR/src/com/lakompos/app"
mkdir -p "$BUILD_DIR/res/values"
mkdir -p "$BUILD_DIR/res/mipmap-mdpi"
mkdir -p "$BUILD_DIR/res/mipmap-hdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xhdpi"
mkdir -p "$BUILD_DIR/obj"
mkdir -p "$BUILD_DIR/bin"
mkdir -p "$BUILD_DIR/assets"

# 1. Salin icon
cp -f "$PUBLIC_DIR/favicon.png" "$BUILD_DIR/res/mipmap-mdpi/ic_launcher.png" 2>/dev/null || true
cp -f "$PUBLIC_DIR/pwa-192x192.png" "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png" 2>/dev/null || true
cp -f "$PUBLIC_DIR/pwa-512x512.png" "$BUILD_DIR/res/mipmap-xhdpi/ic_launcher.png" 2>/dev/null || true

# 2. Salin web assets dist ke assets/
echo "Menyalin aset web dari $DIST_DIR..."
rm -rf "$BUILD_DIR/assets"/*
cp -r "$DIST_DIR"/* "$BUILD_DIR/assets/"

# 3. Generate R.java menggunakan aapt
echo "Menjalankan aapt package R.java..."
aapt package -f -m -J "$BUILD_DIR/src" \
    -M "$BUILD_DIR/AndroidManifest.xml" \
    -S "$BUILD_DIR/res" \
    -I "$ANDROID_JAR"

# 4. Kompilasi Java classes
echo "Mengompilasi Java classes dengan javac..."
rm -rf "$BUILD_DIR/obj"/*
"$JAVAC" -source 1.8 -target 1.8 \
    -cp "$ANDROID_JAR" \
    -d "$BUILD_DIR/obj" \
    "$BUILD_DIR"/src/com/lakompos/app/*.java

# 5. Ubah Java bytecode ke Android Dalvik DEX (classes.dex)
echo "Mengonversi bytecode ke classes.dex dengan dalvik-exchange..."
rm -f "$BUILD_DIR/bin/classes.dex"
"$DX" --dex --output="$BUILD_DIR/bin/classes.dex" "$BUILD_DIR/obj"

# 6. Buat file APK awal (unaligned.apk) berisi manifest, resources, dan assets
echo "Mengemas berkas ke unaligned.apk..."
rm -f "$BUILD_DIR/bin/unaligned.apk"
aapt package -f \
    -M "$BUILD_DIR/AndroidManifest.xml" \
    -S "$BUILD_DIR/res" \
    -A "$BUILD_DIR/assets" \
    -I "$ANDROID_JAR" \
    -F "$BUILD_DIR/bin/unaligned.apk"

# 7. Masukkan classes.dex ke dalam APK
echo "Menambahkan classes.dex ke APK..."
cd "$BUILD_DIR/bin"
aapt add unaligned.apk classes.dex

# 8. ZipAlign APK
echo "Menjalankan zipalign..."
rm -f "$BUILD_DIR/bin/aligned.apk"
zipalign -v -p 4 "$BUILD_DIR/bin/unaligned.apk" "$BUILD_DIR/bin/aligned.apk"

# 9. Buat Release Keystore jika belum ada
if [ ! -f "$BUILD_DIR/release.keystore" ]; then
    echo "Membuat keystore sertifikat Android..."
    "$KEYTOOL" -genkey -v \
        -keystore "$BUILD_DIR/release.keystore" \
        -alias lakompos \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass lakompos123 \
        -keypass lakompos123 \
        -dname "CN=L.A Kompos, OU=Produksi, O=LA Kompos, L=Indonesia, ST=ID, C=ID"
fi

# 10. Tanda tangani APK dengan apksigner (v1, v2, v3 signature)
echo "Menandatangani APK dengan apksigner..."
rm -f "$PUBLIC_DIR/LA_KOMPOS.apk"
apksigner sign --ks "$BUILD_DIR/release.keystore" \
    --ks-pass pass:lakompos123 \
    --out "$PUBLIC_DIR/LA_KOMPOS.apk" \
    "$BUILD_DIR/bin/aligned.apk"

# 11. Verifikasi tanda tangan APK
echo "Memverifikasi integritas file APK..."
apksigner verify --verbose "$PUBLIC_DIR/LA_KOMPOS.apk"

echo "=== BERHASIL! BERKAS APK TERSEDIA DI $PUBLIC_DIR/LA_KOMPOS.apk ==="
ls -lh "$PUBLIC_DIR/LA_KOMPOS.apk"
