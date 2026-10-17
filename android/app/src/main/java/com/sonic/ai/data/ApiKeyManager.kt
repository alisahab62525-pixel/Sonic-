package com.sonic.ai.data

import android.content.Context
import android.content.SharedPreferences

/**
 * Manages Gemini API Key securely using Android SharedPreferences.
 * The assistant remains DISABLED / INACTIVE until a valid key is provided by the user.
 */
class ApiKeyManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "sonic_ai_secure_prefs"
        private const val KEY_GEMINI_API = "gemini_user_api_key"
    }

    /**
     * Retrieves the stored user API key
     */
    fun getApiKey(): String? {
        val key = prefs.getString(KEY_GEMINI_API, null)
        return key?.takeIf { it.isNotBlank() && it != "MY_GEMINI_API_KEY" }
    }

    /**
     * Saves the user-entered API key
     */
    fun saveApiKey(apiKey: String) {
        prefs.edit().putString(KEY_GEMINI_API, apiKey.trim()).apply()
    }

    /**
     * Clears the API key, deactivating Sonic
     */
    fun clearApiKey() {
        prefs.edit().remove(KEY_GEMINI_API).apply()
    }

    /**
     * Checks if Sonic is active (valid API key exists)
     */
    fun isKeyConfigured(): Boolean {
        val key = getApiKey()
        return !key.isNullOrBlank()
    }
}
