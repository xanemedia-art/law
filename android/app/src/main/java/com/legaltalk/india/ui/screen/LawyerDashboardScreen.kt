package com.legaltalk.india.ui.screen

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.legaltalk.india.data.model.Case
import com.legaltalk.india.data.model.LawyerProfile
import com.legaltalk.india.data.model.User
import com.legaltalk.india.data.network.RetrofitClient
import com.legaltalk.india.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LawyerDashboardScreen(
    currentUser: User,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var isOnline by remember { mutableStateOf(false) }
    var walletBalance by remember { mutableDoubleStateOf(0.0) }
    var activeCases by remember { mutableStateOf<List<Case>>(emptyList()) }
    var lawyerProfile by remember { mutableStateOf<LawyerProfile?>(null) }

    // Settings
    var chatPrice by remember { mutableStateOf("20") }
    var voicePrice by remember { mutableStateOf("30") }
    var videoPrice by remember { mutableStateOf("40") }
    var bioText by remember { mutableStateOf("") }

    val fetchData = {
        scope.launch {
            try {
                // Fetch Profile
                val profileRes = RetrofitClient.apiService.getLawyerProfile(currentUser.id)
                if (profileRes.isSuccessful && profileRes.body() != null) {
                    val profile = profileRes.body()!!["profile"]
                    lawyerProfile = profile
                    if (profile != null) {
                        isOnline = profile.isOnline
                        chatPrice = profile.chatPricePerMinute.toInt().toString()
                        voicePrice = profile.voicePricePerMinute.toInt().toString()
                        videoPrice = profile.videoPricePerMinute.toInt().toString()
                        bioText = profile.bio
                    }
                }

                // Fetch Wallet balance
                val walletRes = RetrofitClient.apiService.getWallet(currentUser.id)
                if (walletRes.isSuccessful && walletRes.body() != null) {
                    walletBalance = walletRes.body()!!.balance
                }

                // Fetch Open Cases
                val casesRes = RetrofitClient.apiService.getCases(status = "searching")
                if (casesRes.isSuccessful && casesRes.body() != null) {
                    activeCases = casesRes.body()!!["cases"] ?: emptyList()
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    LaunchedEffect(Unit) {
        fetchData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Chambers Command Center", color = TextLight) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceDark),
                actions = {
                    TextButton(onClick = onLogout) {
                        Text("Logout", color = ErrorRed)
                    }
                }
            )
        },
        containerColor = BackgroundDark
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Chamber Header Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Payout Ledger Earnings", fontSize = 12.sp, color = TextMuted)
                                Text("₹${String.format("%.2f", walletBalance)}", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextLight)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(if (isOnline) "ONLINE" else "OFFLINE", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (isOnline) SuccessGreen else TextMuted)
                                Spacer(modifier = Modifier.width(8.dp))
                                Switch(
                                    checked = isOnline,
                                    onCheckedChange = { checked ->
                                        isOnline = checked
                                        scope.launch {
                                            try {
                                                RetrofitClient.apiService.updateLawyerProfile(
                                                    mapOf(
                                                        "userId" to currentUser.id,
                                                        "isOnline" to checked
                                                    )
                                                )
                                                Toast.makeText(context, "Visibility status updated", Toast.LENGTH_SHORT).show()
                                            } catch (e: Exception) {
                                                Toast.makeText(context, "Update error: ${e.message}", Toast.LENGTH_LONG).show()
                                            }
                                        }
                                    },
                                    colors = SwitchDefaults.colors(
                                        checkedThumbColor = SuccessGreen,
                                        checkedTrackColor = SuccessGreen.copy(alpha = 0.5f)
                                    )
                                )
                            }
                        }
                    }
                }
            }

            // Pricing & Bio Settings
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Rate Settings (₹/min)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextLight)

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = chatPrice,
                                onValueChange = { chatPrice = it },
                                label = { Text("Chat Rate") },
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = voicePrice,
                                onValueChange = { voicePrice = it },
                                label = { Text("Voice Rate") },
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = videoPrice,
                                onValueChange = { videoPrice = it },
                                label = { Text("Video Rate") },
                                modifier = Modifier.weight(1f)
                            )
                        }

                        OutlinedTextField(
                            value = bioText,
                            onValueChange = { bioText = it },
                            label = { Text("Chambers Bio / Specializations") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2
                        )

                        Button(
                            onClick = {
                                scope.launch {
                                    try {
                                        RetrofitClient.apiService.updateLawyerProfile(
                                            mapOf(
                                                "userId" to currentUser.id,
                                                "chatPrice" to (chatPrice.toDoubleOrNull() ?: 20.0),
                                                "voicePrice" to (voicePrice.toDoubleOrNull() ?: 30.0),
                                                "videoPrice" to (videoPrice.toDoubleOrNull() ?: 40.0),
                                                "bio" to bioText
                                            )
                                        )
                                        Toast.makeText(context, "Chambers configuration saved!", Toast.LENGTH_SHORT).show()
                                        fetchData()
                                    } catch (e: Exception) {
                                        Toast.makeText(context, "Save error: ${e.message}", Toast.LENGTH_LONG).show()
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = SecondaryDark),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Update Chambers Ledger Settings")
                        }
                    }
                }
            }

            // Subscription Section
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Advocate Registry Subscription", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextLight)
                        Text(
                            text = "Expires at: ${lawyerProfile?.subscriptionExpiresAt?.substring(0, 10) ?: "No active license"}",
                            fontSize = 12.sp,
                            color = TextMuted,
                            modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                        )
                        Button(
                            onClick = {
                                scope.launch {
                                    try {
                                        val res = RetrofitClient.apiService.paySubscription(mapOf("userId" to currentUser.id))
                                        if (res.isSuccessful) {
                                            Toast.makeText(context, "Subscription renewed for 1 Year!", Toast.LENGTH_LONG).show()
                                            fetchData()
                                        } else {
                                            Toast.makeText(context, "Failed: Wallet needs at least ₹1200", Toast.LENGTH_LONG).show()
                                        }
                                    } catch (e: Exception) {
                                        Toast.makeText(context, "Sub pay error: ${e.message}", Toast.LENGTH_LONG).show()
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = AccentDark),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Pay Annual Fee (₹1200)")
                        }
                    }
                }
            }

            // Collaborative Open Case Boards
            item {
                Text(
                    text = "Shared Case Board (Client Requests)",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextLight,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            if (activeCases.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No open client cases listed.", color = TextMuted)
                    }
                }
            } else {
                items(activeCases) { kase ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = CardBackground)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(kase.title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextLight)
                                Text(kase.category, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = AccentDark)
                            }
                            Text(kase.description, fontSize = 12.sp, color = TextMuted, modifier = Modifier.padding(vertical = 8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Client: ${kase.clientName}", fontSize = 12.sp, color = TextMuted)
                                Button(
                                    onClick = {
                                        scope.launch {
                                            try {
                                                val res = RetrofitClient.apiService.acceptCase(
                                                    mapOf(
                                                        "caseId" to kase.id,
                                                        "lawyerId" to currentUser.id,
                                                        "lawyerName" to currentUser.name
                                                    )
                                                )
                                                if (res.isSuccessful) {
                                                    Toast.makeText(context, "Case accepted! Check Ongoing cases tab.", Toast.LENGTH_LONG).show()
                                                    fetchData()
                                                }
                                            } catch (e: Exception) {
                                                Toast.makeText(context, "Accept error: ${e.message}", Toast.LENGTH_LONG).show()
                                            }
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text("Accept Case")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
