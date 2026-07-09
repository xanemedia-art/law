import SwiftUI

struct AdminMetrics: Codable {
    let totalLawyers: Int
    let commissionRevenue: Double
}

struct AdminMetricsResponse: Codable {
    let metrics: AdminMetrics
    let lawyerProfiles: [LawyerProfile]
}

struct AdminDashboardView: View {
    let currentUser: User
    let onLogout: () -> Void
    
    @State private var metrics: AdminMetrics?
    @State private var lawyersList: [LawyerProfile] = []
    @State private var searchQuery = ""
    @State private var loading = false
    @State private var actioning = false
    @State private var selectedLawyer: LawyerProfile?
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 15/255, green: 23/255, blue: 42/255)
                    .ignoresSafeArea()
                
                if loading && lawyersList.isEmpty {
                    ProgressView()
                        .tint(.blue)
                } else {
                    VStack(alignment: .leading, spacing: 16) {
                        // Metrics Cards Row
                        HStack(spacing: 12) {
                            VStack(alignment: .leading) {
                                Text("ENROLLED ADVOCATES")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.gray)
                                Text("\(metrics?.totalLawyers ?? 0)")
                                    .font(.system(size: 24, weight: .black))
                                    .foregroundColor(.white)
                                    .padding(.top, 2)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color(red: 30/255, green: 41/255, blue: 59/255))
                            .cornerRadius(12)
                            
                            VStack(alignment: .leading) {
                                Text("REGISTRY SAAS REVENUE")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.gray)
                                Text("₹\(Int(metrics?.commissionRevenue ?? 0))")
                                    .font(.system(size: 24, weight: .black))
                                    .foregroundColor(.green)
                                    .padding(.top, 2)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color(red: 30/255, green: 41/255, blue: 59/255))
                            .cornerRadius(12)
                        }
                        .padding(.horizontal)
                        
                        // Search Bar
                        TextField("", text: $searchQuery, prompt: Text("Search by name, ID or email...").foregroundColor(.gray))
                            .padding(12)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.white)
                            .background(Color(red: 30/255, green: 41/255, blue: 59/255))
                            .cornerRadius(8)
                            .padding(.horizontal)
                        
                        // Advocates Scrollable List
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                let filtered = lawyersList.filter { lawyer in
                                    searchQuery.isEmpty ||
                                    (lawyer.name?.localizedCaseInsensitiveContains(searchQuery) ?? false) ||
                                    lawyer.barCouncilNumber.localizedCaseInsensitiveContains(searchQuery) ||
                                    (lawyer.email?.localizedCaseInsensitiveContains(searchQuery) ?? false)
                                }
                                
                                if filtered.isEmpty {
                                    Text("No registered advocates found.")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(.gray)
                                        .padding(.top, 32)
                                } else {
                                    ForEach(filtered) { lawyer in
                                        VStack(alignment: .leading, spacing: 8) {
                                            HStack {
                                                Text(lawyer.name ?? "Unknown Advocate")
                                                    .font(.system(size: 15, weight: .bold))
                                                    .foregroundColor(.white)
                                                Spacer()
                                                StatusBadgeView(status: lawyer.verificationStatus)
                                            }
                                            
                                            Text(lawyer.barCouncilNumber)
                                                .font(.system(size: 12, weight: .semibold))
                                                .foregroundColor(.blue)
                                            
                                            Text(lawyer.stateBarCouncil)
                                                .font(.system(size: 11))
                                                .foregroundColor(.gray)
                                            
                                            Divider()
                                                .background(Color(red: 51/255, green: 65/255, blue: 85/255))
                                                .padding(.vertical, 4)
                                            
                                            HStack {
                                                Text("Exp: \(lawyer.experienceYears) Years")
                                                    .font(.system(size: 10))
                                                    .foregroundColor(.gray)
                                                Spacer()
                                                Text("Mobile: \(lawyer.mobile ?? "N/A")")
                                                    .font(.system(size: 10))
                                                    .foregroundColor(.gray)
                                            }
                                        }
                                        .padding()
                                        .background(Color(red: 30/255, green: 41/255, blue: 59/255))
                                        .cornerRadius(12)
                                        .onTapGesture {
                                            selectedLawyer = lawyer
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }
            }
            .navigationTitle("Command Center")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: onLogout) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(.white)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    HStack(spacing: 12) {
                        Button(action: fetchMetrics) {
                            Image(systemName: "arrow.clockwise")
                                .foregroundColor(.white)
                        }
                        Button("Logout", role: .destructive, action: onLogout)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.red)
                    }
                }
            }
        }
        .onAppear(perform: fetchMetrics)
        .sheet(item: $selectedLawyer) { lawyer in
            DossierDetailView(lawyer: lawyer, actioning: $actioning, onVerify: { action in
                handleVerify(lawyerId: lawyer.userId, action: action)
            }, onDismiss: {
                selectedLawyer = nil
            })
            .presentationDetents([.large])
            .background(Color(red: 30/255, green: 41/255, blue: 59/255))
        }
    }
    
    private func fetchMetrics() {
        loading = true
        Task {
            do {
                let response: AdminMetricsResponse = try await NetworkClient.shared.request(path: "api/admin/metrics")
                await MainActor.run {
                    self.metrics = response.metrics
                    self.lawyersList = response.lawyerProfiles
                    self.loading = false
                }
            } catch {
                await MainActor.run {
                    self.loading = false
                }
            }
        }
    }
    
    private func handleVerify(lawyerId: String, action: String) {
        actioning = true
        Task {
            do {
                let response: [String: Bool] = try await NetworkClient.shared.request(
                    path: "api/admin/verify",
                    method: "POST",
                    body: ["id": lawyerId, "action": action]
                )
                await MainActor.run {
                    if response["success"] == true {
                        self.lawyersList = self.lawyersList.map {
                            if $0.userId == lawyerId {
                                var updated = $0
                                // Creating mock copy struct manually
                                return LawyerProfile(
                                    userId: $0.userId,
                                    barCouncilNumber: $0.barCouncilNumber,
                                    stateBarCouncil: $0.stateBarCouncil,
                                    aadhaar: $0.aadhaar,
                                    pan: $0.pan,
                                    bio: $0.bio,
                                    experienceYears: $0.experienceYears,
                                    languages: $0.languages,
                                    categories: $0.categories,
                                    chatPricePerMinute: $0.chatPricePerMinute,
                                    voicePricePerMinute: $0.voicePricePerMinute,
                                    videoPricePerMinute: $0.videoPricePerMinute,
                                    verificationStatus: action, // updated verification status
                                    isOnline: $0.isOnline,
                                    rating: $0.rating,
                                    reviewCount: $0.reviewCount,
                                    practiceState: $0.practiceState,
                                    practiceDistrict: $0.practiceDistrict,
                                    llbGraduationYear: $0.llbGraduationYear,
                                    llbUniversity: $0.llbUniversity,
                                    barAssociationName: $0.barAssociationName,
                                    placeOfPractice: $0.placeOfPractice,
                                    enrollmentCertificateUrl: $0.enrollmentCertificateUrl,
                                    copUrl: $0.copUrl,
                                    llbCertificateUrl: $0.llbCertificateUrl,
                                    subscriptionExpiresAt: $0.subscriptionExpiresAt,
                                    name: $0.name,
                                    avatarUrl: $0.avatarUrl,
                                    mobile: $0.mobile,
                                    email: $0.email,
                                    isBlocked: $0.isBlocked
                                )
                            }
                            return $0
                        }
                        if self.selectedLawyer?.userId == lawyerId {
                            self.selectedLawyer = self.lawyersList.first(where: { $0.userId == lawyerId })
                        }
                        self.fetchMetrics()
                    }
                    self.actioning = false
                }
            } catch {
                await MainActor.run {
                    self.actioning = false
                }
            }
        }
    }
}

