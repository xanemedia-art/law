package com.legaltalk.india

import android.app.Application
import android.util.Log
import com.google.firebase.FirebaseApp

class LegalTalkApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        try {
            FirebaseApp.initializeApp(this)
            Log.d("LegalTalkApp", "Firebase initialized successfully.")
        } catch (e: Exception) {
            Log.e("LegalTalkApp", "Firebase initialization failed: ${e.message}")
        }
    }
}
