package com.legaltalk.india.ui.screen

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.legaltalk.india.data.model.Consultation
import com.legaltalk.india.data.model.LawyerProfile
import com.legaltalk.india.data.model.User
import com.legaltalk.india.data.network.RetrofitClient
import com.legaltalk.india.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClientDashboardScreen(
    currentUser: User,
    onStartCall: (Consultation) -> Unit,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var userState by remember { mutableStateOf(currentUser) }
    var walletBalance by remember { mutableDoubleStateOf(0.0) }
    var lawyersList by remember { mutableStateOf<List<LawyerProfile>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }

    // Dialogs
    var selectedLawyer by remember { mutableStateOf<LawyerProfile?>(null) }
    var showPostCaseDialog by remember { mutableStateOf(false) }
    var showDepositDialog by remember { mutableStateOf(false) }

    // Post Case Form
    var caseTitle by remember { mutableStateOf("") }
    var caseDesc by remember { mutableStateOf("") }
    var caseCategory by remember { mutableStateOf("Criminal Defense") }

    // Deposit Amount Form
    var depositAmount by remember { mutableStateOf("") }

    // Fetch Initial Data
    val fetchData = {
        scope.launch {
            try {
                // Fetch Wallet
                val walletRes = RetrofitClient.apiService.getWallet(userState.id)
                if (walletRes.isSuccessful && walletRes.body() != null) {
                    walletBalance = walletRes.body()!!.balance
                }

                // Fetch User profile (free minutes/chats)
                val userRes = RetrofitClient.apiService.getUserProfile(userState.id)
                if (userRes.isSuccessful && userRes.body() != null) {
                    val updatedUser = userRes.body()!!["user"]
                    if (updatedUser != null) {
                        userState = updatedUser
                    }
                }

                // Fetch Lawyers
                val lawyersRes = RetrofitClient.apiService.getLawyers()
                if (lawyersRes.isSuccessful && lawyersRes.body() != null) {
                    lawyersList = lawyersRes.body()!!["lawyers"] ?: emptyList()
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Fetch error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    LaunchedEffect(Unit) {
        fetchData()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Client Command Center", color = TextLight) },
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            // Wallet Banner
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Durable Wallet Balance", fontSize = 12.sp, color = TextMuted)
                        Text("₹${String.format("%.2f", walletBalance)}", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextLight)
                    }
                    Row {
                        Button(
                            onClick = { showDepositDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Recharge")
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { showPostCaseDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = SecondaryDark),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("+ Post Case")
                        }
                    }
                }
            }

            if (userState.freeCallMinutesRemaining > 0 || userState.freeChatsRemaining > 0) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("🎁 Welcome Gift Benefits Active", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SecondaryDark)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            if (userState.freeCallMinutesRemaining > 0) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Free Call Minutes", fontSize = 11.sp, color = TextMuted)
                                    Text("${userState.freeCallMinutesRemaining} Mins", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = TextLight)
                                }
                            }
                            if (userState.freeChatsRemaining > 0) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Free Chat Bubbles", fontSize = 11.sp, color = TextMuted)
                                    Text("${userState.freeChatsRemaining} Chats", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = TextLight)
                                }
                            }
                        }
                    }
                }
            }

            Text(
                text = "BCI-Compliant Advocate Directory",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextLight,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            if (lawyersList.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No online advocates currently registered.", color = TextMuted)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(lawyersList) { profile ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { selectedLawyer = profile },
                            shape = RoundedCornerShape(8.dp),
                            colors = CardDefaults.cardColors(containerColor = CardBackground)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(profile.name ?: "Advocate", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextLight)
                                    Text(profile.stateBarCouncil, fontSize = 12.sp, color = TextMuted)
                                    Text("Exp: ${profile.experienceYears} Years | ${profile.practiceDistrict}, ${profile.practiceState}", fontSize = 12.sp, color = TextMuted)
                                }
                                Button(
                                    onClick = {
                                        scope.launch {
                                            try {
                                                isLoading = true
                                                val res = RetrofitClient.apiService.createConsultation(
                                                    mapOf(
                                                        "clientId" to userState.id,
                                                        "lawyerId" to profile.userId,
                                                        "type" to "video"
                                                    )
                                                )
                                                if (res.isSuccessful && res.body() != null) {
                                                    val consultation = res.body()!!["session"]
                                                    if (consultation != null) {
                                                        onStartCall(consultation)
                                                    }
                                                } else {
                                                    Toast.makeText(context, "Create session failed: ${res.message()}", Toast.LENGTH_LONG).show()
                                                }
                                            } catch (e: Exception) {
                                                Toast.makeText(context, "Consultation error: ${e.message}", Toast.LENGTH_LONG).show()
                                            } finally {
                                                isLoading = false
                                            }
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = SecondaryDark),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text("Video Call")
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Selected Lawyer Dossier Dialog
    if (selectedLawyer != null) {
        val lawyer = selectedLawyer!!
        AlertDialog(
            onDismissRequest = { selectedLawyer = null },
            title = { Text(lawyer.name ?: "Advocate Dossier", color = TextLight) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Bar ID: ${lawyer.barCouncilNumber}", color = TextLight)
                    Text("Council: ${lawyer.stateBarCouncil}", color = TextLight)
                    Text("Bio: ${lawyer.bio}", color = TextLight)
                    Text("Practice location: ${lawyer.placeOfPractice ?: "Not specified"}", color = TextLight)
                    Text("LLB University: ${lawyer.llbUniversity ?: "Pending"}", color = TextLight)
                    Text("Graduation Year: ${lawyer.llbGraduationYear ?: "Pending"}", color = TextLight)
                    Text("Consultation Rates:", fontWeight = FontWeight.Bold, color = TextLight)
                    Text("- Chat: ₹${lawyer.chatPricePerMinute}/min", color = TextLight)
                    Text("- Voice: ₹${lawyer.voicePricePerMinute}/min", color = TextLight)
                    Text("- Video: ₹${lawyer.videoPricePerMinute}/min", color = TextLight)
                }
            },
            confirmButton = {
                Button(onClick = { selectedLawyer = null }) {
                    Text("Close")
                }
            },
            containerColor = SurfaceDark
        )
    }

    // Post Case Board Dialog
    if (showPostCaseDialog) {
        AlertDialog(
            onDismissRequest = { showPostCaseDialog = false },
            title = { Text("Post Case Requirement", color = TextLight) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = caseTitle,
                        onValueChange = { caseTitle = it },
                        label = { Text("Case Title") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = caseDesc,
                        onValueChange = { caseDesc = it },
                        label = { Text("Brief Case Description") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = caseCategory,
                        onValueChange = { caseCategory = it },
                        label = { Text("Legal Category") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (caseTitle.isEmpty() || caseDesc.isEmpty()) {
                            Toast.makeText(context, "Please enter all fields", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        scope.launch {
                            try {
                                val res = RetrofitClient.apiService.createCase(
                                    mapOf(
                                        "clientId" to userState.id,
                                        "clientName" to userState.name,
                                        "title" to caseTitle,
                                        "description" to caseDesc,
                                        "category" to caseCategory
                                    )
                                )
                                if (res.isSuccessful) {
                                    Toast.makeText(context, "Case posted to shared board!", Toast.LENGTH_SHORT).show()
                                    showPostCaseDialog = false
                                }
                            } catch (e: Exception) {
                                Toast.makeText(context, "Case post error: ${e.message}", Toast.LENGTH_LONG).show()
                            }
                        }
                    }
                ) {
                    Text("Post Case")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPostCaseDialog = false }) {
                    Text("Cancel")
                }
            },
            containerColor = SurfaceDark
        )
    }

    // Deposit Recharge Dialog
    if (showDepositDialog) {
        AlertDialog(
            onDismissRequest = { showDepositDialog = false },
            title = { Text("Wallet Deposit Simulation", color = TextLight) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Recharge wallet instantly. Supports UPI, Net banking, and Cards.", color = TextMuted)
                    OutlinedTextField(
                        value = depositAmount,
                        onValueChange = { depositAmount = it },
                        label = { Text("Deposit Amount (INR)") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val amt = depositAmount.toDoubleOrNull()
                        if (amt == null || amt <= 0) {
                            Toast.makeText(context, "Please enter a valid amount", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        scope.launch {
                            try {
                                val res = RetrofitClient.apiService.depositWallet(
                                    mapOf(
                                        "userId" to userState.id,
                                        "amount" to amt,
                                        "rzpOrderId" to "rzp_playstore_${System.currentTimeMillis()}"
                                    )
                                )
                                if (res.isSuccessful) {
                                    Toast.makeText(context, "Recharged ₹$amt successfully!", Toast.LENGTH_SHORT).show()
                                    showDepositDialog = false
                                    fetchData() // Refresh balance
                                }
                            } catch (e: Exception) {
                                Toast.makeText(context, "Deposit error: ${e.message}", Toast.LENGTH_LONG).show()
                            }
                        }
                    }
                ) {
                    Text("Pay Natively")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDepositDialog = false }) {
                    Text("Cancel")
                }
            },
            containerColor = SurfaceDark
        )
    }
}