struct StatusBadgeView: View {
    let status: String
    
    var body: some View {
        let (bgColor, textColor, label) = getTheme()
        Text(label)
            .font(.system(size: 9, weight: .bold))
            .foregroundColor(textColor)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(bgColor)
            .cornerRadius(20)
    }
    
    private func getTheme() -> (Color, Color, String) {
        switch status {
        case "approved":
            return (Color.green.opacity(0.15), .green, "Approved")
        case "suspended":
            return (Color.orange.opacity(0.15), .orange, "Suspended")
        case "rejected":
            return (Color.red.opacity(0.15), .red, "Rejected")
        default:
            return (Color.blue.opacity(0.15), .blue, "Pending Audit")
        }
    }
}

struct DossierDetailView: View {
    let lawyer: LawyerProfile
    @Binding var actioning: Bool
    let onVerify: (String) -> Void
    let onDismiss: () -> Void
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                HStack {
                    VStack(alignment: .leading) {
                        Text(lawyer.name ?? "Unknown Advocate")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                        Text("Advocate Auditing Dossier")
                            .font(.system(size: 11))
                            .foregroundColor(.gray)
                    }
                    Spacer()
                    StatusBadgeView(status: lawyer.verificationStatus)
                }
                
                Divider()
                    .background(Color(red: 51/255, green: 65/255, blue: 85/255))
                
