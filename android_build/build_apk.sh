#!/bin/bash
set -e

echo "=== Memulai Perakitan L.A KOMPOS.apk ==="
mkdir -p /android_build/src/com/lakompos/app
mkdir -p /android_build/res/values
mkdir -p /android_build/res/mipmap-mdpi
mkdir -p /android_build/res/mipmap-hdpi
mkdir -p /android_build/res/mipmap-xhdpi
mkdir -p /android_build/bin
mkdir -p /android_build/assets

# Copy icons
cp /public/favicon.png /android_build/res/mipmap-mdpi/ic_launcher.png 2>/dev/null || true
cp /public/pwa-192x192.png /android_build/res/mipmap-hdpi/ic_launcher.png 2>/dev/null || true
cp /public/pwa-512x512.png /android_build/res/mipmap-xhdpi/ic_launcher.png 2>/dev/null || true

# Copy built web dist to assets
rm -rf /android_build/assets/*
cp -r /dist/* /android_build/assets/

echo "Build script ready."
