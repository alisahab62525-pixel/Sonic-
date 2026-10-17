# Sonic AI – Android Voice Assistant Project

This directory contains the production-ready Android Kotlin + Jetpack Compose codebase for **Sonic AI**, featuring owner voice biometrics, multi-voice TTS, AES-256 encrypted memory vault (SQLCipher), Gemini 3.8 Flash, and Open-Meteo weather.

## 📁 Project Structure

- `app/src/main/java/com/sonic/ai/MainActivity.kt` - Main Jetpack Compose activity with Glowing Orb & audio reactivity.
- `app/src/main/java/com/sonic/ai/biometrics/VoiceEmbeddingHelper.kt` - TFLite ECAPA-TDNN speaker biometric verification & MFCC cosine similarity.
- `app/src/main/java/com/sonic/ai/data/SonicGeminiRepository.kt` - Gemini 3.8 Flash online integration with on-device rule fallback.
- `app/src/main/java/com/sonic/ai/data/local/SonicDatabase.kt` - Encrypted Room DB with SQLCipher for owner voice, memory items, and chat history.
- `app/src/main/java/com/sonic/ai/tts/SonicTTSManager.kt` - Multi-voice TTS manager (Male, Female, Child pitch/rate profiles).
- `app/src/main/java/com/sonic/ai/network/WeatherTimeService.kt` - Open-Meteo Retrofit client for worldwide weather and time.
- `app/src/main/AndroidManifest.xml` - All runtime permissions (Mic, GPS, Calls, SMS, Contacts, Calendar).
- `app/build.gradle.kts` - Complete Gradle build script with dependencies.

## 🔑 Setup in Android Studio

1. Open Android Studio and choose **Open an Existing Project**, selecting the `android` folder.
2. In the root directory, create a file named `local.properties`:
   ```properties
   sdk.dir=/path/to/your/android/sdk
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```
3. Sync Gradle and click **Run** on an Android 8.0+ device or emulator.
