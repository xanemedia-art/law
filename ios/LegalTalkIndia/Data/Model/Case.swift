import Foundation

struct CaseDocument: Codable, Identifiable {
    let id: String
    let name: String
    let url: String
    let uploadedBy: String // "client", "lawyer"
    let uploadedAt: String
}

struct Case: Codable, Identifiable {
    let id: String
    let clientId: String
    let clientName: String
    let lawyerId: String?
    let lawyerName: String?
    let title: String
    let description: String
    let category: String
    let status: String // "searching", "ongoing", "closed"
    let documents: [CaseDocument]
    let createdAt: String
}
