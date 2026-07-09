import SwiftUI

struct LawyerDashboardView: View {
    let currentUser: User
    let onLogout: () -> Void
    
    @State private var isOnline = false
    @State private var walletBalance = 0.0
    @State private var lawyerProfile: LawyerProfile?
    @State private var activeCases: [Case] = []
    
    // settings form
    @State private var chatPrice = "20"
    @State private var voicePrice = "30"
    @State private var videoPrice = "40"
    @State private var bioText = ""
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    
                    // Chambers Earnings Payout Card
                    CardContainer {
                        VStack(spacing: 12) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Payout Ledger Earnings")
                                        .font(.system(size: 12))
                                        .foregroundColor(AppColors.textMuted)
                                    Text("₹\(String(format: "%.2f", walletBalance))")
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(AppColors.textLight)
                                }
                                Spacer()
                                
                                HStack(spacing: 8) {
                                    Text(isOnline ? "ONLINE" : "OFFLINE")
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundColor(isOnline ? AppColors.successGreen : AppColors.textMuted)
                                    
                                    Toggle("", isOn: $isOnline)
                                        .labelsHidden()
                                        .tint(AppColors.successGreen)
                                        .onChange(of: isOnline) { oldValue, newValue in
                                            updateOnlineStatus(newValue)
                                        }
                                }
                            }
                        }
                    }
                    
                    // Rates & Bio Settings Section
                    CardContainer {
                        VStack(alignment: .leading, spacing: 14) {
                            Text("Rate Settings (INR / minute)")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(AppColors.textLight)
                            
                            HStack(spacing: 8) {
                                CompactInput(label: "Chat", text: $chatPrice)
                                CompactInput(label: "Voice", text: $voicePrice)
                                CompactInput(label: "Video", text: $videoPrice)
                            }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Chambers Bio / Specializations")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(AppColors.textMuted)
                                TextEditor(text: $bioText)
                                    .frame(height: 60)
                                    .scrollContentBackground(.hidden)
                                    .background(Color(red: 15/255, green: 23/255, blue: 42/255))
                                    .foregroundColor(AppColors.textLight)
                                    .cornerRadius(6)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 6)
                                            .stroke(AppColors.textMuted.opacity(0.3), lineWidth: 1)
                                    )
                            }
                            
                            Button(action: saveSettings) {
                                Text("Update Chambers Ledger Settings")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(AppColors.textLight)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 40)
                                    .background(AppColors.secondaryDark)
                                    .cornerRadius(6)
                            }
                        }
                    }
                    
                    // Subscription Renewal Card
                    CardContainer {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Advocate Registry Subscription")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(AppColors.textLight)
                            
                            if let expires = lawyerProfile?.subscriptionExpiresAt {
                                Text("Expires at: \(expires.prefix(10))")
                                    .font(.system(size: 12))
                                    .foregroundColor(AppColors.textMuted)
                                    .padding(.bottom, 6)
                            } else {
                                Text("No active license detected.")
                                    .font(.system(size: 12))
                                    .foregroundColor(AppColors.textMuted)
                                    .padding(.bottom, 6)
                            }
                            
                            Button(action: paySubscription) {
                                Text("Renew Annual Registration (₹1200)")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(AppColors.textLight)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 40)
                                    .background(AppColors.accentDark)
                                    .cornerRadius(6)
                            }
                        }
                    }
                    
                    // Case Board (Requests)
                    Text("Shared Case Board (Client Requests)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(AppColors.textLight)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.top, 8)
                    
                    if activeCases.isEmpty {
                        Text("No open client cases listed.")
                            .font(.system(size: 13))
                            .foregroundColor(AppColors.textMuted)
                            .padding()
                    } else {
                        VStack(spacing: 12) {
                            ForEach(activeCases) { kase in
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text(kase.title)
                                            .font(.system(size: 15, weight: .bold))
                                            .foregroundColor(AppColors.textLight)
                                        Spacer()
                                        Text(kase.category)
                                            .font(.system(size: 11, weight: .semibold))
                                            .foregroundColor(AppColors.accentDark)
                                    }
                                    
                                    Text(kase.description)
                                        .font(.system(size: 12))
                                        .foregroundColor(AppColors.textMuted)
                                    
                                    HStack {
                                        Text("Client: \(kase.clientName)")
                                            .font(.system(size: 11))
                                            .foregroundColor(AppColors.textMuted)
                                        Spacer()
                                        
                                        Button(action: { acceptCase(kase) }) {
                                            Text("Accept Case")
                                                .font(.system(size: 12, weight: .bold))
                                                .foregroundColor(AppColors.textLight)
                                                .padding(.horizontal, 12)
                                                .padding(.vertical, 6)
                                                .background(AppColors.successGreen)
                                                .cornerRadius(4)
                                        }
                                    }
                                }
                                .padding(16)
                                .background(AppColors.surfaceDark)
                                .cornerRadius(10)
                            }
                        }
                    }
                }
                .padding(16)
            }
            .background(AppColors.backgroundDark)
            .navigationTitle("Chambers Command Center")
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
            .onAppear(perform: fetchLawyerData)
        }
    }
    
    private func fetchLawyerData() {
        Task {
            do {
                let profileRes: [String: LawyerProfile] = try await NetworkClient.shared.request(path: "api/lawyers/profile/\(currentUser.id)")
                if let profile = profileRes["profile"] {
                    lawyerProfile = profile
                    isOnline = profile.isOnline
                    chatPrice = String(Int(profile.chatPricePerMinute))
                    voicePrice = String(Int(profile.voicePricePerMinute))
                    videoPrice = String(Int(profile.videoPricePerMinute))
                    bioText = profile.bio
                }
                
                let walletRes: WalletResponse = try await NetworkClient.shared.request(path: "api/wallet/\(currentUser.id)")
                walletBalance = walletRes.balance
                
                let casesRes: [String: [Case]] = try await NetworkClient.shared.request(path: "api/cases?status=searching")
                activeCases = casesRes["cases"] ?? []
            } catch {
                print("Failed to fetch lawyer data: \(error.localizedDescription)")
            }
        }
    }
    
    private func updateOnlineStatus(_ online: Bool) {
        Task {
            do {
                let _: [String: Any] = try await NetworkClient.shared.request(
                    path: "api/lawyers/update-prices",
                    method: "POST",
                    body: [
                        "userId": currentUser.id,
                        "isOnline": online
                    ]
                )
            } catch {
                print("Online toggle update failed: \(error.localizedDescription)")
            }
        }
    }
    
    private func saveSettings() {
        guard let chat = Double(chatPrice), let voice = Double(voicePrice), let video = Double(videoPrice) else { return }
        Task {
            do {
                let _: [String: Any] = try await NetworkClient.shared.request(
                    path: "api/lawyers/update-prices",
                    method: "POST",
                    body: [
                        "userId": currentUser.id,
                        "chatPrice": chat,
                        "voicePrice": voice,
                        "videoPrice": video,
                        "bio": bioText
                    ]
                )
                fetchLawyerData()
            } catch {
                print("Settings save failed: \(error.localizedDescription)")
            }
        }
    }
    
    private func paySubscription() {
        Task {
            do {
                let res: [String: Any] = try await NetworkClient.shared.request(
                    path: "api/lawyers/pay-subscription",
                    method: "POST",
                    body: ["userId": currentUser.id]
                )
                if res["success"] as? Bool == true {
                    fetchLawyerData()
                }
            } catch {
                print("Subscription payment failed: \(error.localizedDescription)")
            }
        }
    }
    
    private func acceptCase(_ kase: Case) {
        Task {
            do {
                let _: [String: Any] = try await NetworkClient.shared.request(
                    path: "api/cases/accept",
                    method: "POST",
                    body: [
                        "caseId": kase.id,
                        "lawyerId": currentUser.id,
                        "lawyerName": currentUser.name
                    ]
                )
                fetchLawyerData()
            } catch {
                print("Case accept failed: \(error.localizedDescription)")
            }
        }
    }
}

// SwiftUI custom card container
struct CardContainer<Content: View>: View {
    let content: () -> Content
    
    var body: some View {
        VStack {
            content()
        }
        .padding(16)
        .background(AppColors.surfaceDark)
        .cornerRadius(12)
    }
}

struct CompactInput: View {
    let label: String
    @Binding var text: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(AppColors.textMuted)
            TextField("", text: $text)
                .padding(8)
                .background(Color(red: 15/255, green: 23/255, blue: 42/255))
                .foregroundColor(AppColors.textLight)
                .cornerRadius(6)
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(AppColors.textMuted.opacity(0.3), lineWidth: 1)
                )
                .keyboardType(.numberPad)
        }
    }
}
