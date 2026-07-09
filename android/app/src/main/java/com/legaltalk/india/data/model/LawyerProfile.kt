package com.legaltalk.india.data.model

data class LawyerProfile(
    val userId: String,
    val barCouncilNumber: String,
    val stateBarCouncil: String,
    val aadhaar: String,
    val pan: String,
    val bio: String,
    val experienceYears: Int,
    val languages: List<String>,
    val categories: List<String>,
    val chatPricePerMinute: Double,
    val voicePricePerMinute: Double,
    val videoPricePerMinute: Double,
    val verificationStatus: String, // "pending", "approved", "rejected", "suspended"
    val isOnline: Boolean,
    val rating: Double,
    val reviewCount: Int,
    val practiceState: String? = null,
    val practiceDistrict: String? = null,
    val llbGraduationYear: Int? = null,
    val llbUniversity: String? = null,
    val barAssociationName: String? = null,
    val placeOfPractice: String? = null,
    val enrollmentCertificateUrl: String? = null,
    val copUrl: String? = null,
    val llbCertificateUrl: String? = null,
    val subscriptionExpiresAt: String? = null,
    
    // joined fields from users association
    val name: String? = null,
    val avatarUrl: String? = null,
    val mobile: String? = null,
    val email: String? = null,
    val isBlocked: Boolean? = null
)
