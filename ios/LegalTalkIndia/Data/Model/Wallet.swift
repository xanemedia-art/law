import Foundation

struct WalletTransaction: Codable, Identifiable {
    let id: String
    let walletId: String
    let amount: Double
    let type: String // "deposit", "deduction", "credit", "withdrawal"
    let status: String // "pending", "completed", "failed"
    let description: String
    let timestamp: String
}

struct WalletResponse: Codable {
    let balance: Double
    let transactions: [WalletTransaction]
}

struct RegisterResponse: Codable {
    let user: User
    let profile: LawyerProfile?
}

struct AIAssistantRequest: Codable {
    let prompt: String
}

struct AIAssistantResponse: Codable {
    let text: String
}