                // Contact Channels
                VStack(alignment: .leading, spacing: 4) {
                    Text("CONTACT CHANNELS")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.blue)
                    Text("Email: \(lawyer.email ?? "N/A")")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                    Text("Mobile: \(lawyer.mobile ?? "N/A")")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                }
                
                // Bar Council Details
                VStack(alignment: .leading, spacing: 4) {
                    Text("BAR ENROLMENT DETAILS")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.blue)
                    Text("Enrolment ID: \(lawyer.barCouncilNumber)")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                    Text("Bar Council: \(lawyer.stateBarCouncil)")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                }
                
                // Practice Location & KYC
                VStack(alignment: .leading, spacing: 4) {
                    Text("PRACTICE LOCATION & KYC")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.blue)
                    Text("Location: \(lawyer.practiceState ?? "Pending"), \(lawyer.practiceDistrict ?? "Pending")")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                    Text("Aadhaar ID: \(lawyer.aadhaar)")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                    Text("PAN Card: \(lawyer.pan)")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                }
                
                // Academic Credentials
                VStack(alignment: .leading, spacing: 4) {
                    Text("ACADEMIC CREDENTIALS")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.blue)
                    Text("University: \(lawyer.llbUniversity ?? "Pending")")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                    Text("LLB Graduation: \(lawyer.llbGraduationYear ?? 2020)")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                    Text("Bar Association: \(lawyer.barAssociationName ?? "Pending")")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                    Text("Place of Practice: \(lawyer.placeOfPractice ?? "Pending")")
                        .font(.system(size: 12))
                        .foregroundColor(.white)
                }
                
                // Bio
                VStack(alignment: .leading, spacing: 4) {
                    Text("SPECIALIST BIO STATEMENT")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.blue)
                    Text(lawyer.bio)
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                        .lineSpacing(4)
                }
                
                Divider()
                    .background(Color(red: 51/255, green: 65/255, blue: 85/255))
                
                // Documents Links
                Text("VERIFICATION CERTIFICATES")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.blue)
                
                HStack(spacing: 8) {
                    DocLinkSwiftButton(label: "Bar Cert")
                    DocLinkSwiftButton(label: "COP Cert")
                    DocLinkSwiftButton(label: "LLB Degree")
                }
                
                Spacer()
                    .frame(height: 20)
                
                // Verification Action Buttons
                if actioning {
                    HStack {
                        Spacer()
                        ProgressView()
                            .tint(.blue)
                        Spacer()
                    }
                } else {
                    HStack(spacing: 12) {
                        if lawyer.verificationStatus != "approved" {
                            Button(action: { onVerify("approved") }) {
                                Text("Approve")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.vertical, 10)
                                    .frame(maxWidth: .infinity)
                                    .background(Color.green)
                                    .cornerRadius(8)
                            }
                        }
                        
                        if lawyer.verificationStatus != "suspended" {
                            Button(action: { onVerify("suspended") }) {
                                Text("Suspend")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.vertical, 10)
                                    .frame(maxWidth: .infinity)
                                    .background(Color.gray)
                                    .cornerRadius(8)
                            }
                        }
                        
                        if lawyer.verificationStatus != "rejected" && lawyer.verificationStatus != "approved" {
                            Button(action: { onVerify("rejected") }) {
                                Text("Reject")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.vertical, 10)
                                    .frame(maxWidth: .infinity)
                                    .background(Color.red)
                                    .cornerRadius(8)
                            }
                        }
                    }
                }
                
                Button(action: onDismiss) {
                    Text("Close Dossier")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.vertical, 12)
                        .frame(maxWidth: .infinity)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.white, lineWidth: 1)
                        )
                }
                .padding(.top, 10)
            }
            .padding(24)
        }
    }
}

struct DocLinkSwiftButton: View {
    let label: String
    
    var body: some View {
        Button(action: {
            // Simulated link click log
        }) {
            Text(label)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.white)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(Color(red: 51/255, green: 65/255, blue: 85/255).opacity(0.5))
                .cornerRadius(8)
        }
    }
}
