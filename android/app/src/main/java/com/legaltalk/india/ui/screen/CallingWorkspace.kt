package com.legaltalk.india.ui.screen

import android.util.Log
import android.view.SurfaceView
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.legaltalk.india.data.model.Consultation
import com.legaltalk.india.data.network.RetrofitClient
import com.legaltalk.india.ui.theme.*
import io.agora.rtc2.IRtcEngineEventHandler
import io.agora.rtc2.RtcEngine
import io.agora.rtc2.video.VideoCanvas
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun CallingWorkspace(
    consultation: Consultation,
    isClient: Boolean,
    onCallEnded: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var secondsElapsed by remember { mutableIntStateOf(0) }
    var rtcEngine by remember { mutableStateOf<RtcEngine?>(null) }
    var isMuted by remember { mutableStateOf(false) }
    var remoteUid by remember { mutableStateOf<Int?>(null) }

    // Billing Loop for Client
    if (isClient) {
        LaunchedEffect(Unit) {
            while (true) {
                delay(60000) // 1 minute
                try {
                    val res = RetrofitClient.apiService.billMinute(mapOf("consultationId" to consultation.id))
                    if (res.isSuccessful && res.body() != null) {
                        val body = res.body()!!
                        val exhausted = body["exhausted"] as? Boolean ?: false
                        if (exhausted) {
                            Toast.makeText(context, "Wallet exhausted! Ending consultation.", Toast.LENGTH_LONG).show()
                            RetrofitClient.apiService.endConsultation(mapOf("consultationId" to consultation.id))
                            onCallEnded()
                            break
                        }
                    }
                } catch (e: Exception) {
                    Log.e("CallingWorkspace", "Billing tick error: ${e.message}")
                }
            }
        }
    }

    // Timer display
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            secondsElapsed++
        }
    }

    // Agora Native SDK Setup
    LaunchedEffect(Unit) {
        try {
            val rtcEventHandler = object : IRtcEngineEventHandler() {
                override fun onUserJoined(uid: Int, elapsed: Int) {
                    scope.launch {
                        remoteUid = uid
                        Toast.makeText(context, "Peer joined call.", Toast.LENGTH_SHORT).show()
                    }
                }
                override fun onUserOffline(uid: Int, reason: Int) {
                    scope.launch {
                        if (remoteUid == uid) {
                            remoteUid = null
                        }
                        Toast.makeText(context, "Peer disconnected.", Toast.LENGTH_SHORT).show()
                        onCallEnded()
                    }
                }
            }
            // Use Agora test AppID
            rtcEngine = RtcEngine.create(context, "1234567890abcdef1234567890abcdef", rtcEventHandler).apply {
                enableVideo()
                joinChannel(null, consultation.agoraChannelName ?: "default_channel", "", 0)
            }
        } catch (e: Exception) {
            Log.e("CallingWorkspace", "Agora RtcEngine error: ${e.message}")
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            rtcEngine?.leaveChannel()
            RtcEngine.destroy()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
    ) {
        // Video Viewports
        Column(
            modifier = Modifier.fillMaxSize().padding(bottom = 140.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Local View (My camera)
            Card(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(16.dp)
            ) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    if (rtcEngine != null) {
                        AndroidView(
                            factory = { ctx ->
                                val view = SurfaceView(ctx)
                                view.setZOrderMediaOverlay(true)
                                rtcEngine?.setupLocalVideo(
                                    VideoCanvas(view, VideoCanvas.RENDER_MODE_HIDDEN, 0)
                                )
                                view
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                        Text(
                            "My Camera",
                            color = Color.White.copy(alpha = 0.6f),
                            fontSize = 11.sp,
                            modifier = Modifier.align(Alignment.BottomStart).padding(8.dp)
                        )
                    } else {
                        Text("LOCAL CAMERA PREVIEW\n(Initializing video...)", color = TextMuted, fontSize = 14.sp, textAlign = TextAlign.Center)
                    }
                }
            }

            // Remote View (Opposite peer)
            Card(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(16.dp)
            ) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    if (rtcEngine != null && remoteUid != null) {
                        AndroidView(
                            factory = { ctx ->
                                val view = SurfaceView(ctx)
                                rtcEngine?.setupRemoteVideo(
                                    VideoCanvas(view, VideoCanvas.RENDER_MODE_HIDDEN, remoteUid!!)
                                )
                                view
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                        Text(
                            "Consultant Camera",
                            color = Color.White.copy(alpha = 0.6f),
                            fontSize = 11.sp,
                            modifier = Modifier.align(Alignment.BottomStart).padding(8.dp)
                        )
                    } else {
                        Text("REMOTE VIDEO STREAM\n(Waiting for peer to join...)", color = TextMuted, fontSize = 14.sp, textAlign = TextAlign.Center)
                    }
                }
            }
        }

        // Overlay Call Details
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = if (isClient) "Consulting: ${consultation.lawyerName}" else "Client: ${consultation.clientName}",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextLight
            )
            val minutes = secondsElapsed / 60
            val seconds = secondsElapsed % 60
            Text(
                text = String.format("%02d:%02d", minutes, seconds),
                fontSize = 16.sp,
                color = SuccessGreen,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        // Controls bar
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(bottom = 32.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Mute Button
            Button(
                onClick = {
                    isMuted = !isMuted
                    rtcEngine?.muteLocalAudioStream(isMuted)
                },
                colors = ButtonDefaults.buttonColors(containerColor = if (isMuted) ErrorRed else SurfaceDark),
                shape = CircleShape,
                modifier = Modifier.size(64.dp)
            ) {
                Text(if (isMuted) "🔇" else "🎙", fontSize = 24.sp)
            }

            // End Call Button
            Button(
                onClick = {
                    scope.launch {
                        try {
                            RetrofitClient.apiService.endConsultation(mapOf("consultationId" to consultation.id))
                        } catch (e: Exception) {
                            // background fail silent
                        }
                        onCallEnded()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = ErrorRed),
                shape = CircleShape,
                modifier = Modifier.size(72.dp)
            ) {
                Text("📞", fontSize = 28.sp)
            }
        }
    }
}
