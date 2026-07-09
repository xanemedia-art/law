import Foundation

struct LawyerProfile: Codable, Identifiable {
    var id: String { userId }
    let userId: String
    let barCouncilNumber: String
    let stateBarCouncil: String
    let aadhaar: String
    let pan: String
    let bio: String
    let experienceYears: Int
    let languages: [String]
    let categories: [String]
    let chatPricePerMinute: Double
    let voicePricePerMinute: Double
    let videoPricePerMinute: Double
    let verificationStatus: String // "pending", "approved", "rejected", "suspended"
    let isOnline: Bool
    let rating: Double
    let reviewCount: Int
    let practiceState: String?
    let practiceDistrict: String?
    let llbGraduationYear: Int?
    let llbUniversity: String?
    let barAssociationName: String?
    let placeOfPractice: String?
    let enrollmentCertificateUrl: String?
    let copUrl: String?
    let llbCertificateUrl: String?
    let subscriptionExpiresAt: String?
    
    // joined fields from users table representation
    let name: String?
    let avatarUrl: String?
    let mobile: String?
    let email: String?
    let isBlocked: Bool?
}
