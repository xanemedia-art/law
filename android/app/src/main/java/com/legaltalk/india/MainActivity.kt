package com.legaltalk.india

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.google.firebase.messaging.FirebaseMessaging
import com.legaltalk.india.data.model.Consultation
import com.legaltalk.india.data.model.User
import com.legaltalk.india.data.network.RetrofitClient
import com.legaltalk.india.ui.screen.AdminDashboardScreen
import com.legaltalk.india.ui.screen.CallingWorkspace
import com.legaltalk.india.ui.screen.ClientDashboardScreen
import com.legaltalk.india.ui.screen.LawyerDashboardScreen
import com.legaltalk.india.ui.screen.LoginScreen
import com.legaltalk.india.ui.theme.LegalTalkTheme
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private var currentUser by mutableStateOf<User?>(null)
    private var activeCall by mutableStateOf<Consultation?>(null)

    // Request permissions launcher for Android 13+ POST_NOTIFICATIONS
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            fetchAndRegisterFcmToken()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        checkNotificationPermission()
        checkAutoLogin()

        setContent {
            LegalTalkTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val user = currentUser
                    val call = activeCall

                    if (call != null) {
                        CallingWorkspace(
                            consultation = call,
                            isClient = user?.role == "client",
                            onCallEnded = { activeCall = null }
                        )
                    } else if (user != null) {
                        when (user.role) {
                            "lawyer" -> {
                                LawyerDashboardScreen(
                                    currentUser = user,
                                    onLogout = { logout() }
                                )
                            }
                            "admin" -> {
                                AdminDashboardScreen(
                                    currentUser = user,
                                    onLogout = { logout() }
                                )
                            }
                            else -> {
                                ClientDashboardScreen(
                                    currentUser = user,
                                    onStartCall = { activeCall = it },
                                    onLogout = { logout() }
                                )
                            }
                        }
                    } else {
                        LoginScreen(
                            onAuthSuccess = { loggedUser ->
                                currentUser = loggedUser
                                fetchAndRegisterFcmToken()
                            }
                        )
                    }
                }
            }
        }
    }

    private fun checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
            ) {
                fetchAndRegisterFcmToken()
            } else {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        } else {
            fetchAndRegisterFcmToken()
        }
    }

    private fun fetchAndRegisterFcmToken() {
        try {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    return@addOnCompleteListener
                }
                val token = task.result
                val prefs = getSharedPreferences("legaltalk_prefs", Context.MODE_PRIVATE)
                prefs.edit().putString("fcm_token", token).apply()

                val user = currentUser
                if (user != null && token != null) {
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            RetrofitClient.apiService.registerFcmToken(
                                mapOf("userId" to user.id, "token" to token)
                            )
                        } catch (e: Exception) {
                            // fail silent
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // FirebaseApp may not be initialized if google-services.json is missing in build sandbox
        }
    }

    private fun checkAutoLogin() {
        val prefs = getSharedPreferences("legaltalk_prefs", Context.MODE_PRIVATE)
        val userId = prefs.getString("user_id", null)
        val role = prefs.getString("user_role", null)
        val name = prefs.getString("user_name", null)
        val email = prefs.getString("user_email", null)

        if (userId != null && role != null && name != null && email != null) {
            currentUser = User(
                id = userId,
                role = role,
                name = name,
                email = email,
                mobile = ""
            )
            fetchAndRegisterFcmToken()
        }
    }

    private fun logout() {
        val prefs = getSharedPreferences("legaltalk_prefs", Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
        currentUser = null
        activeCall = null
    }
}
