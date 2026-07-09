package com.legaltalk.india.ui.screen

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.legaltalk.india.data.model.AdminMetrics
import com.legaltalk.india.data.model.LawyerProfile
import com.legaltalk.india.data.model.User
import com.legaltalk.india.data.network.RetrofitClient
import com.legaltalk.india.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(
    currentUser: User,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var loading by remember { mutableStateOf(false) }
    var metrics by remember { mutableStateOf<AdminMetrics?>(null) }
    var lawyersList by remember { mutableStateOf<List<LawyerProfile>>(emptyList()) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedLawyer by remember { mutableStateOf<LawyerProfile?>(null) }
    var actioning by remember { mutableStateOf(false) }

    fun fetchMetrics() {
        loading = true
        scope.launch {
            try {
                val response = RetrofitClient.apiService.getAdminMetrics()
                if (response.isSuccessful && response.body() != null) {
                    metrics = response.body()!!.metrics
                    lawyersList = response.body()!!.lawyerProfiles
                } else {
                    Toast.makeText(context, "Error fetching metrics: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Network exception: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                loading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        fetchMetrics()
    }

    fun handleVerify(lawyerId: String, action: String) {
        actioning = true
        scope.launch {
            try {
                val response = RetrofitClient.apiService.verifyLawyer(
                    mapOf("id" to lawyerId, "action" to action)
                )
                if (response.isSuccessful && response.body() != null && response.body()!!["success"] == true) {
                    Toast.makeText(context, "Action '$action' processed successfully", Toast.LENGTH_SHORT).show()
                    // Update lists
                    lawyersList = lawyersList.map {
                        if (it.userId == lawyerId) it.copy(verificationStatus = action) else it
                    }
                    if (selectedLawyer?.userId == lawyerId) {
                        selectedLawyer = selectedLawyer?.copy(verificationStatus = action)
                    }
                    fetchMetrics()
                } else {
                    val err = response.errorBody()?.string() ?: response.message()
                    Toast.makeText(context, "Failed to verify: $err", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Network exception: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                actioning = false
            }
        }
    }

    val filteredLawyers = lawyersList.filter { lawyer ->
        lawyer.name?.contains(searchQuery, ignoreCase = true) == true ||
        lawyer.barCouncilNumber.contains(searchQuery, ignoreCase = true) ||
        lawyer.email?.contains(searchQuery, ignoreCase = true) == true
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Chambers Command Center", fontWeight = FontWeight.Bold, color = TextLight, fontSize = 18.sp)
                        Text("Verification Dossier & Audits", color = TextMuted, fontSize = 11.sp)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Log Out", tint = TextLight)
                    }
                },
                actions = {
                    IconButton(onClick = { fetchMetrics() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = TextLight)
                    }
                    TextButton(onClick = onLogout) {
                        Text("Logout", color = ErrorRed, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceDark)
            )
        },
        containerColor = BackgroundDark
    ) { paddingValues ->
        if (loading && lawyersList.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize().padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = SecondaryDark)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp)
            ) {
                // Metrics Cards block
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("ENROLLED ADVOCATES", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            Text(
                                text = "${metrics?.totalLawyers ?: 0}",
                                color = TextLight,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }

                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("REGISTRY SAAS REVENUE", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            Text(
                                text = "₹${metrics?.commissionRevenue?.toInt() ?: 0}",
                                color = SuccessGreen,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Search Bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search by name, ID or email...", color = TextMuted, fontSize = 12.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = TextLight,
                        unfocusedTextColor = TextLight,
                        focusedContainerColor = SurfaceDark,
                        unfocusedContainerColor = SurfaceDark,
                        focusedBorderColor = SecondaryDark,
                        unfocusedBorderColor = Color.Transparent
                    ),
                    shape = RoundedCornerShape(8.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                // lazy listing
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    if (filteredLawyers.isEmpty()) {
                        item {
                            Box(
                                modifier = Modifier.fillMaxWidth().padding(32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("No registered advocates found.", color = TextMuted, fontSize = 13.sp)
                            }
                        }
                    } else {
                        items(filteredLawyers) { lawyer ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { selectedLawyer = lawyer },
                                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = lawyer.name ?: "Unknown Advocate",
                                            color = TextLight,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 15.sp,
                                            modifier = Modifier.weight(1f),
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        StatusChip(lawyer.verificationStatus)
                                    }

                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = lawyer.barCouncilNumber,
                                        color = SecondaryDark,
                                        fontWeight = FontWeight.SemiBold,
                                        fontSize = 12.sp
                                    )
                                    Text(
                                        text = lawyer.stateBarCouncil,
                                        color = TextMuted,
                                        fontSize = 11.sp
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Divider(color = Color(0xFF334155))
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("Exp: ${lawyer.experienceYears} Years", color = TextMuted, fontSize = 10.sp)
                                        Text("Mobile: ${lawyer.mobile ?: "N/A"}", color = TextMuted, fontSize = 10.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Modal Dossier Dialog
    selectedLawyer?.let { lawyer ->
        Dialog(onDismissRequest = { selectedLawyer = null }) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .wrapContentHeight(),
                shape = RoundedCornerShape(24.dp),
                color = SurfaceDark
            ) {
                val dialogScrollState = rememberScrollState()
                Column(
                    modifier = Modifier
                        .padding(24.dp)
                        .verticalScroll(dialogScrollState)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = lawyer.name ?: "Unknown Advocate",
                                color = TextLight,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )
                            Text("Advocate Auditing Dossier", color = TextMuted, fontSize = 11.sp)
                        }
                        StatusChip(lawyer.verificationStatus)
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Divider(color = Color(0xFF334155))
                    Spacer(modifier = Modifier.height(16.dp))

                    // Contact Section
                    Text("CONTACT CHANNELS", color = SecondaryDark, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Email: ${lawyer.email ?: "N/A"}", color = TextLight, fontSize = 12.sp)
                    Text("Mobile: ${lawyer.mobile ?: "N/A"}", color = TextLight, fontSize = 12.sp)

                    Spacer(modifier = Modifier.height(16.dp))

                    // Bar Details
                    Text("BAR ENROLMENT DETAILS", color = SecondaryDark, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Enrolment ID: ${lawyer.barCouncilNumber}", color = TextLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("Bar Council: ${lawyer.stateBarCouncil}", color = TextLight, fontSize = 12.sp)

                    Spacer(modifier = Modifier.height(16.dp))

                    // Practice Details
                    Text("PRACTICE LOCATION & KYC", color = SecondaryDark, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Location: ${lawyer.practiceState ?: "Pending"}, ${lawyer.practiceDistrict ?: "Pending"}", color = TextLight, fontSize = 12.sp)
                    Text("Aadhaar ID: ${lawyer.aadhaar}", color = TextLight, fontSize = 12.sp)
                    Text("PAN Card: ${lawyer.pan}", color = TextLight, fontSize = 12.sp)

                    Spacer(modifier = Modifier.height(16.dp))

                    // Academic Details
                    Text("ACADEMIC CREDENTIALS", color = SecondaryDark, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("University: ${lawyer.llbUniversity ?: "Pending"}", color = TextLight, fontSize = 12.sp)
                    Text("LLB Graduation: ${lawyer.llbGraduationYear ?: "Pending"}", color = TextLight, fontSize = 12.sp)
                    Text("Bar Association: ${lawyer.barAssociationName ?: "Pending"}", color = TextLight, fontSize = 12.sp)
                    Text("Place of Practice: ${lawyer.placeOfPractice ?: "Pending"}", color = TextLight, fontSize = 12.sp)

                    Spacer(modifier = Modifier.height(16.dp))

                    // Bio
                    Text("SPECIALIST BIO STATEMENT", color = SecondaryDark, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = lawyer.bio,
                        color = TextMuted,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))
                    Divider(color = Color(0xFF334155))
                    Spacer(modifier = Modifier.height(16.dp))

                    // simulated Cert Files Links
                    Text("VERIFICATION CERTIFICATES", color = SecondaryDark, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        DocLinkButton("Bar Cert", modifier = Modifier.weight(1f))
                        DocLinkButton("COP Cert", modifier = Modifier.weight(1f))
                        DocLinkButton("LLB Degree", modifier = Modifier.weight(1f))
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Action verification buttons
                    if (actioning) {
                        Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = SecondaryDark)
                        }
                    } else {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)
                        ) {
                            if (lawyer.verificationStatus != "approved") {
                                Button(
                                    onClick = { handleVerify(lawyer.userId, "approved") },
                                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Approve", color = TextLight, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                }
                            }

                            if (lawyer.verificationStatus != "suspended") {
                                Button(
                                    onClick = { handleVerify(lawyer.userId, "suspended") },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF64748B)),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Suspend", color = TextLight, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                }
                            }

                            if (lawyer.verificationStatus != "rejected" && lawyer.verificationStatus != "approved") {
                                Button(
                                    onClick = { handleVerify(lawyer.userId, "rejected") },
                                    colors = ButtonDefaults.buttonColors(containerColor = ErrorRed),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Reject", color = TextLight, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    OutlinedButton(
                        onClick = { selectedLawyer = null },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextLight),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Close Dossier", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun StatusChip(status: String) {
    val (bgColor, textColor, label) = when (status) {
        "approved" -> Triple(SuccessGreen.copy(alpha = 0.15f), SuccessGreen, "Approved")
        "suspended" -> Triple(AccentDark.copy(alpha = 0.15f), AccentDark, "Suspended")
        "rejected" -> Triple(ErrorRed.copy(alpha = 0.15f), ErrorRed, "Rejected")
        else -> Triple(SecondaryDark.copy(alpha = 0.15f), SecondaryDark, "Pending Audit")
    }

    Box(
        modifier = Modifier
            .background(bgColor, RoundedCornerShape(20.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun DocLinkButton(label: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    Box(
        modifier = modifier
            .background(Color(0xFF334155).copy(alpha = 0.5f), RoundedCornerShape(8.dp))
            .clickable {
                Toast.makeText(context, "Simulated: Opening $label PDF dossier", Toast.LENGTH_SHORT).show()
            }
            .padding(vertical = 10.dp, horizontal = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = TextLight,
            fontSize = 9.sp,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}
