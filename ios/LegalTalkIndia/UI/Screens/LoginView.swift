import SwiftUI
import LocalAuthentication

struct LoginView: View {
    let onAuthSuccess: (User) -> Void
    
    @State private var email = ""
    @State private var isRegisterMode = false
    @State private var selectedRole = "client" // "client", "lawyer", "admin"
    
    // Register fields
    @State private var name = ""
    @State private var mobile = ""
    @State private var invitationCode = ""
    
    // Client Simulated OTP fields
    @State private var showOtpField = false
    @State private var mockOtpCode = ""
    @State private var enteredOtp = ""
    
    // Lawyer fields
    @State private var barCouncilNumber = ""
    @State private var stateBarCouncil = ""
    @State private var practiceState = ""
    @State private var practiceDistrict = ""
    
    @State private var isLoading = false
    @State private var errorMessage = ""
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Spacer().frame(height: 40)
                
                // App logo
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(AppColors.secondaryDark)
                        .frame(width: 80, height: 80)
                    Text("⚖")
                        .font(.system(size: 44))
                        .foregroundColor(AppColors.textLight)
                }
                
                VStack(spacing: 4) {
                    Text("LegalTalk India")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(AppColors.textLight)
                        .tracking(1.0)
                    
                    Text("Instant 24/7 Professional Legal Counsel")
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.textMuted)
                        .multilineTextAlignment(.center)
                }
                
                if isRegisterMode {
                    Picker("Role Selection", selection: $selectedRole) {
                        Text("Client").tag("client")
                        Text("Advocate").tag("lawyer")
                        Text("Admin").tag("admin")
                    }
                    .pickerStyle(.segmented)
                    .background(AppColors.surfaceDark)
                    .cornerRadius(8)
                    .padding(.horizontal)
                    .onChange(of: selectedRole) { _ in
                        showOtpField = false
                        enteredOtp = ""
                        mockOtpCode = ""
                    }
                }
                
                VStack(spacing: 16) {
                    Text(isRegisterMode ? "Create Account" : "Welcome Back")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(AppColors.textLight)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.bottom, 8)
                    
                    if isRegisterMode && selectedRole == "client" && showOtpField {
                        // Simulated OTP section
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Simulated SMS Verification")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(AppColors.secondaryDark)
                            Text("For testing simulation, use code: \(mockOtpCode)")
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.textMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.bottom, 8)
                        
                        CustomTextField(placeholder: "6-Digit OTP Code", text: $enteredOtp, keyboardType: .numberPad)
                    } else {
                        if isRegisterMode {
                            CustomTextField(placeholder: "Full Legal Name", text: $name)
                            CustomTextField(placeholder: "Mobile Number", text: $mobile, keyboardType: .phonePad)
                        }
                        
                        CustomTextField(placeholder: "Email Address", text: $email, keyboardType: .emailAddress)
                        
                        if isRegisterMode && selectedRole == "admin" {
                            CustomTextField(placeholder: "Admin Invitation Code (e.g. ADM-INV-123456)", text: $invitationCode)
                        }
                        
                        if isRegisterMode && selectedRole == "lawyer" {
                            CustomTextField(placeholder: "Bar Council Enrolment ID (e.g. D/1042/2012)", text: $barCouncilNumber)
                            CustomTextField(placeholder: "State Bar Council", text: $stateBarCouncil)
                            CustomTextField(placeholder: "Practice State Location", text: $practiceState)
                            CustomTextField(placeholder: "Practice District Location", text: $practiceDistrict)
                        }
                    }
                    
                    if !errorMessage.isEmpty {
                        Text(errorMessage)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(AppColors.errorRed)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: AppColors.secondaryDark))
                            .padding()
                    } else {
                        Button(action: handleAuthSubmit) {
                            Text(isRegisterMode ? (selectedRole == "client" && !showOtpField ? "Send Verification SMS" : "Verify & Register") : "Continue Securely")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(AppColors.textLight)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(AppColors.secondaryDark)
                                .cornerRadius(8)
                        }
                        .padding(.top, 8)
                    }
                    
                    Button(action: { 
                        isRegisterMode.toggle()
                        showOtpField = false
                        errorMessage = "" 
                    }) {
                        Text(isRegisterMode ? "Already registered? Click here to Login" : "New to the platform? Create an account here")
                            .font(.system(size: 12))
                            .foregroundColor(AppColors.secondaryDark)
                            .multilineTextAlignment(.center)
                            .padding(.top, 8)
                    }
                }
                .padding(24)
                .background(AppColors.surfaceDark)
                .cornerRadius(16)
                
                Spacer()
            }
            .padding(24)
        }
        .background(
            LinearGradient(
                gradient: Gradient(colors: [AppColors.backgroundDark, Color(red: 2/255, green: 6/255, blue: 23/255)]),
                startPoint: .top,
                endPoint: .bottom
            )
            .edgesIgnoringSafeArea(.all)
        )
    }
    
    private func handleAuthSubmit() {
        if email.isEmpty {
            errorMessage = "Please enter email"
            return
        }
        
        if isRegisterMode && selectedRole == "client" && !showOtpField {
            if name.isEmpty || mobile.isEmpty {
                errorMessage = "Please fill name and mobile number"
                return
            }
            mockOtpCode = String(Int.random(in: 100000...999999))
            showOtpField = true
            return
        }
        
        isLoading = true
        errorMessage = ""
        
        Task {
            do {
                if isRegisterMode {
                    if selectedRole == "lawyer" {
                        if name.isEmpty || mobile.isEmpty || barCouncilNumber.isEmpty || stateBarCouncil.isEmpty {
                            errorMessage = "Please fill required advocate fields"
                            isLoading = false
                            return
                        }
                        
                        let response: RegisterResponse = try await NetworkClient.shared.request(
                            path: "api/lawyers/register",
                            method: "POST",
                            body: [
                                "fullName": name,
                                "email": email,
                                "mobile": mobile,
                                "barCouncilNumber": barCouncilNumber,
                                "stateBarCouncil": stateBarCouncil,
                                "practiceState": practiceState,
                                "practiceDistrict": practiceDistrict
                            ]
                        )
                        
                        saveSession(user: response.user)
                        onAuthSuccess(response.user)
                    } else if selectedRole == "admin" {
                        if name.isEmpty || mobile.isEmpty || invitationCode.isEmpty {
                            errorMessage = "Please fill required admin fields"
                            isLoading = false
                            return
                        }
                        
                        let response: RegisterResponse = try await NetworkClient.shared.request(
                            path: "api/auth/register",
                            method: "POST",
                            body: [
                                "name": name,
                                "email": email,
                                "mobile": mobile,
                                "role": "admin",
                                "invitationCode": invitationCode
                            ]
                        )
                        
                        saveSession(user: response.user)
                        onAuthSuccess(response.user)
                    } else { // client
                        if enteredOtp != mockOtpCode {
                            errorMessage = "Invalid OTP code"
                            isLoading = false
                            return
                        }
                        
                        let response: RegisterResponse = try await NetworkClient.shared.request(
                            path: "api/auth/register",
                            method: "POST",
                            body: [
                                "name": name,
                                "email": email,
                                "mobile": mobile,
                                "role": "client"
                            ]
                        )
                        
                        saveSession(user: response.user)
                        onAuthSuccess(response.user)
                    }
                } else {
                    // Simulated Login via fetching current users
                    let result: [String: [User]] = try await NetworkClient.shared.request(path: "api/auth/current")
                    let list = result["users"] ?? []
                    if let matchedUser = list.first(where: { $0.email.lowercased() == email.lowercased() }) {
                        saveSession(user: matchedUser)
                        onAuthSuccess(matchedUser)
                    } else {
                        errorMessage = "Profile not found. Switch to Create Account to register."
                    }
                }
            } catch {
                errorMessage = "API Error: \(error.localizedDescription)"
            }
            isLoading = false
        }
    }
    
    private func saveSession(user: User) {
        let prefs = UserDefaults.standard
        prefs.set(user.id, forKey: "user_id")
        prefs.set(user.role, forKey: "user_role")
        prefs.set(user.name, forKey: "user_name")
        prefs.set(user.email, forKey: "user_email")
        
        // Push token update if saved
        if let token = prefs.string(forKey: "fcm_token") {
            Task {
                let _: [String: Any] = try await NetworkClient.shared.request(
                    path: "api/users/fcm-token",
                    method: "POST",
                    body: ["userId": user.id, "token": token]
                )
            }
        }
    }
}
