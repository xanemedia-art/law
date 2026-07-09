package com.legaltalk.india.data.model

data class Consultation(
    val id: String,
    val clientId: String,
    val clientName: String,
    val lawyerId: String,
    val lawyerName: String,
    val type: String, // "chat", "voice", "video"
    val status: String, // "requested", "active", "completed", "cancelled"
    val startedAt: String? = null,
    val endedAt: String? = null,
    val totalMinutes: Int? = null,
    val ratePerMinute: Double,
    val totalCost: Double? = null,
    val lawyerReceipt: Double? = null,
    val platformCommission: Double? = null,
    val agoraChannelName: String? = null
)

data class ConsultationMessage(
    val id: String,
    val consultationId: String,
    val senderId: String,
    val senderName: String,
    val text: String,
    val timestamp: String
)
