package com.legaltalk.india.data.model

data class CaseDocument(
    val id: String,
    val name: String,
    val url: String,
    val uploadedBy: String, // "client", "lawyer"
    val uploadedAt: String
)

data class Case(
    val id: String,
    val clientId: String,
    val clientName: String,
    val lawyerId: String? = null,
    val lawyerName: String? = null,
    val title: String,
    val description: String,
    val category: String,
    val status: String, // "searching", "ongoing", "closed"
    val documents: List<CaseDocument> = emptyList(),
    val createdAt: String
)
