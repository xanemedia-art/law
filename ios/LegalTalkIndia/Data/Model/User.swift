import Foundation

struct User: Codable, Identifiable {
    let id: String
    let role: String // "client", "lawyer", "admin"
    let name: String
    let email: String
    let mobile: String
    let city: String?
    let language: String?
    let avatarUrl: String?
    let isBlocked: Bool?
    let freeCallMinutesRemaining: Int?
    let freeChatsRemaining: Int?
    let fcmToken: String?
}
