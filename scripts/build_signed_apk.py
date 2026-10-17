import os
import sys
import shutil
import zipfile
import subprocess
import json

def build_apk():
    build_dir = "/tmp/sonic_build"
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir, exist_ok=True)

    base_apk = "/app/applet/public/download/SonicAI.apk"
    extracted_dir = os.path.join(build_dir, "extracted")

    print("1. Extracting base APK...")
    with zipfile.ZipFile(base_apk, 'r') as zf:
        zf.extractall(extracted_dir)

    print("2. Customizing settings.json...")
    settings_path = os.path.join(extracted_dir, "assets", "settings.json")
    os.makedirs(os.path.dirname(settings_path), exist_ok=True)

    settings = {
        "sites": [
            {
                "url": "https://ais-pre-jipjb73w3ja665utqebohi-479264009138.asia-southeast1.run.app",
                "title": "Sonic AI - Voice Assistant"
            }
        ],
        "other": "https://ais-pre-jipjb73w3ja665utqebohi-479264009138.asia-southeast1.run.app",
        "match": [
            ["host", "contains", "run.app"]
        ],
        "remote_debug": False,
        "console_log": True,
        "js_interface": True,
        "context_menu": False,
        "not_matching": False,
        "local_sites": False,
        "web_settings": {
            "JavaScriptEnabled": True,
            "DomStorageEnabled": True,
            "DatabaseEnabled": True
        },
        "source": "sonic_ai",
        "timestamp": "2026-10-17T10:35:00Z"
    }

    with open(settings_path, 'w') as f:
        json.dump(settings, f, indent=2)

    print("3. Removing old META-INF signatures...")
    meta_dir = os.path.join(extracted_dir, "META-INF")
    if os.path.exists(meta_dir):
        for fname in os.listdir(meta_dir):
            if fname.endswith(('.SF', '.RSA', '.DSA', '.MF')):
                os.remove(os.path.join(meta_dir, fname))

    print("4. Repackaging zip...")
    unaligned_apk = os.path.join(build_dir, "unaligned.apk")
    with zipfile.ZipFile(unaligned_apk, 'w', zipfile.ZIP_DEFLATED) as zout:
        for root, dirs, files in os.walk(extracted_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, extracted_dir)
                zout.write(full_path, rel_path)

    print("5. Zipaligning APK...")
    aligned_apk = os.path.join(build_dir, "aligned.apk")
    subprocess.run(["zipalign", "-v", "-p", "4", unaligned_apk, aligned_apk], check=True, stdout=subprocess.DEVNULL)

    print("6. Creating release keystore...")
    keystore_path = os.path.join(build_dir, "sonic.keystore")
    subprocess.run([
        "keytool", "-genkeypair", "-v",
        "-keystore", keystore_path,
        "-alias", "sonic_key",
        "-keyalg", "RSA", "-keysize", "2048",
        "-validity", "10000",
        "-storepass", "sonicai2026",
        "-keypass", "sonicai2026",
        "-dname", "CN=Sonic AI, OU=Sonic, O=Sonic, L=Lahore, ST=Punjab, C=PK"
    ], check=True, stdout=subprocess.DEVNULL)

    print("7. Signing APK with apksigner (v1, v2, v3)...")
    final_output = "/app/applet/public/download/SonicAI.apk"
    subprocess.run([
        "apksigner", "sign",
        "--ks", keystore_path,
        "--ks-key-alias", "sonic_key",
        "--ks-pass", "pass:sonicai2026",
        "--key-pass", "pass:sonicai2026",
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "true",
        "--v3-signing-enabled", "true",
        "--out", final_output,
        aligned_apk
    ], check=True)

    print("8. Verifying APK signature...")
    res = subprocess.run(["apksigner", "verify", "-v", final_output], capture_output=True, text=True, check=True)
    print(res.stdout)
    print(f"SUCCESS! Signed APK built at {final_output} (Size: {os.path.getsize(final_output) / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    build_apk()
