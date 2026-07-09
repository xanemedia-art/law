import SwiftUI

struct ClientDashboardView: View {
    let currentUser: User
    let onStartCall: (Consultation) -> Void
    let onLogout: () -> Void
    
    @State private var walletBalance = 0.0
    @State private var lawyersList: [LawyerProfile] = []
    @State private var userState: User? = nil
    
    // Sheets/Modals
    @State private var selectedLawyer: LawyerProfile?
    @State private var showPostCase = false
    @State private var showDeposit = false
    
    // Post Case Form
    @State private var caseTitle = ""
    @State private var caseDesc = ""
    @State private var caseCategory = "General Guidance"
    
    // Deposit Form
    @State private var depositAmount = ""
    
    @State private var isLoading = false
    
    var body: some View {
        let user = userState ?? currentUser
        NavigationStack {
            VStack(spacing: 16) {
                // Wallet Header banner
                VStack(spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Durable Wallet Balance")
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.textMuted)
                            Text("₹\(String(format: "%.2f", walletBalance))")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(AppColors.textLight)
                        }
                        Spacer()
                        
                        Button(action: { showDeposit = true }) {
                            Text("Recharge")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(AppColors.textLight)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .background(AppColors.successGreen)
                                .cornerRadius(8)
                        }
                    }
                    
                    Button(action: { showPostCase = true }) {
                        Text("+ Post Case Requirement")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(AppColors.textLight)
                            .frame(maxWidth: .infinity)
                            .frame(height: 44)
                            .background(AppColors.secondaryDark)
                            .cornerRadius(8)
                    }
                }
                .padding(20)
                .background(AppColors.surfaceDark)
                .cornerRadius(16)
                
                if (user.freeCallMinutesRemaining ?? 0) > 0 || (user.freeChatsRemaining ?? 0) > 0 {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("🎁 Welcome Gift Benefits Active")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(AppColors.secondaryDark)
                        
                        HStack {
                            if let freeMins = user.freeCallMinutesRemaining, freeMins > 0 {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Free Call Minutes")
                                        .font(.system(size: 11))
                                        .foregroundColor(AppColors.textMuted)
                                    Text("\(freeMins) Mins")
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(AppColors.textLight)
                                }
                            }
                            Spacer()
                            if let freeChats = user.freeChatsRemaining, freeChats > 0 {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Free Chat Bubbles")
                                        .font(.system(size: 11))
                                        .foregroundColor(AppColors.textMuted)
                                    Text("\(freeChats) Chats")
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(AppColors.textLight)
                                }
                            }
                        }
                    }
                    .padding(16)
                    .background(AppColors.surfaceDark)
                    .cornerRadius(12)
                }
                
                Text("BCI-Compliant Advocate Directory")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(AppColors.textLight)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, 8)
                
                if lawyersList.isEmpty {
                    Spacer()
                    Text("No online advocates currently registered.")
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.textMuted)
                    Spacer()
                } else {
                    ScrollView {
                        VStack(spacing: 12) {
                            ForEach(lawyersList) { profile in
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(profile.name ?? "Advocate")
                                            .font(.system(size: 16, weight: .bold))
                                            .foregroundColor(AppColors.textLight)
                                        Text(profile.stateBarCouncil)
                                            .font(.system(size: 12))
                                            .foregroundColor(AppColors.textMuted)
                                        Text("Exp: \(profile.experienceYears) Years | \(profile.practiceDistrict ?? ""), \(profile.practiceState ?? "")")
                                            .font(.system(size: 11))
                                            .foregroundColor(AppColors.textMuted)
                                    }
                                    Spacer()
                                    
                                    Button(action: { initiateCall(with: profile) }) {
                                        Text("Video Call")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundColor(AppColors.textLight)
                                            .padding(.horizontal, 12)
                                            .padding(.vertical, 8)
                                            .background(AppColors.secondaryDark)
                                            .cornerRadius(6)
                                    }
                                }
                                .padding(16)
                                .background(AppColors.surfaceDark)
                                .cornerRadius(12)
                                .onTapGesture {
                                    selectedLawyer = profile
                                }
                            }
                        }
                    }
                }
            }
            .padding(16)
            .background(AppColors.backgroundDark)
            .navigationTitle("Client Command Center")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: onLogout) {
                        Text("Logout")
                            .foregroundColor(AppColors.errorRed)
                            .font(.system(size: 14, weight: .semibold))
                    }
                }
            }
            .onAppear(perform: fetchDashboardData)
            .sheet(item: $selectedLawyer) { profile in
                DossierSheet(profile: profile)
            }
            .sheet(isPresented: $showPostCase) {
                PostCaseSheet(clientId: user.id, clientName: user.name, isPresented: $showPostCase)
            }
            .sheet(isPresented: $showDeposit) {
                DepositSheet(userId: user.id, isPresented: $showDeposit, onDepositSuccess: fetchDashboardData)
            }
        }
    }
    
    private func fetchDashboardData() {
        Task {
            do {
                let walletRes: WalletResponse = try await NetworkClient.shared.request(path: "api/wallet/\(currentUser.id)")
                walletBalance = walletRes.balance
                
                let userRes: [String: User] = try await NetworkClient.shared.request(path: "api/users/\(currentUser.id)")
                if let updatedUser = userRes["user"] {
                    userState = updatedUser
                }
                
                let lawyersRes: [String: [LawyerProfile]] = try await NetworkClient.shared.request(path: "api/lawyers")
                lawyersList = lawyersRes["lawyers"] ?? []
            } catch {
                print("Dashboard fetch failed: \(error.localizedDescription)")
            }
        }
    }
    
    private func initiateCall(with lawyer: LawyerProfile) {
        isLoading = true
        let user = userState ?? currentUser
        Task {
            do {
                let res: [String: Consultation] = try await NetworkClient.shared.request(
                    path: "api/consultations/create",
                    method: "POST",
                    body: [
                        "clientId": user.id,
                        "lawyerId": lawyer.userId,
                        "type": "video"
                    ]
                )
                if let consultation = res["session"] {
                    onStartCall(consultation)
                }
            } catch {
                print("Failed to start session: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }
}

// Reusable Dossier Sheet (Rating Score display is hidden, BCI compliant)
struct DossierSheet: View {
    let profile: LawyerProfile
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text(profile.name ?? "Advocate")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(AppColors.textLight)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        DossierRow(title: "Bar Council ID", value: profile.barCouncilNumber)
                        DossierRow(title: "State Bar Council", value: profile.stateBarCouncil)
                        DossierRow(title: "Experience years", value: "\(profile.experienceYears) Years")
                        DossierRow(title: "Languages Spoken", value: profile.languages.joined(separator: ", "))
                        DossierRow(title: "University / School", value: profile.llbUniversity ?? "Pending")
                        DossierRow(title: "Chambers Bio", value: profile.bio)
                    }
                    .padding()
                    .background(AppColors.surfaceDark)
                    .cornerRadius(12)
                    
                    Text("Hourly / Minute consulting Rates")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(AppColors.textLight)
                    
                    VStack(spacing: 8) {
                        DossierRow(title: "Video Call Price", value: "₹\(Int(profile.videoPricePerMinute))/minute")
                        DossierRow(title: "Voice Call Price", value: "₹\(Int(profile.voicePricePerMinute))/minute")
                        DossierRow(title: "Chat bubble Price", value: "₹\(Int(profile.chatPricePerMinute))/minute")
                    }
                    .padding()
                    .background(AppColors.surfaceDark)
                    .cornerRadius(12)
                    
                    Spacer()
                }
                .padding(24)
            }
            .background(AppColors.backgroundDark)
            .navigationTitle("Verified Advocate Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                        .foregroundColor(AppColors.secondaryDark)
                }
            }
        }
    }
}

