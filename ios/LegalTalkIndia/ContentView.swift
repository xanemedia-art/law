import SwiftUI

struct ContentView: View {
    @State private var currentUser: User?
    @State private var activeCall: Consultation?
    
    var body: some View {
        Group {
            if let call = activeCall {
                CallingWorkspaceView(
                    consultation: call,
                    isClient: currentUser?.role == "client",
                    onCallEnded: { activeCall = nil }
                )
            } else if let user = currentUser {
                if user.role == "lawyer" {
                    LawyerDashboardView(
                        currentUser: user,
                        onLogout: logout
                    )
                } else if user.role == "admin" {
                    AdminDashboardView(
                        currentUser: user,
                        onLogout: logout
                    )
                } else {
                    ClientDashboardScreenWrapper(
                        currentUser: user,
                        onStartCall: { call in activeCall = call },
                        onLogout: logout
                    )
                }
            } else {
                LoginView(onAuthSuccess: { user in
                    currentUser = user
                })
            }
        }
        .onAppear(perform: checkSavedSession)
    }
    
    private func checkSavedSession() {
        let prefs = UserDefaults.standard
        if let userId = prefs.string(forKey: "user_id"),
           let role = prefs.string(forKey: "user_role"),
           let name = prefs.string(forKey: "user_name"),
           let email = prefs.string(forKey: "user_email") {
            currentUser = User(
                id: userId,
                role: role,
                name: name,
                email: email,
                mobile: "",
                city: nil,
                language: nil,
                avatarUrl: nil,
                isBlocked: false,
                freeCallMinutesRemaining: 0,
                freeChatsRemaining: 0,
                fcmToken: nil
            )
        }
    }
    
    private func logout() {
        let prefs = UserDefaults.standard
        prefs.removeObject(forKey: "user_id")
        prefs.removeObject(forKey: "user_role")
        prefs.removeObject(forKey: "user_name")
        prefs.removeObject(forKey: "user_email")
        currentUser = nil
        activeCall = nil
    }
}

// SwiftUI helper wrapper to resolve screen call naming conventions
struct ClientDashboardScreenWrapper: View {
    let currentUser: User
    let onStartCall: (Consultation) -> Void
    let onLogout: () -> Void
    
    var body: some View {
        ClientDashboardView(
            currentUser: currentUser,
            onStartCall: onStartCall,
            onLogout: onLogout
        )
    }
}
