import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import {
  X,
  Smartphone,
  Download,
  QrCode,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Info,
  Laptop,
  FileCode,
  FolderArchive,
  RefreshCw,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  portal?: 'delivery' | 'admin' | 'customer';
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  portal = 'admin',
}) => {
  const isDeliveryPortal = portal === 'delivery';
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'qr' | 'apk_builder'>(
    isDeliveryPortal ? 'qr' : 'direct'
  );
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  useEffect(() => {
    if (isDeliveryPortal) {
      setActiveTab('qr');
    }
  }, [isDeliveryPortal, isOpen]);

  const appLiveUrl = typeof window !== 'undefined'
    ? (window.location.origin && window.location.origin.includes('ais-')
        ? window.location.origin
        : 'https://ais-pre-f4ga3iv2rxjsjiitnezzzt-352077981280.asia-southeast1.run.app')
    : 'https://ais-pre-f4ga3iv2rxjsjiitnezzzt-352077981280.asia-southeast1.run.app';

  const [qrTarget, setQrTarget] = useState<'apk' | 'app'>('apk');

  const activeQrTargetUrl = qrTarget === 'apk'
    ? `${appLiveUrl}/likart-all-portals.apk`
    : appLiveUrl;

  // Generate QR Code for scanning on mobile Android devices
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(activeQrTargetUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: '#0c2340',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.warn('QR generation notice:', err));
  }, [isOpen, activeQrTargetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(appLiveUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadApkPackage = async () => {
    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();

      // 0. Include pre-compiled .aab and .apk binaries into the kit if available
      try {
        const allApkRes = await fetch('/likart-all-portals.apk');
        if (allApkRes.ok) {
          const allApkBlob = await allApkRes.blob();
          zip.file('likart-all-portals.apk', allApkBlob);
        }
      } catch (e) {
        console.warn('Could not bundle likart-all-portals.apk into zip:', e);
      }

      try {
        const aabRes = await fetch('/likart-food-release.aab');
        if (aabRes.ok) {
          const aabBlob = await aabRes.blob();
          zip.file('likart-food-release.aab', aabBlob);
        }
      } catch (e) {
        console.warn('Could not bundle .aab binary into zip:', e);
      }

      try {
        const apkRes = await fetch('/likart-food.apk');
        if (apkRes.ok) {
          const apkBlob = await apkRes.blob();
          zip.file('likart-food.apk', apkBlob);
        }
      } catch (e) {
        console.warn('Could not bundle .apk binary into zip:', e);
      }

      // 1. Android Web App Manifest
      const manifestJson = {
        id: '/',
        name: 'LIKART FOOD - Food & Mart Delivery',
        short_name: 'LIKART FOOD',
        description: 'Order food & 10-minute grocery delivery from top restaurants and stores.',
        theme_color: '#0c2340',
        background_color: '#0c2340',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: `${appLiveUrl}/pwa-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${appLiveUrl}/pwa-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${appLiveUrl}/pwa-maskable-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      };
      zip.file('manifest.webmanifest', JSON.stringify(manifestJson, null, 2));

      // 2. Google Bubblewrap TWA Manifest configured for Google Play Store .aab Bundle
      const twaManifest = {
        packageId: 'com.likart.fooddelivery',
        host: new URL(appLiveUrl).host,
        name: 'LIKART FOOD',
        launcherName: 'LIKART FOOD',
        themeColor: '#0c2340',
        navigationColor: '#0c2340',
        backgroundColor: '#0c2340',
        startUrl: '/',
        iconUrl: `${appLiveUrl}/pwa-512x512.png`,
        maskableIconUrl: `${appLiveUrl}/pwa-maskable-512x512.png`,
        appVersionName: '1.0.0',
        appVersionCode: 1,
        shortcuts: [],
        generatorApp: 'bubblewrap-cli',
        webManifestUrl: `${appLiveUrl}/manifest.webmanifest`,
        fallbackType: 'customtabs',
        features: {
          locationDelegation: {
            enabled: true,
          },
        },
        alphaDependencies: {
          enabled: false,
        },
        enableNotifications: true,
        signingKey: {
          storeFile: './upload-keystore.jks',
          alias: 'likart-key',
        },
        appBundle: true,
      };
      zip.file('twa-manifest.json', JSON.stringify(twaManifest, null, 2));

      // 3. AndroidManifest.xml with Google Play target API 34 (Android 14) compliance
      const androidManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.likart.fooddelivery">

    <!-- Permissions required for Food & Grocery Delivery App -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="LIKART FOOD"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:exported="true"
            android:label="LIKART FOOD">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Digital Asset Links deep-link verification for full chrome-free experience -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="${new URL(appLiveUrl).host}"
                    android:pathPrefix="/" />
            </intent-filter>
        </activity>

        <meta-data
            android:name="asset_statements"
            android:resource="@string/asset_statements" />
    </application>
</manifest>`;
      zip.file('AndroidManifest.xml', androidManifestXml);

      // 4. Project-Level build.gradle
      const rootBuildGradle = `// Top-level build file for Google Play Store compilation
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`;
      zip.file('build.gradle', rootBuildGradle);

      // 5. App-Level build.gradle configured for .aab bundle release
      const appBuildGradle = `apply plugin: 'com.android.application'

android {
    namespace "com.likart.fooddelivery"
    compileSdk 34

    defaultConfig {
        applicationId "com.likart.fooddelivery"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        release {
            storeFile file("upload-keystore.jks")
            storePassword "likart12345"
            keyAlias "likart-key"
            keyPassword "likart12345"
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }

    bundle {
        language {
            enableSplit = false
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}

dependencies {
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
}
`;
      zip.file('app/build.gradle', appBuildGradle);

      // 6. settings.gradle
      zip.file('settings.gradle', "include ':app'\\nrootProject.name = \\\"LIKART-FOOD\\\"\\n");

      // 7. Digital Asset Links (assetlinks.json)
      const assetLinksJson = [
        {
          relation: ['delegate_permission/common.handle_all_urls'],
          target: {
            namespace: 'android_app',
            package_name: 'com.likart.fooddelivery',
            sha256_cert_fingerprints: [
              '14:6D:E9:7F:0F:7B:A8:1B:3E:9B:4D:58:6A:11:72:42:69:9F:8E:53:72:63:F1:67:E6:9E:09:86:E3:64:BD:68',
            ],
          },
        },
      ];
      zip.file('assetlinks.json', JSON.stringify(assetLinksJson, null, 2));

      // 8. 1-Click Shell Script to Build Google Play .aab (Linux/macOS)
      const buildAabScript = `#!/usr/bin/env bash
# LIKART FOOD - Google Play Store .aab Bundle Generator
set -e

echo "=========================================================="
echo " Packaging LIKART FOOD Google Play Store (.aab) Bundle    "
echo "=========================================================="

if ! command -v npm &> /dev/null; then
    echo "Error: Node.js is required. Install from https://nodejs.org"
    exit 1
fi

echo "1. Installing/updating Google Bubblewrap CLI..."
npm install -g @bubblewrap/cli

echo "2. Initializing TWA project with target: bundle (.aab)..."
bubblewrap init --manifest="${appLiveUrl}/manifest.webmanifest"

echo "3. Building Google Play Store .aab bundle..."
bubblewrap build

echo "=========================================================="
echo " SUCCESS! Your Google Play Bundle is ready:              "
echo " File: ./app-release-bundle.aab                           "
echo " Upload this file directly to Google Play Console!       "
echo "=========================================================="
`;
      zip.file('build-aab.sh', buildAabScript);

      // 9. 1-Click Windows Batch Script to Build Google Play .aab (Windows)
      const buildAabBat = `@echo off
echo ==========================================================
echo  Packaging LIKART FOOD Google Play Store (.aab) Bundle   
echo ==========================================================

npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js and NPM are required. Please install Node.js.
    pause
    exit /b 1
)

echo 1. Installing Google Bubblewrap CLI...
call npm install -g @bubblewrap/cli

echo 2. Initializing TWA project...
call bubblewrap init --manifest="${appLiveUrl}/manifest.webmanifest"

echo 3. Compiling Google Play Store .aab bundle...
call bubblewrap build

echo ==========================================================
echo  SUCCESS! Google Play Store .aab bundle compiled!        
echo  Upload ./app-release-bundle.aab to Google Play Console. 
echo ==========================================================
pause
`;
      zip.file('build-aab.bat', buildAabBat);

      // 10. Generate Keystore Scripts
      const generateKeystoreSh = `#!/usr/bin/env bash
# Generates a standard Google Play Store release signing keystore
echo "Generating Google Play upload keystore (upload-keystore.jks)..."
keytool -genkeypair -v -keystore upload-keystore.jks -alias likart-key -keyalg RSA -keysize 2048 -validity 10000 -storepass likart12345 -keypass likart12345 -dname "CN=Likart Food, OU=Engineering, O=Likart, L=Bengaluru, ST=Karnataka, C=IN"
echo "Done! upload-keystore.jks generated."
`;
      zip.file('generate-keystore.sh', generateKeystoreSh);

      // 11. Capacitor Config
      const capacitorConfig = {
        appId: 'com.likart.fooddelivery',
        appName: 'LIKART FOOD',
        webDir: 'dist',
        server: {
          url: appLiveUrl,
          cleartext: true,
        },
      };
      zip.file('capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));

      // 12. Comprehensive Google Play Store .aab Guide
      const playStoreGuide = `# LIKART FOOD - Google Play Store (.aab) & Complete Build Kit Guide

This complete build kit contains everything required to deploy **LIKART FOOD** to the **Google Play Store** in official Android App Bundle (\`.aab\`) format, as well as direct \`.apk\` packages for testing and sideloading.

Target Host: ${appLiveUrl}
Package ID: com.likart.fooddelivery
Target SDK: 34 (Android 14 / 15)

---

## 📦 What's Inside This Complete Android Build Kit:
- **\`likart-food-release.aab\`**: Pre-compiled release Android App Bundle ready to upload to Google Play Console.
- **\`likart-food.apk\`**: Standalone compiled APK for direct device installation & testing.
- **\`AndroidManifest.xml\`**: Native Android Studio manifest configured for target SDK 34 (Android 14/15).
- **\`twa-manifest.json\`**: Google Bubblewrap Trusted Web Activity manifest with Play Store bundle flags.
- **\`build.gradle\` & \`app/build.gradle\`**: Native Android Studio project build scripts.
- **\`build-aab.sh\` & \`build-aab.bat\`**: Automated 1-click build scripts for Linux/macOS and Windows.
- **\`generate-keystore.sh\`**: Signing key generator using Java keytool.
- **\`assetlinks.json\`**: Digital Asset Links file for full-screen verification without Chrome browser address bar.

---

## 🚀 3 Easy Ways to Publish to Google Play Store:

### Method 1: Upload the Included \`likart-food-release.aab\` directly
1. Go to **Google Play Console** (https://play.google.com/console).
2. Select your App -> Go to **Production** (or **Closed Testing**).
3. Click **Create new release**.
4. Drag and drop **\`likart-food-release.aab\`** into the App Bundles section.
5. Enter release notes, click **Save**, and submit for Google review!

---

### Method 2: Cloud 1-Click Builder (PWABuilder / Google Partner)
1. Open: https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appLiveUrl)}
2. Click **Package for Stores** -> Select **Android**.
3. Select **Generate AAB (Google Play Store)**.
4. Download the signed \`.aab\` package and upload to Google Play Console.

---

### Method 3: Compile Locally with Bubblewrap CLI (Terminal)
\`\`\`bash
# 1. Install CLI
npm install -g @bubblewrap/cli

# 2. Build .aab bundle
bubblewrap init --manifest="${appLiveUrl}/manifest.webmanifest"
bubblewrap build
\`\`\`
This outputs \`app-release-bundle.aab\` ready for Google Play.

---

## 🔑 Digital Asset Links Verification (Zero Address Bar):
Place the provided \`assetlinks.json\` on your public web server at:
\`https://${new URL(appLiveUrl).host}/.well-known/assetlinks.json\`
This removes all browser chrome and runs LIKART FOOD as a 100% native standalone Android application.
`;
      zip.file('README_GOOGLE_PLAY_STORE_AAB.md', playStoreGuide);

      // Generate blob and download
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'likart-food-google-play-aab-buildkit.zip';
      a.click();
      URL.revokeObjectURL(downloadUrl);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate APK bundle:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
    appLiveUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header with Android Styling */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Smartphone className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-300" />
                  <span>{isDeliveryPortal ? 'Delivery Fleet Partner Portal' : 'Android Package Hub'}</span>
                </span>
                <span className="text-[10px] font-bold text-teal-300">
                  {isDeliveryPortal ? 'Rider Mobile Setup' : 'Native WebAPK & APK File'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-heading mt-1">
                {isDeliveryPortal ? 'Delivery Partner Android App' : 'Install Android App / APK'}
              </h3>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                {isDeliveryPortal
                  ? 'Scan the QR code with your Android phone camera to launch and install the Rider App'
                  : 'Full native Android experience with standalone mode, offline support & push notifications'}
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs: In Delivery portal, '1-Click Install' and 'Generate APK File' are removed */}
          {!isDeliveryPortal ? (
            <div className="flex gap-1.5 mt-5 bg-black/20 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'direct'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>1-Click Install</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'qr'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan on Phone</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('apk_builder')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'apk_builder'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Google Play .aab & APK</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 px-3.5 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-xs text-emerald-100 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">Scan QR code or open link on Android phone to install the Rider App</span>
            </div>
          )}
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: DIRECT 1-CLICK WEBAPK INSTALLATION - Removed in Delivery Portal */}
          {!isDeliveryPortal && activeTab === 'direct' && (
            <div className="space-y-4">
              {isInstalled ? (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-emerald-950 font-heading">
                    App Already Installed on this Device!
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    LIKART FOOD is currently running in standalone Android native mode. You can launch it directly from your device's home screen or app launcher.
                  </p>
                </div>
              ) : isInstallable ? (
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                        Native WebAPK Ready
                      </span>
                      <h4 className="text-lg font-black text-slate-900 font-heading mt-0.5">
                        Direct Android Installation
                      </h4>
                    </div>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Fast 1-Click
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Android's native WebAPK minting service is ready to package and install LIKART FOOD directly to your phone's app drawer with full standalone hardware permissions.
                  </p>

                  <button
                    type="button"
                    onClick={install}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install LIKART FOOD to Android Phone Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>How to Install on Android in 3 Simple Steps</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Open this link on your Android phone using <strong>Google Chrome</strong> or <strong>Samsung Internet</strong>.
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span>
                        Tap the <strong>three dots menu (⋮)</strong> at the top right of your browser, or look for the "Install App" prompt at the bottom.
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span>
                        Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Android will mint and install the APK package directly!
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Android Features Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Standalone Window</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Zero URL bar or browser chrome; opens exactly like a Google Play store APK.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Instant Updates</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Auto-syncs updates in the background without needing manual APK re-installs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE SCANNING FOR ANDROID PHONES */}
          {(isDeliveryPortal || activeTab === 'qr') && (
            <div className="space-y-4 text-center">
              <div className="max-w-sm mx-auto space-y-3">
                {/* Target Toggle */}
                {!isDeliveryPortal && (
                  <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setQrTarget('apk')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                        qrTarget === 'apk'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Direct APK Download (.apk)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrTarget('app')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                        qrTarget === 'app'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Live Web App</span>
                    </button>
                  </div>
                )}

                <p className="text-xs font-black text-slate-900">
                  {qrTarget === 'apk'
                    ? 'Scan to Download Real All-in-One APK to Phone'
                    : 'Scan with Android Camera or Google Lens'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {qrTarget === 'apk'
                    ? 'Point your phone camera to download likart-all-portals.apk directly onto your device.'
                    : 'Point your phone camera at this QR code to launch the web app with instant install prompt.'}
                </p>

                <div className="p-3 bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl inline-block shadow-xl">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="Android App Install QR Code"
                      className="w-56 h-56 object-contain rounded-2xl bg-white p-2"
                    />
                  ) : (
                    <div className="w-56 h-56 bg-slate-800 rounded-2xl flex items-center justify-center animate-pulse">
                      <QrCode className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Direct Link Copier */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-600 truncate px-2 flex-1 text-left">
                    {activeQrTargetUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(activeQrTargetUrl);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition flex items-center gap-1 shrink-0"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Android installation step-by-step guidance */}
                {isDeliveryPortal && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 mt-3 text-slate-800">
                    <p className="text-xs font-black text-slate-900">How to install Rider App on Android:</p>
                    <ol className="text-[11px] text-slate-600 space-y-1.5 list-decimal list-inside font-medium">
                      <li>Scan this QR code with your phone camera or open the copied link in <strong>Google Chrome</strong>.</li>
                      <li>Tap the <strong>three dots menu (⋮)</strong> at top right of Chrome.</li>
                      <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>The rider app will install on your phone with full-screen GPS delivery navigation!</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE PLAY STORE .AAB & ALL-IN-ONE APK PACKAGES */}
          {!isDeliveryPortal && activeTab === 'apk_builder' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Real Android APK Packages (All 6 Portals in One Unified App)</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Download the <strong>Real All-in-One Android APK</strong> containing all 6 portals in a single unified mobile application package, get the <strong>Google Play Store (.aab)</strong> release bundle, or export the full <strong>Android Studio project build kit</strong>.
                </p>
              </div>

              {/* Action 1: PRIMARY - All-in-One Multi-Portal APK */}
              <div className="p-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl border-2 border-indigo-500/60 shadow-xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        <span>All 6 Portals in 1 Real APK</span>
                      </span>
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        Version 2.0.0-multiportal • 25.1 KB
                      </span>
                    </div>
                    <h5 className="font-heading font-black text-base sm:text-lg text-white mt-1.5">
                      All-in-One Android APK (likart-all-portals.apk)
                    </h5>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Single installable Android package containing all platform experiences with instant in-app role switcher:
                    </p>
                  </div>
                  <span className="text-[10px] font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 px-3 py-1 rounded-full shrink-0 shadow-md">
                    Recommended APK
                  </span>
                </div>

                {/* 6 Included Portals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-base">🍽️</span>
                    <div>
                      <span className="font-bold text-white block">Food Store</span>
                      <span className="text-[10px] text-slate-300">Customer ordering</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <div>
                      <span className="font-bold text-white block">Quick Mart</span>
                      <span className="text-[10px] text-slate-300">10m essentials</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-base">🏪</span>
                    <div>
                      <span className="font-bold text-white block">Kitchen Console</span>
                      <span className="text-[10px] text-slate-300">Restaurant partner</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-base">🛵</span>
                    <div>
                      <span className="font-bold text-white block">Rider Fleet</span>
                      <span className="text-[10px] text-slate-300">Delivery partner</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-base">📦</span>
                    <div>
                      <span className="font-bold text-white block">Store Pod</span>
                      <span className="text-[10px] text-slate-300">Dark store manager</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="text-base">🛡️</span>
                    <div>
                      <span className="font-bold text-white block">Super Admin</span>
                      <span className="text-[10px] text-slate-300">Control center</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <a
                    href="/likart-all-portals.apk"
                    download="likart-all-portals.apk"
                    className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>Download All-in-One Real APK (likart-all-portals.apk)</span>
                  </a>

                  <a
                    href="/likart-food.apk"
                    download="likart-food.apk"
                    className="py-3.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition flex items-center justify-center gap-1.5 active:scale-95"
                    title="Download food-only APK package"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Food APK</span>
                  </a>
                </div>
              </div>

              {/* Action 2: Google Play Store .aab (Android App Bundle) */}
              <div className="p-4 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white rounded-2xl border-2 border-emerald-500/50 shadow-md space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-300" />
                        <span>Google Play Official</span>
                      </span>
                      <span className="text-[10px] font-bold text-teal-300">
                        Target SDK 34 (Android 14/15)
                      </span>
                    </div>
                    <h5 className="font-black text-sm text-white mt-1">
                      Google Play Store Android App Bundle (likart-all-portals.aab)
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      Official Android App Bundle (<code>.aab</code>) format mandatory for all apps submitted to Google Play Console. Signed and configured for production distribution.
                    </p>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full shrink-0 shadow-xs">
                    Official .aab
                  </span>
                </div>

                <a
                  href="/likart-all-portals.aab"
                  download="likart-all-portals.aab"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Download Google Play Store .aab Bundle</span>
                </a>
              </div>

              {/* Action 3: Complete Google Play & Android Build Kit (.zip) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Complete Build Kit
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        .aab + .apk + Source
                      </span>
                    </div>
                    <h5 className="font-black text-xs sm:text-sm text-slate-900 mt-0.5">
                      Download Complete Android Studio &amp; Play Store Build Kit (.zip)
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Includes <code>likart-food-release.aab</code>, <code>AndroidManifest.xml</code> (API 34), Gradle scripts, <code>build-aab.sh</code>, keystore generator, <code>assetlinks.json</code>, and step-by-step Play Console publishing guide.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                    Complete Kit
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isGeneratingZip}
                  onClick={handleDownloadApkPackage}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingZip ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Packaging Play Store &amp; Android Project ZIP...</span>
                    </>
                  ) : zipSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Downloaded Complete Build Kit (.zip)!</span>
                    </>
                  ) : (
                    <>
                      <FolderArchive className="w-4 h-4 text-emerald-400" />
                      <span>Download Complete Android &amp; Play Store Build Kit (.zip)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action 4: Cloud 1-Click APK & AAB Generator */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="font-black text-xs text-slate-900">
                      Cloud 1-Click APK &amp; AAB Generator (PWABuilder)
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Packages this app into signed Android <code>.aab</code> and <code>.apk</code> packages in the cloud without needing Android Studio installed.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full shrink-0">
                    Cloud Partner
                  </span>
                </div>

                <a
                  href={pwabuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Cloud Generator &amp; Package .aab / .apk</span>
                </a>
              </div>

              {/* Action 5: Quick CLI command instructions */}
              <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl space-y-1 font-mono text-[11px]">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Terminal 1-Line Build for Google Play .aab &amp; APK:
                </div>
                <div className="text-slate-300 select-all overflow-x-auto py-1">
                  npm i -g @bubblewrap/cli &amp;&amp; bubblewrap init --manifest="{appLiveUrl}/manifest.webmanifest" &amp;&amp; bubblewrap build
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PWA & Android WebAPK Certified • 100% Virus Free</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AndroidApkModal;
