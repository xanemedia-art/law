package com.legaltalk.india.data.model

data class User(
    val id: String,
    val role: String, // "client", "lawyer", "admin"
    val name: String,
    val email: String,
    val mobile: String,
    val city: String? = null,
    val language: String? = null,
    val avatarUrl: String? = null,
    val isBlocked: Boolean = false,
    val freeCallMinutesRemaining: Int = 0,
    val freeChatsRemaining: Int = 0,
    val fcmToken: String? = null
)
