package com.legaltalk.india.data.network

import com.legaltalk.india.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @GET("api/auth/current")
    suspend fun getCurrentUsers(): Response<Map<String, List<User>>>

    @GET("api/users/{userId}")
    suspend fun getUserProfile(
        @Path("userId") userId: String
    ): Response<Map<String, User>>

    @POST("api/auth/register")
    suspend fun registerUser(
        @Body request: Map<String, String>
    ): Response<RegisterResponse>

    @POST("api/lawyers/register")
    suspend fun registerLawyer(
        @Body request: Map<String, String>
    ): Response<RegisterResponse>

    @GET("api/lawyers")
    suspend fun getLawyers(
        @Query("category") category: String? = null,
        @Query("language") language: String? = null,
        @Query("priceMax") priceMax: Double? = null,
        @Query("rating") rating: Double? = null,
        @Query("experienceMin") experienceMin: Int? = null,
        @Query("state") state: String? = null,
        @Query("district") district: String? = null
    ): Response<Map<String, List<LawyerProfile>>>

    @GET("api/lawyers/profile/{userId}")
    suspend fun getLawyerProfile(
        @Path("userId") userId: String
    ): Response<Map<String, LawyerProfile>>

    @POST("api/lawyers/update-prices")
    suspend fun updateLawyerProfile(
        @Body request: Map<String, Any>
    ): Response<Map<String, Any>>

    @POST("api/lawyers/pay-subscription")
    suspend fun paySubscription(
        @Body request: Map<String, String>
    ): Response<Map<String, Any>>

    @GET("api/wallet/{userId}")
    suspend fun getWallet(
        @Path("userId") userId: String
    ): Response<WalletResponse>

    @POST("api/wallet/deposit")
    suspend fun depositWallet(
        @Body request: Map<String, Any>
    ): Response<Map<String, Any>>

    @POST("api/consultations/create")
    suspend fun createConsultation(
        @Body request: Map<String, String>
    ): Response<Map<String, Consultation>>

    @POST("api/consultations/bill-minute")
    suspend fun billMinute(
        @Body request: Map<String, String>
    ): Response<Map<String, Any>>

    @POST("api/consultations/end")
    suspend fun endConsultation(
        @Body request: Map<String, String>
    ): Response<Map<String, Consultation>>

    @GET("api/consultations/messages/{consultationId}")
    suspend fun getMessages(
        @Path("consultationId") consultationId: String
    ): Response<Map<String, List<ConsultationMessage>>>

    @POST("api/consultations/messages")
    suspend fun sendMessage(
        @Body request: Map<String, String>
    ): Response<Map<String, ConsultationMessage>>

    @GET("api/consultations/history/{userId}")
    suspend fun getConsultationHistory(
        @Path("userId") userId: String
    ): Response<Map<String, List<Consultation>>>

    @GET("api/cases")
    suspend fun getCases(
        @Query("clientId") clientId: String? = null,
        @Query("lawyerId") lawyerId: String? = null,
        @Query("status") status: String? = null
    ): Response<Map<String, List<Case>>>

    @POST("api/cases/create")
    suspend fun createCase(
        @Body request: Map<String, String>
    ): Response<Map<String, Any>>

    @POST("api/cases/accept")
    suspend fun acceptCase(
        @Body request: Map<String, String>
    ): Response<Map<String, Any>>

    @POST("api/cases/upload-doc")
    suspend fun uploadCaseDocument(
        @Body request: Map<String, String>
    ): Response<Map<String, Any>>

    @POST("api/ai-assistant")
    suspend fun queryAIAssistant(
        @Body request: AIAssistantRequest
    ): Response<AIAssistantResponse>

    @POST("api/users/fcm-token")
    suspend fun registerFcmToken(
        @Body request: Map<String, String>
    ): Response<Map<String, Any>>

    @GET("api/admin/metrics")
    suspend fun getAdminMetrics(): Response<AdminMetricsResponse>

    @POST("api/admin/verify")
    suspend fun verifyLawyer(
        @Body request: Map<String, String>
    ): Response<Map<String, Any>>
}