struct DossierRow: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(AppColors.textMuted)
            Text(value)
                .font(.system(size: 14))
                .foregroundColor(AppColors.textLight)
        }
        .padding(.vertical, 2)
    }
}

// Reusable Post Case requirement Sheet
struct PostCaseSheet: View {
    let clientId: String
    let clientName: String
    @Binding var isPresented: Bool
    @Environment(\.dismiss) var dismiss
    
    @State private var title = ""
    @State private var desc = ""
    @State private var category = "Criminal Defense"
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Case Information").foregroundColor(AppColors.textMuted)) {
                    TextField("Case Title", text: $title)
                        .listRowBackground(AppColors.surfaceDark)
                    TextField("Case Brief Details", text: $desc)
                        .listRowBackground(AppColors.surfaceDark)
                    TextField("Legal Category", text: $category)
                        .listRowBackground(AppColors.surfaceDark)
                }
                
                Button(action: submitCase) {
                    Text("Post Case to Board")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(AppColors.textLight)
                        .frame(maxWidth: .infinity)
                        .listRowBackground(AppColors.secondaryDark)
                }
            }
            .scrollContentBackground(.hidden)
            .background(AppColors.backgroundDark)
            .foregroundColor(AppColors.textLight)
            .navigationTitle("Post Case Board")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(AppColors.secondaryDark)
                }
            }
        }
    }
    
    private func submitCase() {
        if title.isEmpty || desc.isEmpty { return }
        Task {
            do {
                let _: [String: Any] = try await NetworkClient.shared.request(
                    path: "api/cases/create",
                    method: "POST",
                    body: [
                        "clientId": clientId,
                        "clientName": clientName,
                        "title": title,
                        "description": desc,
                        "category": category
                    ]
                )
                isPresented = false
            } catch {
                print("Failed to post case: \(error.localizedDescription)")
            }
        }
    }
}

// Reusable Deposit Sheet
struct DepositSheet: View {
    let userId: String
    @Binding var isPresented: Bool
    let onDepositSuccess: () -> Void
    @Environment(\.dismiss) var dismiss
    
    @State private var amount = ""
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("Recharge wallet balance using Razorpay gateway. Money is held securely for 100% payouts.")
                    .font(.system(size: 14))
                    .foregroundColor(AppColors.textMuted)
                    .multilineTextAlignment(.center)
                    .padding()
                
                CustomTextField(placeholder: "Deposit Amount (INR)", text: $amount, keyboardType: .numberPad)
                    .padding(.horizontal)
                
                Button(action: handleDepositSubmit) {
                    Text("Confirm Payout Deposit")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(AppColors.textLight)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(AppColors.successGreen)
                        .cornerRadius(8)
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .padding(.top, 24)
            .background(AppColors.backgroundDark)
            .navigationTitle("Secure Deposit recharge")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(AppColors.secondaryDark)
                }
            }
        }
    }
    
    private func handleDepositSubmit() {
        guard let amt = Double(amount), amt > 0 else { return }
        Task {
            do {
                let _: [String: Any] = try await NetworkClient.shared.request(
                    path: "api/wallet/deposit",
                    method: "POST",
                    body: [
                        "userId": userId,
                        "amount": amt,
                        "rzpOrderId": "rzp_ios_simulator_\(Int(Date().timeIntervalSince1970))"
                    ]
                )
                onDepositSuccess()
                isPresented = false
            } catch {
                print("Deposit recharge failed: \(error.localizedDescription)")
            }
        }
    }
}
