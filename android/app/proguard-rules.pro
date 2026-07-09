# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified in Android SDK
# You can edit the include path and order by changing the proguardFiles directive in build.gradle.

# Keep Retrofit and OkHttp classes
-keep class retrofit2.** { *; }
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn retrofit2.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**

# Keep Gson serialization models
-keep class com.legaltalk.india.data.model.** { *; }

# Keep Agora RTC SDK classes
-keep class io.agora.** { *; }
-dontwarn io.agora.**
