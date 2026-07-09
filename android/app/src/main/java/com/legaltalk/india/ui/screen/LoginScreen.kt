package com.legaltalk.india.ui.screen

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.legaltalk.india.data.model.User
import com.legaltalk.india.data.network.RetrofitClient
import com.legaltalk.india.ui.theme.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onAuthSuccess: (User) -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    var email by remember { mutableStateOf("") }
    
    var isRegisterMode by remember { mutableStateOf(false) }
    var selectedRole by remember { mutableStateOf("client") } // "client", "lawyer", "admin"
    
    // Register fields
    var name by remember { mutableStateOf("") }
    var mobile by remember { mutableStateOf("") }
    var invitationCode by remember { mutableStateOf("") }
    
    // Client Simulated OTP fields
    var showOtpField by remember { mutableStateOf(false) }
    var mockOtpCode by remember { mutableStateOf("") }
    var enteredOtp by remember { mutableStateOf("") }
    
    // Lawyer fields
    var barCouncilNumber by remember { mutableStateOf("") }
    var stateBarCouncil by remember { mutableStateOf("") }
    var practiceState by remember { mutableStateOf("") }
    var practiceDistrict by remember { mutableStateOf("") }
    
    var isLoading by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(BackgroundDark, Color(0xFF020617))
                )
            )
            .padding(24.dp)
            .verticalScroll(scrollState),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // App Logo Icon
        Box(
            modifier = Modifier
                .size(72.dp)
                .background(SecondaryDark, shape = RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "⚖",
                fontSize = 40.sp,
                color = TextLight
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "LegalTalk India",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = TextLight,
            letterSpacing = 1.sp
        )

        Text(
            text = "Instant 24/7 Professional Legal Counsel",
            fontSize = 14.sp,
            color = TextMuted,
            modifier = Modifier.padding(top = 4.dp),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Role Tabs in Register Mode
        if (isRegisterMode) {
            TabRow(
                selectedTabIndex = if (selectedRole == "client") 0 else if (selectedRole == "lawyer") 1 else 2,
                containerColor = SurfaceDark,
                contentColor = SecondaryDark,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
                    .background(SurfaceDark, RoundedCornerShape(8.dp))
            ) {
                Tab(
                    selected = selectedRole == "client",
                    onClick = { 
                        selectedRole = "client"
                        showOtpField = false
                    },
                    text = { Text("Client", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedRole == "lawyer",
                    onClick = { 
                        selectedRole = "lawyer"
                        showOtpField = false
                    },
                    text = { Text("Advocate", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedRole == "admin",
                    onClick = { 
                        selectedRole = "admin"
                        showOtpField = false
                    },
                    text = { Text("Admin", fontWeight = FontWeight.Bold) }
                )
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = if (isRegisterMode) "Create Account" else "Welcome Back",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextLight,
                    modifier = Modifier.align(Alignment.Start)
                )

                Spacer(modifier = Modifier.height(16.dp))

                if (isRegisterMode && selectedRole == "client" && showOtpField) {
                    // Simulated OTP input block
                    Text(
                        text = "Simulated SMS Verification",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = SecondaryDark,
                        modifier = Modifier.align(Alignment.Start)
                    )
                    Text(
                        text = "For testing simulation, use code: $mockOtpCode",
                        fontSize = 12.sp,
                        color = TextMuted,
                        modifier = Modifier.padding(top = 4.dp, bottom = 16.dp).align(Alignment.Start)
                    )
                    
                    OutlinedTextField(
                        value = enteredOtp,
                        onValueChange = { enteredOtp = it },
                        label = { Text("6-Digit OTP Code", color = TextMuted) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = SecondaryDark,
                            unfocusedBorderColor = TextMuted,
                            focusedLabelColor = SecondaryDark,
                            unfocusedLabelColor = TextMuted
                        )
                    )
                } else {
                    // Standard sign-up/login fields
                    if (isRegisterMode) {
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Full Legal Name", color = TextMuted) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextLight,
                                unfocusedTextColor = TextLight,
                                focusedBorderColor = SecondaryDark,
                                unfocusedBorderColor = TextMuted,
                                focusedLabelColor = SecondaryDark,
                                unfocusedLabelColor = TextMuted
                            )
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = mobile,
                            onValueChange = { mobile = it },
                            label = { Text("Mobile Number", color = TextMuted) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextLight,
                                unfocusedTextColor = TextLight,
                                focusedBorderColor = SecondaryDark,
                                unfocusedBorderColor = TextMuted,
                                focusedLabelColor = SecondaryDark,
                                unfocusedLabelColor = TextMuted
                            )
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email Address", color = TextMuted) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight,
                            focusedBorderColor = SecondaryDark,
                            unfocusedBorderColor = TextMuted,
                            focusedLabelColor = SecondaryDark,
                            unfocusedLabelColor = TextMuted
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    if (isRegisterMode && selectedRole == "admin") {
                        OutlinedTextField(
                            value = invitationCode,
                            onValueChange = { invitationCode = it },
                            label = { Text("Admin Invitation Code (e.g. ADM-INV-123456)", color = TextMuted) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextLight,
                                unfocusedTextColor = TextLight,
                                focusedBorderColor = SecondaryDark,
                                unfocusedBorderColor = TextMuted,
                                focusedLabelColor = SecondaryDark,
                                unfocusedLabelColor = TextMuted
                            )
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    // Advocate Onboarding Fields
                    if (isRegisterMode && selectedRole == "lawyer") {
                        OutlinedTextField(
                            value = barCouncilNumber,
                            onValueChange = { barCouncilNumber = it },
                            label = { Text("Bar Council Enrolment ID (e.g. D/1042/2012)", color = TextMuted) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextLight,
                                unfocusedTextColor = TextLight,
                                focusedBorderColor = SecondaryDark,
                                unfocusedBorderColor = TextMuted,
                                focusedLabelColor = SecondaryDark,
                                unfocusedLabelColor = TextMuted
                            )
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = stateBarCouncil,
                            onValueChange = { stateBarCouncil = it },
                            label = { Text("State Bar Council", color = TextMuted) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextLight,
                                unfocusedTextColor = TextLight,
                                focusedBorderColor = SecondaryDark,
                                unfocusedBorderColor = TextMuted,
                                focusedLabelColor = SecondaryDark,
                                unfocusedLabelColor = TextMuted
                            )
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = practiceState,
                            onValueChange = { practiceState = it },
                            label = { Text("Practice State Location", color = TextMuted) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextLight,
                                unfocusedTextColor = TextLight,
                                focusedBorderColor = SecondaryDark,
                                unfocusedBorderColor = TextMuted,
                                focusedLabelColor = SecondaryDark,
                                unfocusedLabelColor = TextMuted
                            )
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = practiceDistrict,
                            onValueChange = { practiceDistrict = it },
                            label = { Text("Practice District Location", color = TextMuted) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = TextLight,
                                unfocusedTextColor = TextLight,
                                focusedBorderColor = SecondaryDark,
                                unfocusedBorderColor = TextMuted,
                                focusedLabelColor = SecondaryDark,
                                unfocusedLabelColor = TextMuted
                            )
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }

                if (isLoading) {
                    CircularProgressIndicator(color = SecondaryDark)
                } else {
                    Button(
                        onClick = {
                            if (email.isEmpty()) {
                                Toast.makeText(context, "Please input email", Toast.LENGTH_SHORT).show()
                                return@Button
                            }
                            
                            if (isRegisterMode && selectedRole == "client" && !showOtpField) {
                                if (name.isEmpty() || mobile.isEmpty()) {
                                    Toast.makeText(context, "Please input name and mobile number", Toast.LENGTH_SHORT).show()
                                    return@Button
                                }
                                mockOtpCode = (100000..999999).random().toString()
                                showOtpField = true
                                Toast.makeText(context, "Simulated OTP: $mockOtpCode", Toast.LENGTH_LONG).show()
                                return@Button
                            }
                            
                            isLoading = true
                            scope.launch {
                                try {
                                    if (isRegisterMode) {
                                        if (selectedRole == "lawyer") {
                                            if (name.isEmpty() || mobile.isEmpty() || barCouncilNumber.isEmpty() || stateBarCouncil.isEmpty()) {
                                                Toast.makeText(context, "Please fill required advocate fields", Toast.LENGTH_SHORT).show()
                                                isLoading = false
                                                return@launch
                                            }
                                            
                                            val response = RetrofitClient.apiService.registerLawyer(
                                                mapOf(
                                                    "fullName" to name,
                                                    "email" to email,
                                                    "mobile" to mobile,
                                                    "barCouncilNumber" to barCouncilNumber,
                                                    "stateBarCouncil" to stateBarCouncil,
                                                    "practiceState" to practiceState,
                                                    "practiceDistrict" to practiceDistrict
                                                )
                                            )
                                            if (response.isSuccessful && response.body() != null) {
                                                val user = response.body()!!.user
                                                saveSession(context, user)
                                                onAuthSuccess(user)
                                            } else {
                                                val err = response.errorBody()?.string() ?: response.message()
                                                Toast.makeText(context, "Error: $err", Toast.LENGTH_LONG).show()
                                            }
                                        } else if (selectedRole == "admin") {
                                            if (name.isEmpty() || mobile.isEmpty() || invitationCode.isEmpty()) {
                                                Toast.makeText(context, "Please fill required admin fields", Toast.LENGTH_SHORT).show()
                                                isLoading = false
                                                return@launch
                                            }
                                            val response = RetrofitClient.apiService.registerUser(
                                                mapOf(
                                                    "name" to name,
                                                    "email" to email,
                                                    "mobile" to mobile,
                                                    "role" to "admin",
                                                    "invitationCode" to invitationCode
                                                )
                                            )
                                            if (response.isSuccessful && response.body() != null) {
                                                val user = response.body()!!.user
                                                saveSession(context, user)
                                                onAuthSuccess(user)
                                            } else {
                                                val err = response.errorBody()?.string() ?: response.message()
                                                Toast.makeText(context, "Error: $err", Toast.LENGTH_LONG).show()
                                            }
                                        } else { // Client
                                            if (enteredOtp != mockOtpCode) {
                                                Toast.makeText(context, "Invalid OTP code", Toast.LENGTH_SHORT).show()
                                                isLoading = false
                                                return@launch
                                            }
                                            val response = RetrofitClient.apiService.registerUser(
                                                mapOf(
                                                    "name" to name,
                                                    "email" to email,
                                                    "mobile" to mobile,
                                                    "role" to "client"
                                                )
                                            )
                                            if (response.isSuccessful && response.body() != null) {
                                                val user = response.body()!!.user
                                                saveSession(context, user)
                                                onAuthSuccess(user)
                                            } else {
                                                val err = response.errorBody()?.string() ?: response.message()
                                                Toast.makeText(context, "Error: $err", Toast.LENGTH_LONG).show()
                                            }
                                        }
                                    } else {
                                        // Login
                                        val usersResponse = RetrofitClient.apiService.getCurrentUsers()
                                        if (usersResponse.isSuccessful && usersResponse.body() != null) {
                                            val list = usersResponse.body()!!["users"] ?: emptyList()
                                            val matchedUser = list.find { it.email.lowercase() == email.lowercase() }
                                            if (matchedUser != null) {
                                                saveSession(context, matchedUser)
                                                onAuthSuccess(matchedUser)
                                            } else {
                                                Toast.makeText(context, "User profile not found. Switch to Create Account mode to register.", Toast.LENGTH_LONG).show()
                                            }
                                        } else {
                                            Toast.makeText(context, "Failed to connect to backend api.", Toast.LENGTH_LONG).show()
                                        }
                                    }
                                } catch (e: Exception) {
                                    Toast.makeText(context, "Network exception: ${e.message}", Toast.LENGTH_LONG).show()
                                } finally {
                                    isLoading = false
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = SecondaryDark),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = if (isRegisterMode) {
                                if (selectedRole == "client" && !showOtpField) "Send Verification SMS"
                                else if (selectedRole == "client") "Verify & Register"
                                else "Submit Onboarding Registry"
                            } else "Continue Securely",
                            color = TextLight,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                TextButton(
                    onClick = { 
                        isRegisterMode = !isRegisterMode
                        showOtpField = false
                    }
                ) {
                    Text(
                        text = if (isRegisterMode) "Already registered? Click here to Login" else "New to the platform? Create an account here",
                        color = SecondaryDark,
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

private fun saveSession(context: Context, user: User) {
    val prefs = context.getSharedPreferences("legaltalk_prefs", Context.MODE_PRIVATE)
    prefs.edit()
        .putString("user_id", user.id)
        .putString("user_role", user.role)
        .putString("user_name", user.name)
        .putString("user_email", user.email)
        .apply()

    // Register push token with API
    val token = prefs.getString("fcm_token", null)
    if (token != null) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                RetrofitClient.apiService.registerFcmToken(
                    mapOf("userId" to user.id, "token" to token)
                )
            } catch (e: Exception) {
                // background fail silent
            }
        }
    }
}
