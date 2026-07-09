import SwiftUI

struct CallingWorkspaceView: View {
    let consultation: Consultation
    let isClient: Bool
    let onCallEnded: () -> Void
    
    @State private var secondsElapsed = 0
    @State private var isMuted = false
    
    // Timer for display
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    // 60-second billing loop timer for clients
    let billingTimer = Timer.publish(every: 60, on: .main, in: .common).autoconnect()
    
    var body: some View {
        BoxContainer {
            VStack(spacing: 24) {
                Spacer().frame(height: 32)
                
                // Call Header Info
                VStack(spacing: 4) {
                    Text(isClient ? "Consulting: \(consultation.lawyerName)" : "Client: \(consultation.clientName)")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(AppColors.textLight)
                    
                    Text(formatTime(secondsElapsed))
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(AppColors.successGreen)
                }
                
                Spacer()
                
                // Live Viewports Mock Container
                VStack(spacing: 16) {
                    ViewportCard(label: "LOCAL CAMERA PREVIEW\n(System overlay active)")
                    ViewportCard(label: "REMOTE VIDEO STREAM\n(Agora RTC active)")
                }
                
                Spacer()
                
                // Controls Bar Overlay
                HStack(spacing: 40) {
                    // Mute Trigger
                    Button(action: { isMuted.toggle() }) {
                        ZStack {
                            Circle()
                                .fill(isMuted ? AppColors.errorRed : AppColors.surfaceDark)
                                .frame(width: 60, height: 60)
                            Text(isMuted ? "🔇" : "🎙")
                                .font(.system(size: 24))
                                .foregroundColor(AppColors.textLight)
                        }
                    }
                    
                    // Disconnect Call Trigger
                    Button(action: endConsultationCall) {
                        ZStack {
                            Circle()
                                .fill(AppColors.errorRed)
                                .frame(width: 70, height: 70)
                            Text("📞")
                                .font(.system(size: 28))
                                .foregroundColor(AppColors.textLight)
                                .rotationEffect(.degrees(135))
                        }
                    }
                }
                
                Spacer().frame(height: 32)
            }
            .padding(24)
        }
        .onReceive(timer) { _ in
            secondsElapsed += 1
        }
        .onReceive(billingTimer) { _ in
            if isClient {
                executeBillingTick()
            }
        }
    }
    
    private func formatTime(_ totalSeconds: Int) -> String {
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
    
    private func executeBillingTick() {
        Task {
            do {
                let res: [String: Any] = try await NetworkClient.shared.request(
                    path: "api/consultations/bill-minute",
                    method: "POST",
                    body: ["consultationId": consultation.id]
                )
                if res["exhausted"] as? Bool == true {
                    print("Wallet balance reached zero, ending session.")
                    endConsultationCall()
                }
            } catch {
                print("Billing tick failure: \(error.localizedDescription)")
            }
        }
    }
    
    private func endConsultationCall() {
        Task {
            do {
                let _: [String: Any] = try await NetworkClient.shared.request(
                    path: "api/consultations/end",
                    method: "POST",
                    body: ["consultationId": consultation.id]
                )
            } catch {
                print("End consultation call failure: \(error.localizedDescription)")
            }
            onCallEnded()
        }
    }
}

// SwiftUI custom full-screen background helper
struct BoxContainer<Content: View>: View {
    let content: () -> Content
    
    var body: some View {
        ZStack {
            AppColors.backgroundDark
                .edgesIgnoringSafeArea(.all)
            content()
        }
    }
}

struct ViewportCard: View {
    let label: String
    
    var body: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(AppColors.surfaceDark)
            .frame(height: 180)
            .overlay(
                Text(label)
                    .font(.system(size: 13))
                    .foregroundColor(AppColors.textMuted)
                    .multilineTextAlignment(.center)
            )
            .padding(.horizontal)
    }
}
