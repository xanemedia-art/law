package com.legaltalk.india.data.model

data class WalletTransaction(
    val id: String,
    val walletId: String,
    val amount: Double,
    val type: String, // "deposit", "deduction", "credit", "withdrawal"
    val status: String, // "pending", "completed", "failed"
    val description: String,
    val timestamp: String
)

data class WalletResponse(
    val balance: Double,
    val transactions: List<WalletTransaction>
)

data class WithdrawalRequest(
    val lawyerId: String,
    val amount: Double,
    val bankHolderName: String,
    val bankAccountNumber: String,
    val ifscCode: String
)

data class AIAssistantRequest(
    val prompt: String
)

data class AIAssistantResponse(
    val text: String
)

data class RegisterResponse(
    val user: User,
    val profile: LawyerProfile? = null
)

data class AdminMetrics(
    val totalLawyers: Int,
    val commissionRevenue: Double
)

data class AdminMetricsResponse(
    val metrics: AdminMetrics,
    val lawyerProfiles: List<LawyerProfile>
)
