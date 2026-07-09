import Foundation

struct Consultation: Codable, Identifiable {
    let id: String
    let clientId: String
    let clientName: String
    let lawyerId: String
    let lawyerName: String
    let type: String // "chat", "voice", "video"
    let status: String // "requested", "active", "completed", "cancelled"
    let startedAt: String?
    let endedAt: String?
    let totalMinutes: Int?
    let ratePerMinute: Double
    let totalCost: Double?
    let lawyerReceipt: Double?
    let platformCommission: Double?
    let agoraChannelName: String?
}

struct ConsultationMessage: Codable, Identifiable {
    let id: String
    let consultationId: String
    let senderId: String
    let senderName: String
    let text: String
    let timestamp: String
}
