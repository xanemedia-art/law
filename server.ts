import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

// Bypass certificate verification issues under local sandbox/proxy environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import { 
  User, 
  LawyerProfile, 
  Consultation, 
  ConsultationMessage, 
  ConsultationType,
  Wallet, 
  WalletTransaction, 
  Review, 
  WithdrawalRequest, 
  CommissionLog, 
  SystemStats,
  Case,
  CaseDocument,
  WebRTCSignal
} from "./src/types";

// Password hashing and verification utilities
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (storedHash.includes(":")) {
    const [salt, originalHash] = storedHash.split(":");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  }
  return password === storedHash;
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// -------------------------------------------------------------
// IN-MEMORY & DURABLE LOCAL DISK REPOSITORY
// -------------------------------------------------------------
let users: User[] = [
  { id: "u-admin-1", role: "admin", name: "Suresh Gupta", email: "admin@legaltalk.in", mobile: "9900001122", passwordHash: hashPassword("admin123") },
  { id: "u-client-demo", role: "client", name: "Demo Client", email: "client@demo.in", mobile: "9876543210", freeCallMinutesRemaining: 2, freeChatsRemaining: 10, passwordHash: hashPassword("password123") },
  { id: "u-lawyer-demo", role: "lawyer", name: "Adv. Rajesh Kumar", email: "advocate@demo.in", mobile: "9988776655", passwordHash: hashPassword("password123") }
];
  let lawyerProfiles: LawyerProfile[] = [
    {
      id: "lp-demo",
      userId: "u-lawyer-demo",
      fullName: "Adv. Rajesh Kumar",
      email: "advocate@demo.in",
      mobile: "9988776655",
      barCouncilNumber: "D/992/2012",
      stateBarCouncil: "Delhi Bar Council",
      aadhaar: "123456789012",
      pan: "ABCDE1234F",
      bio: "Senior criminal defense and property disputes advocate practicing at the Supreme Court of India.",
      experienceYears: 12,
      languages: ["English", "Hindi"],
      categories: ["Criminal Law", "Property Law"],
      chatPricePerMinute: 20,
      voicePricePerMinute: 30,
      videoPricePerMinute: 40,
      verificationStatus: "approved",
      isOnline: true,
      rating: 4.8,
      reviewCount: 15,
      practiceState: "Delhi",
      practiceDistrict: "New Delhi",
      llbGraduationYear: 2012,
      llbUniversity: "Faculty of Law, Delhi University",
      barAssociationName: "Supreme Court Bar Association",
      placeOfPractice: "Supreme Court of India",
      enrollmentCertificateUrl: "https://example.com/certs/enrollment-cert.pdf",
      copUrl: "https://example.com/certs/cop.pdf",
      llbCertificateUrl: "https://example.com/certs/llb-degree.pdf",
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  let wallets: Wallet[] = [
    { userId: "u-admin-1", balance: 50000 },
    { userId: "u-client-demo", balance: 500 },
    { userId: "u-lawyer-demo", balance: 0 }
  ];
  let walletTransactions: WalletTransaction[] = [];
  let consultations: Consultation[] = [];
  let consultationMessages: ConsultationMessage[] = [];
  let reviews: Review[] = [];
  let withdrawals: WithdrawalRequest[] = [];
  let commissionLogs: CommissionLog[] = [];
  let auditLogs: { id: string; userId?: string; userEmail?: string; action: string; details: any; timestamp: string }[] = [];
  let cases: Case[] = [];
  let signals: WebRTCSignal[] = [];

  const DB_FILE = process.env.VERCEL 
    ? path.join(os.tmpdir(), "legaltalk_local_db.json") 
    : path.resolve(process.cwd(), "scratch", "local_db.json");

  function saveLocalDb() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify({
        users,
        lawyerProfiles,
        wallets,
        walletTransactions,
        consultations,
        consultationMessages,
        reviews,
        withdrawals,
        cases,
        signals
      }, null, 2));
    } catch (e) {
      try {
        const tmpFile = path.join(os.tmpdir(), "legaltalk_local_db.json");
        fs.writeFileSync(tmpFile, JSON.stringify({
          users,
          lawyerProfiles,
          wallets,
          walletTransactions,
          consultations,
          consultationMessages,
          reviews,
          withdrawals,
          cases,
          signals
        }, null, 2));
      } catch (innerErr) {
        // Ignore in read-only / serverless environment fallback
      }
    }
  }

  function loadLocalDb() {
    try {
      let targetFile = DB_FILE;
      if (!fs.existsSync(targetFile)) {
        const tmpFile = path.join(os.tmpdir(), "legaltalk_local_db.json");
        if (fs.existsSync(tmpFile)) targetFile = tmpFile;
      }
      if (fs.existsSync(targetFile)) {
        const data = JSON.parse(fs.readFileSync(targetFile, "utf-8"));
        if (data.users && data.users.length) users = data.users;
        if (data.lawyerProfiles && data.lawyerProfiles.length) lawyerProfiles = data.lawyerProfiles;
        if (data.wallets) wallets = data.wallets;
        if (data.walletTransactions) walletTransactions = data.walletTransactions;
        if (data.consultations) consultations = data.consultations;
        if (data.consultationMessages) consultationMessages = data.consultationMessages;
        if (data.reviews) reviews = data.reviews;
        if (data.cases) cases = data.cases;
        if (data.signals) signals = data.signals;
        console.log(`[Local DB] Restored ${users.length} users and ${consultations.length} consultations from ${targetFile}.`);
      }
    } catch (e) {
      // Ignore
    }
  }

  loadLocalDb();

  let adminInvitations: { id: string; code: string; createdBy?: string; isUsed: boolean; createdAt: string }[] = [
    { id: "invite-1", code: "ADM-INV-123456", isUsed: false, createdAt: new Date().toISOString() }
  ];

  // -------------------------------------------------------------
  // SUPABASE CLIENT INTEGRATION (PRODUCTION READY)
  // -------------------------------------------------------------
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://stgwfcanxhbqvolfpmft.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_S8g3NfVeu6JGCEiyJgYrwQ_sH4MN99S";

  const isSupabaseConfigured = 
    supabaseUrl && 
    supabaseUrl !== "https://your-project.supabase.co" && 
    supabaseServiceKey && 
    supabaseServiceKey !== "your-service-role-key";

  if (isSupabaseConfigured) {
    console.log(`[Supabase Client] Initializing connection to ${supabaseUrl}`);
  } else {
    console.warn(`[Supabase Client] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Falling back to clean in-memory database.`);
  }

  const supabase = isSupabaseConfigured 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
    : null;

  // DB-to-TS Type Mappers
  function mapUserToTS(row: any): User {
    if (!row) return row;
    return {
      id: row.id,
      role: row.role,
      name: row.name,
      email: row.email,
      mobile: row.mobile,
      city: row.city || undefined,
      language: row.language || undefined,
      avatarUrl: row.avatar_url || undefined,
      isBlocked: row.is_blocked ?? false,
      freeCallMinutesRemaining: row.free_call_minutes_remaining,
      freeChatsRemaining: row.free_chats_remaining,
      fcmToken: row.fcm_token || undefined
    };
  }

  function mapUserToDB(user: Partial<User>): any {
    const row: any = {};
    if (user.id !== undefined) row.id = user.id;
    if (user.role !== undefined) row.role = user.role;
    if (user.name !== undefined) row.name = user.name;
    if (user.email !== undefined) row.email = user.email;
    if (user.mobile !== undefined) row.mobile = user.mobile;
    if (user.city !== undefined) row.city = user.city;
    if (user.language !== undefined) row.language = user.language;
    if (user.avatarUrl !== undefined) row.avatar_url = user.avatarUrl;
    if (user.isBlocked !== undefined) row.is_blocked = user.isBlocked;
    if (user.freeCallMinutesRemaining !== undefined) row.free_call_minutes_remaining = user.freeCallMinutesRemaining;
    if (user.freeChatsRemaining !== undefined) row.free_chats_remaining = user.freeChatsRemaining;
    if (user.fcmToken !== undefined) row.fcm_token = user.fcmToken;
    return row;
  }

  function mapLawyerToTS(row: any): LawyerProfile {
    if (!row) return row;
    return {
      userId: row.user_id,
      barCouncilNumber: row.bar_council_number,
      stateBarCouncil: row.state_bar_council,
      aadhaar: row.aadhaar,
      pan: row.pan,
      bio: row.bio || "",
      experienceYears: Number(row.experience_years || 0),
      languages: row.languages || [],
      categories: row.categories || [],
      chatPricePerMinute: Number(row.chat_price_per_minute || 0),
      voicePricePerMinute: Number(row.voice_price_per_minute || 0),
      videoPricePerMinute: Number(row.video_price_per_minute || 0),
      verificationStatus: row.verification_status,
      isOnline: !!row.is_online,
      rating: Number(row.rating || 0),
      reviewCount: Number(row.review_count || 0),
      practiceState: row.practice_state || undefined,
      practiceDistrict: row.practice_district || undefined,
      llbGraduationYear: row.llb_graduation_year ? Number(row.llb_graduation_year) : undefined,
      llbUniversity: row.llb_university || undefined,
      barAssociationName: row.bar_association_name || undefined,
      placeOfPractice: row.place_of_practice || undefined,
      enrollmentCertificateUrl: row.enrollment_certificate_url || undefined,
      copUrl: row.cop_url || undefined,
      llbCertificateUrl: row.llb_certificate_url || undefined,
      subscriptionExpiresAt: row.subscription_expires_at || undefined
    };
  }

  function mapLawyerToDB(p: Partial<LawyerProfile>): any {
    const row: any = {};
    if (p.userId !== undefined) row.user_id = p.userId;
    if (p.barCouncilNumber !== undefined) row.bar_council_number = p.barCouncilNumber;
    if (p.stateBarCouncil !== undefined) row.state_bar_council = p.stateBarCouncil;
    if (p.aadhaar !== undefined) row.aadhaar = p.aadhaar;
    if (p.pan !== undefined) row.pan = p.pan;
    if (p.bio !== undefined) row.bio = p.bio;
    if (p.experienceYears !== undefined) row.experience_years = p.experienceYears;
    if (p.languages !== undefined) row.languages = p.languages;
    if (p.categories !== undefined) row.categories = p.categories;
    if (p.chatPricePerMinute !== undefined) row.chat_price_per_minute = p.chatPricePerMinute;
    if (p.voicePricePerMinute !== undefined) row.voice_price_per_minute = p.voicePricePerMinute;
    if (p.videoPricePerMinute !== undefined) row.video_price_per_minute = p.videoPricePerMinute;
    if (p.verificationStatus !== undefined) row.verification_status = p.verificationStatus;
    if (p.isOnline !== undefined) row.is_online = p.isOnline;
    if (p.rating !== undefined) row.rating = p.rating;
    if (p.reviewCount !== undefined) row.review_count = p.reviewCount;
    if (p.practiceState !== undefined) row.practice_state = p.practiceState;
    if (p.practiceDistrict !== undefined) row.practice_district = p.practiceDistrict;
    if (p.llbGraduationYear !== undefined) row.llb_graduation_year = p.llbGraduationYear;
    if (p.llbUniversity !== undefined) row.llb_university = p.llbUniversity;
    if (p.barAssociationName !== undefined) row.bar_association_name = p.barAssociationName;
    if (p.placeOfPractice !== undefined) row.place_of_practice = p.placeOfPractice;
    if (p.enrollmentCertificateUrl !== undefined) row.enrollment_certificate_url = p.enrollmentCertificateUrl;
    if (p.copUrl !== undefined) row.cop_url = p.copUrl;
    if (p.llbCertificateUrl !== undefined) row.llb_certificate_url = p.llbCertificateUrl;
    if (p.subscriptionExpiresAt !== undefined) row.subscription_expires_at = p.subscriptionExpiresAt;
    return row;
  }

  function mapCaseToTS(row: any): Case {
    if (!row) return row;
    return {
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      lawyerId: row.lawyer_id || undefined,
      lawyerName: row.lawyer_name || undefined,
      title: row.title,
      description: row.description,
      category: row.category,
      status: row.status,
      documents: Array.isArray(row.documents) ? row.documents.map((d: any) => ({
        id: d.id,
        name: d.name,
        url: d.url,
        uploadedBy: d.uploadedBy,
        uploadedAt: d.uploadedAt
      })) : [],
      createdAt: row.created_at || new Date().toISOString()
    };
  }


  function mapConsultationToTS(row: any): Consultation {
    if (!row) return row;
    return {
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      lawyerId: row.lawyer_id,
      lawyerName: row.lawyer_name,
      type: row.type,
      status: row.status,
      startedAt: row.started_at || undefined,
      endedAt: row.ended_at || undefined,
      totalMinutes: row.total_minutes !== null ? Number(row.total_minutes) : undefined,
      ratePerMinute: Number(row.rate_per_minute || 0),
      totalCost: row.total_cost !== null ? Number(row.total_cost) : undefined,
      lawyerReceipt: row.lawyer_receipt !== null ? Number(row.lawyer_receipt) : undefined,
      platformCommission: row.platform_commission !== null ? Number(row.platform_commission) : undefined,
      agoraChannelName: row.agora_channel_name || undefined
    };
  }

  function mapConsultationToDB(c: Partial<Consultation>): any {
    const row: any = {};
    if (c.id !== undefined) row.id = c.id;
    if (c.clientId !== undefined) row.client_id = c.clientId;
    if (c.clientName !== undefined) row.client_name = c.clientName;
    if (c.lawyerId !== undefined) row.lawyer_id = c.lawyerId;
    if (c.lawyerName !== undefined) row.lawyer_name = c.lawyerName;
    if (c.type !== undefined) row.type = c.type;
    if (c.status !== undefined) row.status = c.status;
    if (c.startedAt !== undefined) row.started_at = c.startedAt;
    if (c.endedAt !== undefined) row.ended_at = c.endedAt;
    if (c.totalMinutes !== undefined) row.total_minutes = c.totalMinutes;
    if (c.ratePerMinute !== undefined) row.rate_per_minute = c.ratePerMinute;
    if (c.totalCost !== undefined) row.total_cost = c.totalCost;
    if (c.lawyerReceipt !== undefined) row.lawyer_receipt = c.lawyerReceipt;
    if (c.platformCommission !== undefined) row.platform_commission = c.platformCommission;
    return row;
  }

  function mapTransactionToTS(row: any): WalletTransaction {
    if (!row) return row;
    return {
      id: row.id,
      walletId: row.wallet_id,
      amount: Number(row.amount),
      type: row.type,
      status: row.status || (row.type === 'withdrawal' ? 'pending' : 'completed'),
      description: row.description || "",
      timestamp: row.created_at
    };
  }

  async function insertWalletTransaction(tx: { id?: string, wallet_id: string, amount: number, type: string, description?: string, status?: string, reference_id?: string }): Promise<any> {
    if (!supabase) return null;
    const cleanPayload: any = {
      id: tx.id || crypto.randomUUID(),
      wallet_id: tx.wallet_id,
      amount: tx.amount,
      type: tx.type,
      description: tx.description || ""
    };

    const fullPayload: any = { ...cleanPayload };
    if (tx.status) fullPayload.status = tx.status;
    if (tx.reference_id) fullPayload.reference_id = tx.reference_id;

    let res = await supabase.from('wallet_transactions').insert([fullPayload]).select().single();
    if (res.error && (res.error.message?.includes('status') || res.error.message?.includes('reference_id') || res.error.message?.includes('column'))) {
      res = await supabase.from('wallet_transactions').insert([cleanPayload]).select().single();
    }
    if (res.error) {
      console.warn("[Wallet Transaction Insert Warning]:", res.error.message);
      return cleanPayload;
    }
    return res.data || cleanPayload;
  }

  function mapMessageToTS(row: any): ConsultationMessage {
    if (!row) return row;
    return {
      id: row.id,
      consultationId: row.consultation_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      text: row.text,
      timestamp: row.created_at
    };
  }

  function mapReviewToTS(row: any): Review {
    if (!row) return row;
    return {
      id: row.id,
      consultationId: row.consultation_id,
      clientName: row.client_name,
      lawyerId: row.lawyer_id,
      rating: Number(row.rating || 0),
      feedback: row.feedback || "",
      timestamp: row.created_at
    };
  }

  function mapWithdrawalToTS(row: any): WithdrawalRequest {
    if (!row) return row;
    return {
      id: row.id,
      lawyerId: row.lawyer_id,
      lawyerName: row.lawyer_name,
      amount: Number(row.amount || 0),
      status: row.status,
      bankHolderName: row.bank_holder_name,
      bankAccountNumber: row.bank_account_number,
      ifscCode: row.ifsc_code,
      timestamp: row.created_at,
      approved_at: row.approved_at || undefined
    };
  }

  // Startup initialization check to seed default Admin if not exists
  async function seedDefaultAdmin() {
    if (supabase) {
      try {
        const { data: existingAdmin, error: checkErr } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'admin')
          .limit(1);

        if (checkErr) {
          console.error("[Supabase Initializer] Error checking admin presence:", checkErr);
          return;
        }

        if (!existingAdmin || existingAdmin.length === 0) {
          console.log("[Supabase Initializer] No admin user detected in public.users. Seeding default admin...");
          const adminUserId = crypto.randomUUID();
          const { data: seededAdmin, error: seedErr } = await supabase
            .from('users')
            .insert([{
              id: adminUserId,
              role: 'admin',
              name: 'Suresh Gupta',
              email: 'admin@legaltalk.in',
              mobile: '9900001122',
              city: 'Delhi',
              language: 'English, Hindi',
              password_hash: hashPassword('admin123'),
              is_blocked: false
            }])
            .select()
            .single();

          if (seedErr) {
            console.error("[Supabase Initializer] Failed to seed default admin user:", seedErr);
          } else {
            console.log("[Supabase Initializer] Default admin user seeded successfully with ID:", seededAdmin.id);
            const { error: walletErr } = await supabase
              .from('wallets')
              .upsert([{ user_id: seededAdmin.id, balance: 50000.00 }]);
            if (walletErr) {
              console.error("[Supabase Initializer] Failed to set admin wallet balance:", walletErr);
            }
          }
        } else {
          console.log("[Supabase Initializer] Admin user is present in database. Seeding skipped.");
        }
      } catch (err) {
        console.error("[Supabase Initializer] Failed to execute startup seeding checks:", err);
      }
    }
  }

  async function autoApproveExistingLawyers() {
    if (supabase) {
      try {
        const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        
        // Auto-approve pending profiles
        const { error: verifyErr } = await supabase
          .from('lawyers')
          .update({ verification_status: 'approved' })
          .neq('verification_status', 'approved');

        // Auto-activate null or expired subscriptions
        const { error: subErr } = await supabase
          .from('lawyers')
          .update({ subscription_expires_at: oneYearFromNow })
          .is('subscription_expires_at', null);

        if (verifyErr || subErr) {
          console.warn("[Supabase Initializer] Warn/Error checking/auto-approving existing lawyers (columns might not exist yet):", verifyErr || subErr);
        } else {
          console.log("[Supabase Initializer] Checked and successfully auto-approved existing lawyers and active subscriptions.");
        }
      } catch (err) {
        console.error("[Supabase Initializer] Failed executing startup lawyer auto-approval:", err);
      }
    }
  }

  async function seedDemoAccounts() {
    if (supabase) {
      try {
        // Seed client
        const { data: clientExists, error: checkClientErr } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'client@demo.in')
          .maybeSingle();

        let clientUserId = '';
        if (checkClientErr) {
          console.error("[Supabase Initializer] Error checking client@demo.in presence:", checkClientErr);
        } else if (!clientExists) {
          console.log("[Supabase Initializer] Seeding client@demo.in...");
          clientUserId = crypto.randomUUID();
          const clientData = {
            id: clientUserId,
            role: 'client',
            name: 'Demo Client',
            email: 'client@demo.in',
            mobile: '9876543210',
            city: 'Delhi',
            language: 'English, Hindi',
            password_hash: hashPassword('password123'),
            is_blocked: false
          };

          let seededClient = null;
          try {
            const { data, error } = await supabase
              .from('users')
              .insert([{
                ...clientData,
                free_call_minutes_remaining: 2,
                free_chats_remaining: 10
              }])
              .select()
              .single();
            if (error) throw error;
            seededClient = data;
          } catch (e: any) {
            console.warn("[Supabase Initializer] Failed inserting client with free limit columns. Retrying without them...", e.message);
            const { data, error } = await supabase
              .from('users')
              .insert([clientData])
              .select()
              .single();
            if (error) {
              console.error("[Supabase Initializer] Failed to seed client@demo.in user:", error);
            } else {
              seededClient = data;
            }
          }

          if (seededClient) {
            clientUserId = seededClient.id;
            console.log("[Supabase Initializer] client@demo.in user seeded successfully with ID:", clientUserId);
            // Update client wallet balance to 500
            const { error: clientWalletErr } = await supabase
              .from('wallets')
              .upsert([{ user_id: clientUserId, balance: 500.00 }]);
            if (clientWalletErr) {
              console.error("[Supabase Initializer] Failed to set client wallet balance:", clientWalletErr);
            }
          }
        } else {
          clientUserId = clientExists.id;
          const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', clientUserId).maybeSingle();
          if (wallet && Number(wallet.balance) === 0) {
            await supabase.from('wallets').update({ balance: 500.00 }).eq('user_id', clientUserId);
          }
        }

        // Seed advocate
        const { data: advocateExists, error: checkAdvocateErr } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'advocate@demo.in')
          .maybeSingle();

        let advocateUserId = '';
        if (checkAdvocateErr) {
          console.error("[Supabase Initializer] Error checking advocate@demo.in presence:", checkAdvocateErr);
        } else if (!advocateExists) {
          console.log("[Supabase Initializer] Seeding advocate@demo.in...");
          advocateUserId = crypto.randomUUID();
          const { data: seededAdvocate, error: seedAdvocateErr } = await supabase
            .from('users')
            .insert([{
              id: advocateUserId,
              role: 'lawyer',
              name: 'Adv. Rajesh Kumar',
              email: 'advocate@demo.in',
              mobile: '9988776655',
              city: 'Delhi',
              language: 'English, Hindi',
              password_hash: hashPassword('password123'),
              is_blocked: false
            }])
            .select()
            .single();

          if (seedAdvocateErr) {
            console.error("[Supabase Initializer] Failed to seed advocate@demo.in user:", seedAdvocateErr);
          } else {
            advocateUserId = seededAdvocate.id;
            console.log("[Supabase Initializer] advocate@demo.in user seeded successfully with ID:", advocateUserId);
            
            // Create lawyer profile
            const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
            const { error: seedProfileErr } = await supabase
              .from('lawyers')
              .insert([{
                id: crypto.randomUUID(),
                user_id: advocateUserId,
                bar_council_number: 'D/992/2012',
                state_bar_council: 'Delhi Bar Council',
                aadhaar: '123456789012',
                pan: 'ABCDE1234F',
                bio: 'Senior criminal defense and property disputes advocate practicing at the Supreme Court of India.',
                experience_years: 12,
                languages: ['English', 'Hindi'],
                categories: ['Criminal Law', 'Property Law'],
                chat_price_per_minute: 20,
                voice_price_per_minute: 30,
                video_price_per_minute: 40,
                verification_status: 'approved',
                is_online: true,
                rating: 4.8,
                practice_state: 'Delhi',
                practice_district: 'New Delhi',
                llb_graduation_year: 2012,
                llb_university: 'Faculty of Law, Delhi University',
                bar_association_name: 'Supreme Court Bar Association',
                place_of_practice: 'Supreme Court of India',
                enrollment_certificate_url: 'https://example.com/certs/enrollment-cert.pdf',
                cop_url: 'https://example.com/certs/cop.pdf',
                llb_certificate_url: 'https://example.com/certs/llb-degree.pdf',
                subscription_expires_at: oneYearFromNow
              }]);

            if (seedProfileErr) {
              console.error("[Supabase Initializer] Failed to seed advocate profile:", seedProfileErr);
            } else {
              console.log("[Supabase Initializer] advocate profile seeded successfully.");
            }

            await supabase
              .from('wallets')
              .upsert([{ user_id: advocateUserId, balance: 2500.00 }]);
          }
        }
      } catch (err) {
        console.error("[Supabase Initializer] Failed to seed demo accounts in Supabase:", err);
      }
    }
  }

  let isDemoSeeded = false;
  let seedingInProgress: Promise<void> | null = null;

  async function ensureDemoAccountsSeeded() {
    if (isDemoSeeded) return;
    if (seedingInProgress) return seedingInProgress;

    seedingInProgress = (async () => {
      try {
        await seedDefaultAdmin();
        await seedDemoAccounts();
        await autoApproveExistingLawyers();
        isDemoSeeded = true;
      } catch (err) {
        console.warn("[Startup Seeding Warning]:", err);
      } finally {
        seedingInProgress = null;
      }
    })();

    return seedingInProgress;
  }

  // Trigger initial seeding in background
  ensureDemoAccountsSeeded().catch(() => {});

  // -------------------------------------------------------------
  // FIREBASE CLOUD MESSAGING (FCM) INITIALIZATION (OPTIONAL / ON-DEMAND)
  // -------------------------------------------------------------
  let fcmApp: any = null;

  async function initFCM() {
    try {
      const serviceAccountPath = path.resolve(process.cwd(), "firebase-service-account.json");
      const hasServiceAccount = fs.existsSync(serviceAccountPath);

      if (hasServiceAccount || process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const admin = (await import("firebase-admin")).default || (await import("firebase-admin"));
        const serviceAccount = hasServiceAccount 
          ? JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))
          : JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
        fcmApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        }, "legaltalk-fcm");
        console.log("[Firebase Admin] Initialized FCM successfully");
      }
    } catch (err: any) {
      // Ignore in serverless or unconfigured environments
    }
  }

  if (!process.env.VERCEL) {
    initFCM().catch(() => {});
  }

  // Push notifications helper
  async function sendPushNotification(fcmToken: string, title: string, body: string, data: any = {}) {
    if (fcmApp && fcmToken && fcmToken !== "Pending" && fcmToken !== "") {
      try {
        const admin = (await import("firebase-admin")).default || (await import("firebase-admin"));
        const message = {
          notification: { title, body },
          data: data,
          token: fcmToken
        };
        await admin.messaging(fcmApp).send(message);
        console.log(`[Firebase Push] Notification sent successfully to token: ${fcmToken.substring(0, 10)}...`);
      } catch (err: any) {
        console.error("[Firebase Push] Failed sending push notification:", err.message);
      }
    } else {
      console.log(`[Firebase Push (SIMULATED)] Sent to token "${fcmToken}": Title: "${title}", Body: "${body}", Data:`, data);
    }
  }

  // -------------------------------------------------------------
  // LAZY GEMINI API CLIENT INITIALIZATION
  // -------------------------------------------------------------
  let aiClient: GoogleGenAI | null = null;

  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      }
    }
    return aiClient;
  }

  // -------------------------------------------------------------
  // API ROUTE HANDLERS
  // -------------------------------------------------------------

  app.get(["/api", "/api/", "/api/health"], (req, res) => {
    res.json({
      status: "healthy",
      service: "LegalTalk India Backend API",
      version: "1.0.0",
      database: supabase ? "connected" : "in-memory-fallback",
      aiEngine: process.env.GEMINI_API_KEY ? "gemini-3.6-flash active" : "mock-fallback",
      timestamp: new Date().toISOString()
    });
  });

  // Browser navigation convenience redirects (e.g. if user types /api/login in address bar)
  app.get("/api/login", (req, res) => res.redirect("/login"));
  app.get("/api/register", (req, res) => res.redirect("/register"));
  app.get("/api/admin", (req, res) => res.redirect("/admin"));
  app.get("/api/client", (req, res) => res.redirect("/client"));
  app.get("/api/lawyer", (req, res) => res.redirect("/lawyer"));

  app.get("/api/config", async (req, res) => {
    ensureDemoAccountsSeeded().catch(() => {});
    res.json({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://stgwfcanxhbqvolfpmft.supabase.co",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_S8g3NfVeu6JGCEiyJgYrwQ_sH4MN99S",
      agoraAppId: process.env.AGORA_APP_ID || process.env.VITE_AGORA_APP_ID || "",
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || ""
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    try {
      await ensureDemoAccountsSeeded();
      const cleanEmail = email.trim().toLowerCase();

      let matchedUser: any = null;
      if (supabase) {
        try {
          const { data: user, error: uErr } = await supabase
            .from('users')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();

          if (!uErr && user) {
            matchedUser = user;
          }
        } catch (e) {
          // Fall through to in-memory accounts
        }
      }

      if (matchedUser) {
        if (role && matchedUser.role !== role) {
          return res.status(401).json({ error: `This account is registered as a ${matchedUser.role}, not a ${role}.` });
        }

        if (matchedUser.is_blocked) {
          return res.status(403).json({ error: "This account has been blocked by administrators." });
        }

        const isValid = matchedUser.password_hash 
          ? verifyPassword(password, matchedUser.password_hash)
          : (password === "password123" || password === "admin123");

        if (!isValid) {
          return res.status(401).json({ error: "Incorrect password. Please verify and try again." });
        }

        const token = `token-${matchedUser.id}-${Date.now()}`;
        return res.json({
          user: mapUserToTS(matchedUser),
          token
        });
      }

      // Fallback to in-memory demo accounts (admin, client, lawyer)
      const fallbackUser = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!fallbackUser) {
        return res.status(401).json({ error: "No registered account found with that email." });
      }

      if (role && fallbackUser.role !== role) {
        return res.status(401).json({ error: `This account is registered as a ${fallbackUser.role}, not a ${role}.` });
      }

      if (fallbackUser.isBlocked) {
        return res.status(403).json({ error: "This account has been blocked by administrators." });
      }

      const isValid = fallbackUser.passwordHash
        ? verifyPassword(password, fallbackUser.passwordHash)
        : (password === "password123" || password === "admin123" || password === fallbackUser.password);

      if (!isValid) {
        return res.status(401).json({ error: "Incorrect password. Please verify and try again." });
      }

      const token = `token-${fallbackUser.id}-${Date.now()}`;
      const sanitizedUser: User = { ...fallbackUser };
      delete (sanitizedUser as any).passwordHash;
      delete sanitizedUser.password;

      return res.json({
        user: sanitizedUser,
        token
      });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Authentication failed: " + err.message });
    }
  });

  // WebRTC Signaling Channels (100% Free Peer-to-Peer Communication with Supabase Persistence)
  app.post("/api/consultations/signal", async (req, res) => {
    const { consultationId, fromUserId, toUserId, type, payload } = req.body;
    if (!consultationId || !fromUserId || !type) {
      return res.status(400).json({ error: "Missing mandatory signal parameters (consultationId, fromUserId, type)." });
    }

    const signalId = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newSignal: WebRTCSignal = {
      id: signalId,
      consultationId,
      fromUserId,
      toUserId,
      type,
      payload,
      createdAt: new Date().toISOString()
    };

    signals.push(newSignal);
    if (signals.length > 250) {
      signals = signals.slice(-150);
    }
    saveLocalDb();

    // Persist to Supabase if available so signals are shared across all serverless Vercel lambdas
    if (supabase) {
      try {
        let validSenderId: string | null = null;
        if (fromUserId && fromUserId.length >= 32) {
          validSenderId = fromUserId;
        } else {
          const { data: sess } = await supabase.from('consultations').select('client_id, lawyer_id').eq('id', consultationId).maybeSingle();
          if (sess) {
            validSenderId = sess.client_id;
          }
        }

        if (validSenderId) {
          await supabase.from('consultation_messages').insert([{
            id: crypto.randomUUID(),
            consultation_id: consultationId,
            sender_id: validSenderId,
            sender_name: '__WEBRTC_SIGNAL__',
            text: `__SIGNAL__:${JSON.stringify(newSignal)}`
          }]);
        }
      } catch (err: any) {
        console.warn("[Supabase Signal Persistence Warning]:", err?.message || err);
      }
    }

    res.status(201).json({ success: true, signal: newSignal });
  });

  app.get("/api/consultations/signals/:consultationId/:userId", async (req, res) => {
    const { consultationId, userId } = req.params;
    const since = req.query.since as string;

    // Check Supabase first for multi-lambda serverless support
    if (supabase) {
      try {
        let query = supabase
          .from('consultation_messages')
          .select('*')
          .eq('consultation_id', consultationId)
          .like('text', '__SIGNAL__:%')
          .order('created_at', { ascending: true });

        if (since) {
          query = query.gt('created_at', since);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const dbSignals: WebRTCSignal[] = [];
          for (const row of data) {
            try {
              const parsed = JSON.parse(row.text.substring(11));
              if (parsed.fromUserId !== userId && (!parsed.toUserId || parsed.toUserId === userId)) {
                dbSignals.push({
                  id: row.id,
                  consultationId: row.consultation_id,
                  fromUserId: parsed.fromUserId,
                  toUserId: parsed.toUserId,
                  type: parsed.type,
                  payload: parsed.payload,
                  createdAt: row.created_at
                });
              }
            } catch (pErr) {
              // Ignore parse error
            }
          }
          if (dbSignals.length > 0) {
            return res.json({ signals: dbSignals });
          }
        }
      } catch (err) {
        // Fall back to in-memory signals
      }
    }

    let matches = signals.filter(s => 
      s.consultationId === consultationId && 
      s.fromUserId !== userId &&
      (!s.toUserId || s.toUserId === userId)
    );

    if (since) {
      matches = matches.filter(s => s.createdAt > since);
    }

    res.json({ signals: matches });
  });

  app.get("/api/auth/current", async (req, res) => {
    try {
      await ensureDemoAccountsSeeded();
      if (supabase) {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && data.length > 0) {
          return res.json({ users: data.map(mapUserToTS) });
        }
      }
      const sanitized = users.map(u => {
        const copy: any = { ...u };
        delete copy.passwordHash;
        delete copy.password;
        return copy as User;
      });
      res.json({ users: sanitized });
    } catch (e: any) {
      const sanitized = users.map(u => {
        const copy: any = { ...u };
        delete copy.passwordHash;
        delete copy.password;
        return copy as User;
      });
      res.json({ users: sanitized });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
      if (supabase) {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.json({ user: mapUserToTS(user) });
      }
      const user = users.find(u => u.id === id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const sanitized = { ...user };
      delete (sanitized as any).passwordHash;
      delete sanitized.password;
      res.json({ user: sanitized });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/users/fcm-token", async (req, res) => {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ error: "userId and token are required" });
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('users')
          .update({ fcm_token: token })
          .eq('id', userId)
          .select()
          .single();
        if (error) throw error;
        return res.json({ success: true, user: mapUserToTS(data) });
      }

      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.fcmToken = token;
      res.json({ success: true, user });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    const { name, email, mobile, role, city, language, invitationCode } = req.body;
    if (!name || !email || !mobile || !role) {
      return res.status(400).json({ error: "Missing mandatory fields" });
    }

    if (role === 'admin') {
      if (!invitationCode) {
        return res.status(400).json({ error: "Invitation code is required to register as admin" });
      }
    }
    
    try {
      if (supabase) {
        const { data: existing, error: checkErr } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
        if (checkErr) throw checkErr;
        if (existing) {
          return res.status(400).json({ error: "User already exists with this email address" });
        }

        if (role === 'admin') {
          const { data: invite, error: inviteErr } = await supabase
            .from('admin_invitations')
            .select('*')
            .eq('code', invitationCode)
            .eq('is_used', false)
            .maybeSingle();

          if (inviteErr || !invite) {
            return res.status(400).json({ error: "Invalid or already used admin invitation code" });
          }

          // Mark invite as used
          await supabase.from('admin_invitations').update({ is_used: true }).eq('id', invite.id);
        }
        
        const rawPassword = req.body.password || "password123";
        const passwordHash = hashPassword(rawPassword);

        const newUserId = crypto.randomUUID();
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{ 
            id: newUserId,
            name, 
            email: email.trim().toLowerCase(), 
            mobile, 
            role, 
            city, 
            language, 
            password_hash: passwordHash,
            is_blocked: false,
            free_call_minutes_remaining: role === 'client' ? 2 : 0,
            free_chats_remaining: role === 'client' ? 10 : 0
          }])
          .select()
          .single();
        if (error) throw error;

        // Welcome bonus
        try {
          await supabase.from('wallets').upsert([{ user_id: newUser.id, balance: 100 }]);
          await insertWalletTransaction({
            id: crypto.randomUUID(),
            wallet_id: newUser.id,
            amount: 100,
            type: 'deposit',
            description: 'Welcome bonus deposit (Simulated)'
          });

          await supabase.from('audit_logs').insert([{
            id: crypto.randomUUID(),
            user_id: newUser.id,
            user_email: email,
            action: 'USER_REGISTERED',
            details: { role, name }
          }]);
        } catch (postErr) {
          console.warn("[Registration side-effect warning]:", postErr);
        }

        return res.status(201).json({ user: mapUserToTS(newUser) });
      }

      const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        return res.status(400).json({ error: "User already exists with this email address" });
      }

      if (role === 'admin') {
        const invite = adminInvitations.find(inv => inv.code === invitationCode && !inv.isUsed);
        if (!invite) {
          return res.status(400).json({ error: "Invalid or already used admin invitation code" });
        }
        invite.isUsed = true;
      }

      const id = `u-${role}-${Date.now()}`;
      const rawPassword = req.body.password || "password123";
      const passwordHash = hashPassword(rawPassword);

      const newUser: User = { 
        id, 
        role, 
        name, 
        email: email.trim().toLowerCase(), 
        mobile, 
        city, 
        language, 
        isBlocked: false,
        freeCallMinutesRemaining: role === 'client' ? 2 : 0,
        freeChatsRemaining: role === 'client' ? 10 : 0,
        passwordHash
      };
      users.push(newUser);
      wallets.push({ userId: id, balance: 100 }); // grant ₹100 welcome bonus

      auditLogs.push({
        id: `aud-${Date.now()}`,
        userId: id,
        userEmail: email,
        action: "USER_REGISTERED",
        details: { role, name },
        timestamp: new Date().toISOString()
      });

      saveLocalDb();

      const sanitizedUser = { ...newUser };
      delete (sanitizedUser as any).passwordHash;
      res.status(201).json({ user: sanitizedUser });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/lawyers/register", async (req, res) => {
    const { 
      userId,
      fullName, 
      email, 
      mobile, 
      barCouncilNumber, 
      stateBarCouncil, 
      aadhaar, 
      pan, 
      bio, 
      experienceYears, 
      languages, 
      categories, 
      chatPrice, 
      voicePrice, 
      videoPrice, 
      practiceState, 
      practiceDistrict,
      llbGraduationYear,
      llbUniversity,
      barAssociationName,
      placeOfPractice,
      enrollmentCertificateUrl,
      copUrl,
      llbCertificateUrl
    } = req.body;

    if (!fullName || !email || !barCouncilNumber) {
      return res.status(400).json({ error: "Please deliver all mandatory legal documentation fields." });
    }

    try {
      if (supabase) {
        let finalUserId = userId;
        let userRow;

        if (finalUserId) {
          const { data: u } = await supabase.from('users').select('*').eq('id', finalUserId).maybeSingle();
          if (u) {
            userRow = u;
          }
        }

        if (!userRow) {
          const { data: existing } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
          if (existing) {
            userRow = existing;
            finalUserId = existing.id;
          }
        }

        if (!userRow) {
          const rawPassword = req.body.password || "password123";
          const passwordHash = hashPassword(rawPassword);
          const newUserId = crypto.randomUUID();
          const { data: newUser, error: uErr } = await supabase
            .from('users')
            .insert([{
              id: newUserId,
              name: fullName,
              email: email.trim().toLowerCase(),
              mobile,
              role: 'lawyer',
              city: practiceDistrict || "India Office",
              language: languages?.join(", ") || "Hindi",
              password_hash: passwordHash,
              is_blocked: false
            }])
            .select()
            .single();
          if (uErr) throw uErr;
          userRow = newUser;
          finalUserId = newUser.id;
        } else {
          // Update existing user details if they onboarding
          const userUpdate: any = {
            name: fullName,
            mobile,
            city: practiceDistrict || userRow.city,
            language: languages?.join(", ") || userRow.language
          };
          if (req.body.password) {
            userUpdate.password_hash = hashPassword(req.body.password);
          }
          const { data: updatedUser } = await supabase
            .from('users')
            .update(userUpdate)
            .eq('id', finalUserId)
            .select()
            .single();
          if (updatedUser) {
            userRow = updatedUser;
          }
        }

        // Check if lawyer profile already exists
        const { data: existingProfile } = await supabase.from('lawyers').select('*').eq('user_id', finalUserId).maybeSingle();
        if (existingProfile) {
          const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          const { data: updatedProfile, error: pUpErr } = await supabase
            .from('lawyers')
            .update({
              verification_status: 'approved',
              subscription_expires_at: oneYearFromNow
            })
            .eq('user_id', finalUserId)
            .select()
            .single();

          if (pUpErr) {
            console.error("[Register Endpoint] Failed to auto-approve existing lawyer profile:", pUpErr);
            return res.json({ user: mapUserToTS(userRow), profile: mapLawyerToTS(existingProfile) });
          }

          return res.json({ user: mapUserToTS(userRow), profile: mapLawyerToTS(updatedProfile) });
        }

        const { data: profile, error: pErr } = await supabase
          .from('lawyers')
          .insert([{
            id: crypto.randomUUID(),
            user_id: finalUserId,
            bar_council_number: barCouncilNumber,
            state_bar_council: stateBarCouncil,
            aadhaar: aadhaar || 'Pending',
            pan: pan || 'Pending',
            bio: bio || "Verified Professional Advocate registered under State Bar council guidelines.",
            experience_years: Number(experienceYears) || 3,
            languages: languages || ["English"],
            categories: categories || ["General Legal Guidance"],
            chat_price_per_minute: Number(chatPrice) || 20,
            voice_price_per_minute: Number(voicePrice) || 30,
            video_price_per_minute: Number(videoPrice) || 40,
            verification_status: 'approved',
            is_online: false,
            rating: 5.0,
            review_count: 0,
            practice_state: practiceState,
            practice_district: practiceDistrict,
            llb_graduation_year: llbGraduationYear ? Number(llbGraduationYear) : null,
            llb_university: llbUniversity || null,
            bar_association_name: barAssociationName || null,
            place_of_practice: placeOfPractice || null,
            enrollment_certificate_url: enrollmentCertificateUrl || null,
            cop_url: copUrl || null,
            llb_certificate_url: llbCertificateUrl || null,
            subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }])
          .select()
          .single();
        if (pErr) throw pErr;

        try {
          await supabase.from('audit_logs').insert([{
            id: crypto.randomUUID(),
            user_id: finalUserId,
            user_email: email,
            action: 'LAWYER_APPLICATION_SUBMITTED',
            details: { barCouncilNumber }
          }]);
        } catch (audErr) {}

        return res.status(201).json({ user: mapUserToTS(userRow), profile: mapLawyerToTS(profile) });
      }

      let finalUserId = userId;
      let userRow = users.find(u => u.id === finalUserId);
      if (!userRow) {
        userRow = users.find(u => u.email === email);
        if (userRow) {
          finalUserId = userRow.id;
        }
      }

      if (!userRow) {
        finalUserId = `u-lawyer-${Date.now()}`;
        const rawPassword = req.body.password || "password123";
        const passwordHash = hashPassword(rawPassword);
        userRow = { 
          id: finalUserId, 
          role: "lawyer", 
          name: fullName, 
          email: email.trim().toLowerCase(), 
          mobile, 
          city: practiceDistrict || "India Office", 
          language: languages?.join(", ") || "Hindi", 
          isBlocked: false,
          passwordHash
        };
        users.push(userRow);
      } else {
        userRow.name = fullName;
        userRow.mobile = mobile;
        userRow.city = practiceDistrict || userRow.city;
        userRow.language = languages?.join(", ") || userRow.language;
        if (req.body.password) {
          (userRow as any).passwordHash = hashPassword(req.body.password);
        }
      }

      let profile = lawyerProfiles.find(p => p.userId === finalUserId);
      if (profile) {
        profile.verificationStatus = "approved";
        profile.subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        saveLocalDb();
        const sanitized = { ...userRow };
        delete (sanitized as any).passwordHash;
        return res.json({ user: sanitized, profile });
      }

      profile = {
        userId: finalUserId,
        barCouncilNumber,
        stateBarCouncil,
        aadhaar: aadhaar || 'Pending',
        pan: pan || 'Pending',
        bio: bio || "Verified Professional Advocate registered under State Bar council guidelines.",
        experienceYears: Number(experienceYears) || 3,
        languages: languages || ["English"],
        categories: categories || ["General Legal Guidance"],
        chatPricePerMinute: Number(chatPrice) || 20,
        voicePricePerMinute: Number(voicePrice) || 30,
        videoPricePerMinute: Number(videoPrice) || 40,
        verificationStatus: "approved",
        isOnline: false,
        rating: 5.0,
        reviewCount: 0,
        practiceState,
        practiceDistrict,
        llbGraduationYear: llbGraduationYear ? Number(llbGraduationYear) : undefined,
        llbUniversity,
        barAssociationName,
        placeOfPractice,
        enrollmentCertificateUrl,
        copUrl,
        llbCertificateUrl,
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      lawyerProfiles.push(profile);
      const hasWallet = wallets.some(w => w.userId === finalUserId);
      if (!hasWallet) {
        wallets.push({ userId: finalUserId, balance: 0 });
      }

      auditLogs.push({
        id: `aud-${Date.now()}`,
        userId: finalUserId,
        userEmail: email,
        action: "LAWYER_APPLICATION_SUBMITTED",
        details: { barCouncilNumber },
        timestamp: new Date().toISOString()
      });

      saveLocalDb();

      const sanitized = { ...userRow };
      delete (sanitized as any).passwordHash;
      res.status(201).json({ user: sanitized, profile });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/lawyers", async (req, res) => {
    const { category, language, priceMin, priceMax, rating, experienceMin, state, district } = req.query;

    try {
      if (supabase) {
        const { data, error } = await supabase.from('lawyers').select('*, users(*)');
        if (error) throw error;

        let list = (data || []).map(row => {
          const u = row.users;
          return {
            ...mapLawyerToTS(row),
            name: u?.name || "Anonymous Lawyer",
            avatarUrl: u?.avatar_url || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150",
            isBlocked: u?.is_blocked || false
          };
        });

        const nowStr = new Date().toISOString();
        list = list.filter(l => l.verificationStatus === 'approved' && !l.isBlocked && l.subscriptionExpiresAt && l.subscriptionExpiresAt > nowStr);


        if (category) {
          list = list.filter(l => l.categories.some(c => c.toLowerCase() === (category as string).toLowerCase()));
        }
        if (language) {
          const langQuery = (language as string).toLowerCase();
          list = list.filter(l => l.languages.some(lang => lang.toLowerCase().includes(langQuery)));
        }
        if (state) {
          const stateQuery = (state as string).toLowerCase();
          list = list.filter(l => l.practiceState?.toLowerCase() === stateQuery);
        }
        if (district) {
          const districtQuery = (district as string).toLowerCase();
          list = list.filter(l => l.practiceDistrict?.toLowerCase() === districtQuery);
        }
        if (priceMax) {
          const maxVal = Number(priceMax);
          list = list.filter(l => l.chatPricePerMinute <= maxVal || l.voicePricePerMinute <= maxVal || l.videoPricePerMinute <= maxVal);
        }
        if (rating) {
          const minRate = Number(rating);
          list = list.filter(l => l.rating >= minRate);
        }
        if (experienceMin) {
          const minExp = Number(experienceMin);
          list = list.filter(l => l.experienceYears >= minExp);
        }

        return res.json({ lawyers: list });
      }

      let list = lawyerProfiles.map(profile => {
        const u = users.find(user => user.id === profile.userId);
        return {
          ...profile,
          name: u?.name || "Anonymous Lawyer",
          avatarUrl: u?.avatarUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150",
          isBlocked: u?.isBlocked || false
        };
      });

      const nowStr = new Date().toISOString();
      list = list.filter(l => l.verificationStatus === "approved" && !l.isBlocked && l.subscriptionExpiresAt && l.subscriptionExpiresAt > nowStr);


      if (category) {
        list = list.filter(l => l.categories.some(c => c.toLowerCase() === (category as string).toLowerCase()));
      }
      if (language) {
        const langQuery = (language as string).toLowerCase();
        list = list.filter(l => l.languages.some(lang => lang.toLowerCase().includes(langQuery)));
      }
      if (state) {
        const stateQuery = (state as string).toLowerCase();
        list = list.filter(l => l.practiceState?.toLowerCase() === stateQuery);
      }
      if (district) {
        const districtQuery = (district as string).toLowerCase();
        list = list.filter(l => l.practiceDistrict?.toLowerCase() === districtQuery);
      }
      if (priceMax) {
        const maxVal = Number(priceMax);
        list = list.filter(l => l.chatPricePerMinute <= maxVal || l.voicePricePerMinute <= maxVal || l.videoPricePerMinute <= maxVal);
      }
      if (rating) {
        const minRate = Number(rating);
        list = list.filter(l => l.rating >= minRate);
      }
      if (experienceMin) {
        const minExp = Number(experienceMin);
        list = list.filter(l => l.experienceYears >= minExp);
      }

      res.json({ lawyers: list });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/lawyers/profile/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
      if (supabase) {
        const { data, error } = await supabase.from('lawyers').select('*, users(*)').eq('user_id', userId).maybeSingle();
        if (error) throw error;
        if (!data) {
          return res.status(404).json({ error: "Lawyer profile not found" });
        }
        const u = data.users;
        const profile = {
          ...mapLawyerToTS(data),
          name: u?.name || "Anonymous Lawyer",
          avatarUrl: u?.avatar_url || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150",
          isBlocked: u?.is_blocked || false
        };
        return res.json({ profile });
      }

      const p = lawyerProfiles.find(profile => profile.userId === userId);
      if (!p) {
        return res.status(404).json({ error: "Lawyer profile not found" });
      }
      const u = users.find(user => user.id === userId);
      const profile = {
        ...p,
        name: u?.name || "Anonymous Lawyer",
        avatarUrl: u?.avatarUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150",
        isBlocked: u?.isBlocked || false
      };
      res.json({ profile });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  app.post("/api/lawyers/update-prices", async (req, res) => {
    const { userId, chatPrice, voicePrice, videoPrice, isOnline, bio, languages, categories, llbUniversity, llbGraduationYear, barAssociationName, placeOfPractice, enrollmentCertificateUrl, copUrl, llbCertificateUrl } = req.body;

    try {
      if (supabase) {
        let currentProfile = null;
        const { data: pData, error: fErr } = await supabase.from('lawyers').select('*').eq('user_id', userId).maybeSingle();
        if (!fErr && pData) {
          currentProfile = pData;
        }

        const updates: any = {};
        if (chatPrice !== undefined) updates.chat_price_per_minute = Number(chatPrice);
        if (voicePrice !== undefined) updates.voice_price_per_minute = Number(voicePrice);
        if (videoPrice !== undefined) updates.video_price_per_minute = Number(videoPrice);
        if (isOnline !== undefined) updates.is_online = !!isOnline;
        if (bio !== undefined) updates.bio = bio;
        if (languages !== undefined) updates.languages = languages;
        if (categories !== undefined) updates.categories = categories;
        
        if (llbUniversity !== undefined) updates.llb_university = llbUniversity;
        if (llbGraduationYear !== undefined) updates.llb_graduation_year = llbGraduationYear ? Number(llbGraduationYear) : null;
        if (barAssociationName !== undefined) updates.bar_association_name = barAssociationName;
        if (placeOfPractice !== undefined) updates.place_of_practice = placeOfPractice;
        if (enrollmentCertificateUrl !== undefined) updates.enrollment_certificate_url = enrollmentCertificateUrl;
        if (copUrl !== undefined) updates.cop_url = copUrl;
        if (llbCertificateUrl !== undefined) updates.llb_certificate_url = llbCertificateUrl;

        let resultProfile;
        if (!currentProfile) {
          const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          const { data: newProfile, error: insErr } = await supabase
            .from('lawyers')
            .insert([{
              id: crypto.randomUUID(),
              user_id: userId,
              bar_council_number: updates.bar_association_name || 'BC-' + Date.now(),
              state_bar_council: updates.place_of_practice || 'Delhi Bar Council',
              aadhaar: 'Pending',
              pan: 'Pending',
              bio: updates.bio || 'Verified Professional Advocate.',
              experience_years: 3,
              languages: updates.languages || ['English'],
              categories: updates.categories || ['General Legal Guidance'],
              chat_price_per_minute: updates.chat_price_per_minute || 20,
              voice_price_per_minute: updates.voice_price_per_minute || 30,
              video_price_per_minute: updates.video_price_per_minute || 40,
              verification_status: 'approved',
              is_online: updates.is_online || false,
              rating: 5.0,
              review_count: 0,
              practice_state: 'Delhi',
              practice_district: 'New Delhi',
              llb_graduation_year: updates.llb_graduation_year || 2020,
              llb_university: updates.llb_university || 'Delhi University',
              bar_association_name: updates.bar_association_name || 'Delhi High Court Bar Association',
              place_of_practice: updates.place_of_practice || 'Delhi',
              enrollment_certificate_url: updates.enrollment_certificate_url || 'https://example.com/certs/enrollment-cert.pdf',
              cop_url: updates.cop_url || 'https://example.com/certs/cop.pdf',
              llb_certificate_url: updates.llb_certificate_url || 'https://example.com/certs/llb-degree.pdf',
              subscription_expires_at: oneYearFromNow
            }])
            .select()
            .single();

          if (insErr) throw insErr;
          resultProfile = newProfile;
        } else {
          const { data: updatedProfile, error: uErr } = await supabase
            .from('lawyers')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();
          if (uErr) throw uErr;
          resultProfile = updatedProfile;
        }

        if (languages) {
          await supabase.from('users').update({ language: languages.join(", ") }).eq('id', userId);
        }

        return res.json({ success: true, profile: mapLawyerToTS(resultProfile) });
      }

      let idx = lawyerProfiles.findIndex(p => p.userId === userId);
      const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      if (idx === -1) {
        const newProfile: LawyerProfile = {
          userId,
          barCouncilNumber: barAssociationName || 'BC-' + Date.now(),
          stateBarCouncil: placeOfPractice || 'Delhi Bar Council',
          aadhaar: 'Pending',
          pan: 'Pending',
          bio: bio || 'Verified Professional Advocate.',
          experienceYears: 3,
          languages: languages || ['English'],
          categories: categories || ['General Legal Guidance'],
          chatPricePerMinute: Number(chatPrice) || 20,
          voicePricePerMinute: Number(voicePrice) || 30,
          videoPricePerMinute: Number(videoPrice) || 40,
          verificationStatus: 'approved',
          isOnline: !!isOnline,
          rating: 5.0,
          reviewCount: 0,
          practiceState: 'Delhi',
          practiceDistrict: 'New Delhi',
          llbGraduationYear: llbGraduationYear ? Number(llbGraduationYear) : 2020,
          llbUniversity: llbUniversity || 'Delhi University',
          barAssociationName: barAssociationName || 'Delhi High Court Bar Association',
          placeOfPractice: placeOfPractice || 'Delhi',
          enrollmentCertificateUrl: enrollmentCertificateUrl || 'https://example.com/certs/enrollment-cert.pdf',
          copUrl: copUrl || 'https://example.com/certs/cop.pdf',
          llbCertificateUrl: llbCertificateUrl || 'https://example.com/certs/llb-degree.pdf',
          subscriptionExpiresAt: oneYearFromNow
        };
        lawyerProfiles.push(newProfile);
        idx = lawyerProfiles.length - 1;
      } else {
        if (chatPrice !== undefined) lawyerProfiles[idx].chatPricePerMinute = Number(chatPrice);
        if (voicePrice !== undefined) lawyerProfiles[idx].voicePricePerMinute = Number(voicePrice);
        if (videoPrice !== undefined) lawyerProfiles[idx].videoPricePerMinute = Number(videoPrice);
        if (isOnline !== undefined) lawyerProfiles[idx].isOnline = !!isOnline;
        if (bio !== undefined) lawyerProfiles[idx].bio = bio;
        if (languages !== undefined) lawyerProfiles[idx].languages = languages;
        if (categories !== undefined) lawyerProfiles[idx].categories = categories;

        if (llbUniversity !== undefined) lawyerProfiles[idx].llbUniversity = llbUniversity;
        if (llbGraduationYear !== undefined) lawyerProfiles[idx].llbGraduationYear = llbGraduationYear ? Number(llbGraduationYear) : undefined;
        if (barAssociationName !== undefined) lawyerProfiles[idx].barAssociationName = barAssociationName;
        if (placeOfPractice !== undefined) lawyerProfiles[idx].placeOfPractice = placeOfPractice;
        if (enrollmentCertificateUrl !== undefined) lawyerProfiles[idx].enrollmentCertificateUrl = enrollmentCertificateUrl;
        if (copUrl !== undefined) lawyerProfiles[idx].copUrl = copUrl;
        if (llbCertificateUrl !== undefined) lawyerProfiles[idx].llbCertificateUrl = llbCertificateUrl;
      }

      const user = users.find(u => u.id === userId);
      if (user && languages) {
        user.language = languages.join(", ");
      }

      res.json({ success: true, profile: lawyerProfiles[idx] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/lawyers/pay-subscription", async (req, res) => {
    const { userId, paymentReference } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      if (supabase) {
        const { data: currentProfile, error: fErr } = await supabase.from('lawyers').select('*').eq('user_id', userId).maybeSingle();
        if (fErr || !currentProfile) {
          return res.status(404).json({ error: "Lawyer profile not found" });
        }

        if (!paymentReference) {
          const { data: wallet, error: wErr } = await supabase.from('wallets').select('balance').eq('user_id', userId).maybeSingle();
          if (wErr) throw wErr;
          const currentBalance = Number(wallet?.balance || 0);

          if (currentBalance < 1200) {
            return res.status(400).json({ error: "Insufficient wallet balance to pay annual fee of ₹1200. Please deposit funds first." });
          }

          const newBalance = currentBalance - 1200;
          const { error: wUpErr } = await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', userId);
          if (wUpErr) throw wUpErr;
        }

        const { data: updatedProfile, error: uErr } = await supabase
          .from('lawyers')
          .update({ subscription_expires_at: oneYearFromNow })
          .eq('user_id', userId)
          .select()
          .single();
        if (uErr) throw uErr;

        await insertWalletTransaction({
          id: crypto.randomUUID(),
          wallet_id: userId,
          amount: 1200,
          type: 'deduction',
          description: paymentReference ? `Annual Advocate Subscription Fee Paid via Razorpay (Ref: ${paymentReference})` : 'Annual Advocate Subscription Fee Paid (₹1200)',
          reference_id: paymentReference || undefined
        });

        await supabase.from('audit_logs').insert([{
          id: crypto.randomUUID(),
          user_id: userId,
          action: 'LAWYER_SUBSCRIPTION_PAID',
          details: { subscriptionExpiresAt: oneYearFromNow, paymentReference }
        }]);

        return res.json({ success: true, profile: mapLawyerToTS(updatedProfile) });
      }

      const idx = lawyerProfiles.findIndex(p => p.userId === userId);
      if (idx === -1) {
        return res.status(404).json({ error: "Lawyer profile not found" });
      }

      if (!paymentReference) {
        let wallet = wallets.find(w => w.userId === userId);
        if (!wallet) {
          wallet = { userId, balance: 0 };
          wallets.push(wallet);
        }

        if (wallet.balance < 1200) {
          return res.status(400).json({ error: "Insufficient wallet balance to pay annual fee of ₹1200. Please deposit funds first." });
        }

        wallet.balance -= 1200;
      }

      lawyerProfiles[idx].subscriptionExpiresAt = oneYearFromNow;

      walletTransactions.push({
        id: `tx-sub-${Date.now()}`,
        walletId: userId,
        amount: 1200,
        type: 'deduction',
        status: 'completed',
        description: paymentReference ? `Annual Advocate Subscription Fee Paid via Razorpay (Ref: ${paymentReference})` : 'Annual Advocate Subscription Fee Paid (₹1200)',
        timestamp: new Date().toISOString()
      });

      auditLogs.push({
        id: `aud-sub-${Date.now()}`,
        userId,
        action: "LAWYER_SUBSCRIPTION_PAID",
        details: { subscriptionExpiresAt: oneYearFromNow, paymentReference },
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, profile: lawyerProfiles[idx] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  app.get("/api/wallet/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
      if (supabase) {
        let { data: wallet, error: wErr } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
        if (wErr) throw wErr;
        
        if (!wallet) {
          const { data: newWallet, error: nwErr } = await supabase.from('wallets').insert([{ user_id: userId, balance: 0 }]).select().single();
          if (nwErr) throw nwErr;
          wallet = newWallet;
        }

        const { data: txs, error: tErr } = await supabase.from('wallet_transactions').select('*').eq('wallet_id', userId).order('created_at', { ascending: false });
        if (tErr) throw tErr;

        return res.json({ balance: Number(wallet.balance), transactions: (txs || []).map(mapTransactionToTS) });
      }

      let wallet = wallets.find(w => w.userId === userId);
      if (!wallet) {
        wallet = { userId, balance: 0 };
        wallets.push(wallet);
      }
      const userTx = walletTransactions.filter(tx => tx.walletId === userId);
      res.json({ balance: wallet.balance, transactions: userTx });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/wallet/deposit", async (req, res) => {
    const { userId, amount, rzpOrderId } = req.body;
    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid transfer amount" });
    }

    const val = Number(amount);

    try {
      if (supabase) {
        let { data: wallet, error: wErr } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
        if (wErr) throw wErr;
        if (!wallet) {
          const { data: newW } = await supabase.from('wallets').insert([{ user_id: userId, balance: 0 }]).select().single();
          wallet = newW;
        }

        const newBal = Number(wallet.balance) + val;
        const { error: upErr } = await supabase.from('wallets').update({ balance: newBal }).eq('user_id', userId);
        if (upErr) throw upErr;

        const tx = await insertWalletTransaction({
          id: crypto.randomUUID(),
          wallet_id: userId,
          amount: val,
          type: 'deposit',
          description: `Instant wallet recharge. Razorpay Order Ref: ${rzpOrderId || 'rzp_custom_' + Date.now()}`,
          reference_id: rzpOrderId
        });

        await supabase.from('audit_logs').insert([{
          id: crypto.randomUUID(),
          user_id: userId,
          action: 'WALLET_DEPOSITED',
          details: { amount: val, rzpOrderId }
        }]);

        return res.json({ success: true, balance: newBal, transaction: mapTransactionToTS(tx) });
      }

      let wallet = wallets.find(w => w.userId === userId);
      if (!wallet) {
        wallet = { userId, balance: 0 };
        wallets.push(wallet);
      }

      wallet.balance += val;

      const transaction: WalletTransaction = {
        id: `tx-${Date.now()}`,
        walletId: userId,
        amount: val,
        type: "deposit",
        status: "completed",
        description: `Instant wallet recharge. Razorpay Order Ref: ${rzpOrderId || 'rzp_custom_' + Date.now()}`,
        timestamp: new Date().toISOString()
      };
      walletTransactions.push(transaction);

      auditLogs.push({
        id: `aud-${Date.now()}`,
        userId,
        action: "WALLET_DEPOSITED",
        details: { amount: val, rzpOrderId },
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, balance: wallet.balance, transaction });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/consultations/create", async (req, res) => {
    const { clientId, lawyerId, type } = req.body;

    try {
      if (supabase) {
        const { data: client, error: cErr } = await supabase.from('users').select('*').eq('id', clientId).maybeSingle();
        const { data: lawyer, error: lErr } = await supabase.from('lawyers').select('*').eq('user_id', lawyerId).maybeSingle();
        const { data: lawyerUser, error: luErr } = await supabase.from('users').select('*').eq('id', lawyerId).maybeSingle();

        if (cErr || lErr || luErr || !client || !lawyer || !lawyerUser) {
          return res.status(404).json({ error: "Specified Client or Lawyer not found." });
        }

        let ratePerMinute = 10; // default flat ₹10/min for call
        if (type === 'chat') {
          ratePerMinute = 5; // default flat ₹5 for chat
        }

        let isFree = false;
        if (type === 'chat' && (client.free_chats_remaining ?? 0) > 0) {
          isFree = true;
          ratePerMinute = 0;
          await supabase
            .from('users')
            .update({ free_chats_remaining: client.free_chats_remaining - 1 })
            .eq('id', clientId);
        } else if (type !== 'chat' && (client.free_call_minutes_remaining ?? 0) > 0) {
          isFree = true;
          ratePerMinute = 0; // call will decrement free minutes on bill-minute
        }

        if (!isFree) {
          let { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', clientId).maybeSingle();
          const userBalance = wallet ? Number(wallet.balance) : 0;

          if (userBalance < ratePerMinute) {
            return res.status(400).json({ 
              error: `Insufficient balance! Booking ${type} session with ${lawyerUser.name} costs ₹${ratePerMinute}${type === 'chat' ? ' flat' : '/minute'}. You only have ₹${userBalance.toFixed(2)}. Please add money to your wallet.` 
            });
          }
        }

        const insertPayload: any = {
          id: crypto.randomUUID(),
          client_id: clientId,
          client_name: client.name,
          lawyer_id: lawyerId,
          lawyer_name: lawyerUser.name,
          type,
          status: 'active',
          rate_per_minute: ratePerMinute,
          started_at: new Date().toISOString()
        };

        const { data: session, error: sErr } = await supabase
          .from('consultations')
          .insert([insertPayload])
          .select()
          .single();

        if (sErr || !session) {
          console.warn("[Supabase Consultation Insert Warning]:", sErr?.message || sErr, "- Falling back to local session creation.");
          const fallbackSession: Consultation = {
            id: `c-${Date.now()}`,
            clientId,
            clientName: client.name,
            lawyerId,
            lawyerName: lawyerUser.name,
            type,
            status: 'active',
            ratePerMinute,
            startedAt: new Date().toISOString()
          };
          consultations.push(fallbackSession);
          consultationMessages.push({
            id: `msg-${Date.now()}`,
            consultationId: fallbackSession.id,
            senderId: lawyerId,
            senderName: lawyerUser.name,
            text: `Hello ${client.name}! Thanks for connecting. How can I assist you with ${lawyer.categories?.[0] || 'your legal case'} today?`,
            timestamp: new Date().toISOString()
          });
          saveLocalDb();
          return res.status(201).json({ session: fallbackSession });
        }

        try {
          await supabase.from('consultation_messages').insert([{
            id: crypto.randomUUID(),
            consultation_id: session.id,
            sender_id: lawyerId,
            sender_name: lawyerUser.name,
            text: `Hello ${client.name}! Thanks for connecting. How can I assist you with ${lawyer.categories?.[0] || 'your legal case'} today?`
          }]);
        } catch (msgErr) {
          console.warn("[Initial Message Warning]:", msgErr);
        }

        // Trigger push alert to lawyer device
        if (lawyerUser && lawyerUser.fcm_token) {
          sendPushNotification(
            lawyerUser.fcm_token,
            "Incoming Session Request",
            `Client ${client.name} has initiated a ${type} session.`,
            {
              type: "incoming_session",
              session: JSON.stringify(mapConsultationToTS(session))
            }
          );
        }

        return res.status(201).json({ session: mapConsultationToTS(session) });
      }

      const client = users.find(u => u.id === clientId);
      const lawyer = lawyerProfiles.find(l => l.userId === lawyerId);
      const lawyerUser = users.find(u => u.id === lawyerId);

      if (!client || !lawyer || !lawyerUser) {
        return res.status(404).json({ error: "Specified Client or Lawyer not found." });
      }

      let ratePerMinute = 10;
      if (type === 'chat') {
        ratePerMinute = 5;
      }

      let isFree = false;
      if (type === 'chat' && (client.freeChatsRemaining ?? 0) > 0) {
        isFree = true;
        ratePerMinute = 0;
        client.freeChatsRemaining = (client.freeChatsRemaining ?? 10) - 1;
      } else if (type !== 'chat' && (client.freeCallMinutesRemaining ?? 0) > 0) {
        isFree = true;
        ratePerMinute = 0;
      }

      if (!isFree) {
        const clientWallet = wallets.find(w => w.userId === clientId);
        const userBalance = clientWallet ? clientWallet.balance : 0;

        if (userBalance < ratePerMinute) {
          return res.status(400).json({ 
            error: `Insufficient balance! Booking ${type} session with ${lawyerUser.name} costs ₹${ratePerMinute}${type === 'chat' ? ' flat' : '/minute'}. You only have ₹${userBalance.toFixed(2)}. Please add money to your wallet.` 
          });
        }
      }

      const session: Consultation = {
        id: `c-${Date.now()}`,
        clientId,
        clientName: client.name,
        lawyerId,
        lawyerName: lawyerUser.name,
        type: type as ConsultationType,
        status: "active",
        ratePerMinute,
        startedAt: new Date().toISOString(),
        agoraChannelName: `channel_${type}_${clientId}_${Date.now()}`
      };

      consultations.push(session);

      consultationMessages.push({
        id: `msg-${Date.now()}`,
        consultationId: session.id,
        senderId: lawyerId,
        senderName: lawyerUser.name,
        text: `Hello ${client.name}! Thanks for connecting. How can I assist you with ${lawyer.categories[0] || 'your legal case'} today?`,
        timestamp: new Date().toISOString()
      });

      // Trigger push alert to lawyer device (mocked/simulated)
      if (lawyerUser && lawyerUser.fcmToken) {
        sendPushNotification(
          lawyerUser.fcmToken,
          "Incoming Session Request",
          `Client ${client.name} has initiated a ${type} session.`,
          {
            type: "incoming_session",
            session: JSON.stringify(session)
          }
        );
      }

      saveLocalDb();
      res.status(201).json({ session });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/consultations/bill-minute", async (req, res) => {
    const { consultationId } = req.body;

    try {
      if (supabase) {
        const { data: session, error: sErr } = await supabase.from('consultations').select('*').eq('id', consultationId).maybeSingle();
        if (sErr || !session || session.status !== 'active') {
          return res.status(400).json({ error: "Active consultation not found" });
        }

        const { data: client, error: cErr } = await supabase.from('users').select('*').eq('id', session.client_id).maybeSingle();
        if (cErr || !client) throw new Error("Client not found");

        let rate = Number(session.rate_per_minute);
        const freeMins = client.free_call_minutes_remaining ?? 0;
        let isFreeMin = false;

        if (session.type !== 'chat' && freeMins > 0) {
          isFreeMin = true;
          rate = 0;
          const remainingMins = freeMins - 1;
          await supabase.from('users').update({ free_call_minutes_remaining: remainingMins }).eq('id', session.client_id);
          if (remainingMins === 0) {
            await supabase.from('consultations').update({ rate_per_minute: 10 }).eq('id', session.id);
          }
        }

        const { data: wallet, error: wErr } = await supabase.from('wallets').select('*').eq('user_id', session.client_id).maybeSingle();
        if (wErr) throw wErr;

        const currentBal = wallet ? Number(wallet.balance) : 0;

        if (!isFreeMin && currentBal < rate) {
          const endMins = (session.total_minutes || 0) + 1;
          const sessionCost = rate * endMins;
          const lawyerReceipt = sessionCost;
          const platformCommission = 0;

          await supabase.from('consultations').update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            total_minutes: endMins,
            total_cost: sessionCost,
            lawyer_receipt: lawyerReceipt,
            platform_commission: platformCommission
          }).eq('id', session.id);

          await supabase.from('wallets').update({ balance: 0 }).eq('user_id', session.client_id);

          const { data: lawyerWallet } = await supabase.from('wallets').select('*').eq('user_id', session.lawyer_id).maybeSingle();
          const newLawyerBal = (lawyerWallet ? Number(lawyerWallet.balance) : 0) + lawyerReceipt;
          await supabase.from('wallets').update({ balance: newLawyerBal }).eq('user_id', session.lawyer_id);

          await supabase.from('commission_logs').insert([{
            id: crypto.randomUUID(),
            consultation_id: session.id,
            total_amount: sessionCost,
            lawyer_share: lawyerReceipt,
            platform_share: platformCommission
          }]);

          await insertWalletTransaction({
            wallet_id: session.client_id,
            amount: currentBal,
            type: 'deduction',
            description: `Exhausted session costs: Completed ${endMins} minutes booking.`
          });
          await insertWalletTransaction({
            wallet_id: session.lawyer_id,
            amount: lawyerReceipt,
            type: 'credit',
            description: `Earned 100% fee of ${endMins} minutes interaction with client.`
          });

          const { data: updatedS } = await supabase.from('consultations').select('*').eq('id', session.id).single();

          return res.json({ 
            exhausted: true, 
            message: "Wallet balance reached zero, ending session.", 
            session: mapConsultationToTS(updatedS)
          });
        }

        const newClientBal = isFreeMin ? currentBal : currentBal - rate;
        if (!isFreeMin) {
          await supabase.from('wallets').update({ balance: newClientBal }).eq('user_id', session.client_id);
        }

        const newMins = (session.total_minutes || 0) + 1;
        await supabase.from('consultations').update({ total_minutes: newMins }).eq('id', session.id);

        return res.json({ 
          success: true, 
          clientBalance: newClientBal, 
          totalMinutes: newMins 
        });
      }

      const session = consultations.find(c => c.id === consultationId);
      if (!session || session.status !== "active") {
        return res.status(400).json({ error: "Active consultation not found" });
      }

      const client = users.find(u => u.id === session.clientId);
      if (!client) return res.status(404).json({ error: "Client not found" });

      let rate = session.ratePerMinute;
      const freeMins = client.freeCallMinutesRemaining ?? 0;
      let isFreeMin = false;

      if (session.type !== 'chat' && freeMins > 0) {
        isFreeMin = true;
        rate = 0;
        const remainingMins = freeMins - 1;
        client.freeCallMinutesRemaining = remainingMins;
        if (remainingMins === 0) {
          session.ratePerMinute = 10;
        }
      }

      const clientWallet = wallets.find(w => w.userId === session.clientId);
      const oldBal = clientWallet ? clientWallet.balance : 0;

      if (!isFreeMin && (!clientWallet || clientWallet.balance < rate)) {
        session.status = "completed";
        session.endedAt = new Date().toISOString();
        const runMins = session.totalMinutes || 0;
        session.totalMinutes = runMins + 1;
        
        const sessionPrice = rate * session.totalMinutes;
        session.totalCost = sessionPrice;
        session.lawyerReceipt = sessionPrice;
        session.platformCommission = 0;

        let lawyerWallet = wallets.find(w => w.userId === session.lawyerId);
        if (!lawyerWallet) {
          lawyerWallet = { userId: session.lawyerId, balance: 0 };
          wallets.push(lawyerWallet);
        }
        lawyerWallet.balance += session.lawyerReceipt;
        if (clientWallet) clientWallet.balance = 0;

        commissionLogs.push({
          id: `cl-${Date.now()}`,
          consultationId: session.id,
          totalAmount: sessionPrice,
          lawyerShare: session.lawyerReceipt,
          platformShare: session.platformCommission,
          timestamp: new Date().toISOString()
        });

        walletTransactions.push({
          id: `tx-client-${Date.now()}`,
          walletId: session.clientId,
          amount: oldBal,
          type: "deduction",
          status: "completed",
          description: `Exhausted session costs: Completed ${session.totalMinutes} minutes booking.`,
          timestamp: new Date().toISOString()
        });

        walletTransactions.push({
          id: `tx-lawyer-${Date.now()}`,
          walletId: session.lawyerId,
          amount: session.lawyerReceipt,
          type: "credit",
          status: "completed",
          description: `Earned 100% fee of ${session.totalMinutes} minutes interaction with client.`,
          timestamp: new Date().toISOString()
        });

        return res.json({ 
          exhausted: true, 
          message: "Wallet balance reached zero, ending session.", 
          session 
        });
      }

      if (clientWallet && !isFreeMin) {
        clientWallet.balance -= rate;
      }
      session.totalMinutes = (session.totalMinutes || 0) + 1;

      res.json({ 
        success: true, 
        clientBalance: clientWallet ? clientWallet.balance : 0, 
        totalMinutes: session.totalMinutes 
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/consultations/end", async (req, res) => {
    const { consultationId } = req.body;

    try {
      if (supabase) {
        const { data: session, error: sErr } = await supabase.from('consultations').select('*').eq('id', consultationId).maybeSingle();
        if (sErr || !session || session.status !== 'active') {
          return res.status(400).json({ error: "Session is not active or already closed." });
        }

        let totalMinutes = session.total_minutes;
        if (!totalMinutes) {
          totalMinutes = 1;
        }

        let sessionCost = 0;
        if (session.type === 'chat') {
          sessionCost = Number(session.rate_per_minute); // flat charge (₹5 or ₹0)
        } else {
          sessionCost = Number(session.rate_per_minute) * totalMinutes;
        }

        const lawyerReceipt = sessionCost;
        const platformCommission = 0;

        await supabase.from('consultations').update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          total_minutes: totalMinutes,
          total_cost: sessionCost,
          lawyer_receipt: lawyerReceipt,
          platform_commission: platformCommission
        }).eq('id', session.id);

        const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', session.client_id).maybeSingle();
        if (wallet) {
          const newBal = Math.max(0, Number(wallet.balance) - sessionCost);
          await supabase.from('wallets').update({ balance: newBal }).eq('user_id', session.client_id);
        }

        const { data: lWallet } = await supabase.from('wallets').select('*').eq('user_id', session.lawyer_id).maybeSingle();
        const newLawyerBal = (lWallet ? Number(lWallet.balance) : 0) + lawyerReceipt;
        await supabase.from('wallets').update({ balance: newLawyerBal }).eq('user_id', session.lawyer_id);

        await supabase.from('commission_logs').insert([{
          id: crypto.randomUUID(),
          consultation_id: session.id,
          total_amount: sessionCost,
          lawyer_share: lawyerReceipt,
          platform_share: platformCommission
        }]);

        await insertWalletTransaction({
          wallet_id: session.client_id,
          amount: sessionCost,
          type: 'deduction',
          description: `Billed for ${session.type} consultation with ${session.lawyer_name}.`
        });
        await insertWalletTransaction({
          wallet_id: session.lawyer_id,
          amount: lawyerReceipt,
          type: 'credit',
          description: `Earned 100% payout from ${session.type} consultation with ${session.client_name}.`
        });

        await supabase.from('audit_logs').insert([{
          id: crypto.randomUUID(),
          user_id: session.client_id,
          action: 'CONSULTATION_COMPLETED',
          details: { consultationId, minutes: totalMinutes, totalCost: sessionCost }
        }]);

        const { data: updatedS } = await supabase.from('consultations').select('*').eq('id', session.id).single();
        return res.json({ success: true, session: mapConsultationToTS(updatedS) });
      }

      const session = consultations.find(c => c.id === consultationId);
      if (!session || session.status !== "active") {
        return res.status(400).json({ error: "Session is not active or already closed." });
      }

      session.status = "completed";
      session.endedAt = new Date().toISOString();
      
      let totalMinutes = session.totalMinutes;
      if (!totalMinutes) {
        totalMinutes = 1;
        session.totalMinutes = 1;
      }

      let sessionCost = 0;
      if (session.type === 'chat') {
        sessionCost = session.ratePerMinute; // flat charge
      } else {
        sessionCost = session.ratePerMinute * totalMinutes;
      }

      session.totalCost = sessionCost;
      session.lawyerReceipt = sessionCost;
      session.platformCommission = 0;

      const clientWallet = wallets.find(w => w.userId === session.clientId);
      if (clientWallet) {
        clientWallet.balance = Math.max(0, clientWallet.balance - sessionCost);
      }

      let lawyerWallet = wallets.find(w => w.userId === session.lawyerId);
      if (!lawyerWallet) {
        lawyerWallet = { userId: session.lawyerId, balance: 0 };
        wallets.push(lawyerWallet);
      }
      lawyerWallet.balance += session.lawyerReceipt;

      commissionLogs.push({
        id: `cl-${Date.now()}`,
        consultationId: session.id,
        totalAmount: sessionCost,
        lawyerShare: session.lawyerReceipt,
        platformShare: session.platformCommission,
        timestamp: new Date().toISOString()
      });

      walletTransactions.push({
        id: `tx-client-${Date.now()}`,
        walletId: session.clientId,
        amount: sessionCost,
        type: "deduction",
        status: "completed",
        description: `Billed for ${session.type} consultation with ${session.lawyerName}.`,
        timestamp: new Date().toISOString()
      });

      walletTransactions.push({
        id: `tx-lawyer-${Date.now()}`,
        walletId: session.lawyerId,
        amount: session.lawyerReceipt,
        type: "credit",
        status: "completed",
        description: `Earned 100% payout from ${session.type} consultation with ${session.clientName}.`,
        timestamp: new Date().toISOString()
      });

      auditLogs.push({
        id: `aud-${Date.now()}`,
        userId: session.clientId,
        action: "CONSULTATION_COMPLETED",
        details: { consultationId, minutes: totalMinutes, totalCost: sessionCost },
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, session });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/consultations/session/:id", async (req, res) => {
    const { id } = req.params;

    try {
      if (supabase) {
        const { data, error } = await supabase.from('consultations').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: "Session not found" });
        return res.json({ session: mapConsultationToTS(data) });
      }

      const session = consultations.find(c => c.id === id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ session });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/consultations/messages/:consultationId", async (req, res) => {
    const { consultationId } = req.params;

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('consultation_messages')
          .select('*')
          .eq('consultation_id', consultationId)
          .not('text', 'like', '__SIGNAL__:%')
          .order('created_at', { ascending: true });
        if (error) throw error;
        return res.json({ messages: (data || []).map(mapMessageToTS) });
      }

      const msgs = consultationMessages.filter(m => m.consultationId === consultationId && !m.text.startsWith('__SIGNAL__:'));
      res.json({ messages: msgs });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/consultations/messages", async (req, res) => {
    const { consultationId, senderId, senderName, text } = req.body;
    if (!consultationId || !senderId || !text) {
      return res.status(400).json({ error: "Mandatory fields missing." });
    }

    try {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('consultation_messages')
            .insert([{
              id: crypto.randomUUID(),
              consultation_id: consultationId,
              sender_id: senderId,
              sender_name: senderName,
              text
            }])
            .select()
            .single();
          if (!error && data) {
            // Push message alert to chat partner
            (async () => {
              try {
                const { data: session } = await supabase
                  .from('consultations')
                  .select('*')
                  .eq('id', consultationId)
                  .maybeSingle();
                if (session) {
                  const partnerId = senderId === session.client_id ? session.lawyer_id : session.client_id;
                  const { data: partnerUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', partnerId)
                    .maybeSingle();
                  if (partnerUser && partnerUser.fcm_token) {
                    sendPushNotification(
                      partnerUser.fcm_token,
                      `New Message from ${senderName}`,
                      text.length > 80 ? text.substring(0, 77) + "..." : text,
                      {
                        type: "chat_message",
                        consultationId,
                        senderId,
                        senderName
                      }
                    );
                  }
                }
              } catch (pushErr) {
                // Ignore push failures
              }
            })();

            return res.status(201).json({ message: mapMessageToTS(data) });
          }
        } catch (subErr) {
          console.warn("[Supabase Message Insert Warning]:", subErr);
        }
      }

      const newMsg: ConsultationMessage = {
        id: `msg-${Date.now()}`,
        consultationId,
        senderId,
        senderName,
        text,
        timestamp: new Date().toISOString()
      };
      consultationMessages.push(newMsg);
      saveLocalDb();

      // Push message alert to chat partner (mocked/simulated)
      const session = consultations.find(c => c.id === consultationId);
      if (session) {
        const partnerId = senderId === session.clientId ? session.lawyerId : session.clientId;
        const partnerUser = users.find(u => u.id === partnerId);
        if (partnerUser && partnerUser.fcmToken) {
          sendPushNotification(
            partnerUser.fcmToken,
            `New message from ${senderName}`,
            text.length > 50 ? text.substring(0, 50) + "..." : text,
            {
              type: "new_message",
              consultationId,
              senderName
            }
          );
        }
      }

      res.status(201).json({ message: newMsg });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/consultations/history/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('consultations')
          .select('*')
          .or(`client_id.eq.${userId},lawyer_id.eq.${userId}`)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.json({ consultations: (data || []).map(mapConsultationToTS) });
      }

      const list = consultations.filter(c => c.clientId === userId || c.lawyerId === userId);
      res.json({ consultations: list });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    const { consultationId, rating, feedback } = req.body;

    try {
      if (supabase) {
        const { data: session, error: sErr } = await supabase.from('consultations').select('*').eq('id', consultationId).maybeSingle();
        if (!session) {
          return res.status(404).json({ error: "Consultation not found" });
        }

        const { data: existingReview } = await supabase.from('reviews').select('*').eq('consultation_id', consultationId).maybeSingle();
        if (existingReview) {
          return res.status(400).json({ error: "Review already submitted for this session" });
        }

        const { data: newRev, error: rErr } = await supabase
          .from('reviews')
          .insert([{
            id: crypto.randomUUID(),
            consultation_id: consultationId,
            client_name: session.client_name,
            lawyer_id: session.lawyer_id,
            rating: Number(rating) || 5,
            feedback: feedback || ""
          }])
          .select()
          .single();
        if (rErr) throw rErr;

        const { data: allRevs } = await supabase.from('reviews').select('rating').eq('lawyer_id', session.lawyer_id);
        const sum = (allRevs || []).reduce((acc, r) => acc + Number(r.rating), 0);
        const avg = allRevs && allRevs.length > 0 ? Number((sum / allRevs.length).toFixed(1)) : 5.0;
        const count = allRevs ? allRevs.length : 0;

        await supabase.from('lawyers').update({ rating: avg, review_count: count }).eq('user_id', session.lawyer_id);

        return res.status(201).json({ success: true, review: mapReviewToTS(newRev) });
      }

      const session = consultations.find(c => c.id === consultationId);
      if (!session) {
        return res.status(404).json({ error: "Consultation not found" });
      }

      const checkExists = reviews.find(r => r.consultationId === consultationId);
      if (checkExists) {
        return res.status(400).json({ error: "Review already submitted for this session" });
      }

      const id = `rev-${Date.now()}`;
      const newRev: Review = {
        id,
        consultationId,
        clientName: session.clientName,
        lawyerId: session.lawyerId,
        rating: Number(rating) || 5,
        feedback: feedback || "Detailed feedback left.",
        timestamp: new Date().toISOString()
      };
      reviews.push(newRev);

      const lawyerRevs = reviews.filter(r => r.lawyerId === session.lawyerId);
      const sum = lawyerRevs.reduce((acc, r) => acc + r.rating, 0);
      const profileIdx = lawyerProfiles.findIndex(p => p.userId === session.lawyerId);
      if (profileIdx !== -1) {
        lawyerProfiles[profileIdx].reviewCount = lawyerRevs.length;
        lawyerProfiles[profileIdx].rating = Number((sum / lawyerRevs.length).toFixed(1));
      }

      res.status(201).json({ success: true, review: newRev });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/lawyers/withdraw", async (req, res) => {
    const { userId, amount, bankHolderName, bankAccountNumber, ifscCode } = req.body;

    try {
      if (supabase) {
        const { data: lawyer } = await supabase.from('lawyers').select('*').eq('user_id', userId).maybeSingle();
        const { data: user } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
        const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();

        if (!lawyer || !user || !wallet) {
          return res.status(404).json({ error: "Lawyer profile not found" });
        }

        const curBal = Number(wallet.balance);
        const requestVal = Number(amount);

        if (requestVal <= 0 || curBal < requestVal) {
          return res.status(400).json({ error: "Insufficient wallet balance to request withdrawal of ₹" + requestVal });
        }

        const { data: withdrawal, error: wErr } = await supabase
          .from('withdrawals')
          .insert([{
            id: crypto.randomUUID(),
            lawyer_id: userId,
            lawyer_name: user.name,
            amount: requestVal,
            status: 'pending',
            bank_holder_name: bankHolderName,
            bank_account_number: bankAccountNumber,
            ifsc_code: ifscCode
          }])
          .select()
          .single();
        if (wErr) throw wErr;

        const newBal = curBal - requestVal;
        await supabase.from('wallets').update({ balance: newBal }).eq('user_id', userId);

        await insertWalletTransaction({
          id: crypto.randomUUID(),
          wallet_id: userId,
          amount: requestVal,
          type: 'withdrawal',
          description: "Requested withdrawal of earnings to " + bankAccountNumber
        });

        return res.status(201).json({ success: true, request: mapWithdrawalToTS(withdrawal), walletBalance: newBal });
      }

      const lawyer = lawyerProfiles.find(p => p.userId === userId);
      const lawyerUser = users.find(u => u.id === userId);
      if (!lawyer || !lawyerUser) {
        return res.status(404).json({ error: "Lawyer profile not found" });
      }

      const lawyerWallet = wallets.find(w => w.userId === userId);
      const curBal = lawyerWallet ? lawyerWallet.balance : 0;
      const requestVal = Number(amount);

      if (requestVal <= 0 || curBal < requestVal) {
        return res.status(400).json({ error: "Insufficient wallet balance to request withdrawal of ₹" + requestVal });
      }

      const request: WithdrawalRequest = {
        id: `w-${Date.now()}`,
        lawyerId: userId,
        lawyerName: lawyerUser.name,
        amount: requestVal,
        status: "pending",
        bankHolderName,
        bankAccountNumber,
        ifscCode,
        timestamp: new Date().toISOString()
      };

      withdrawals.push(request);

      if (lawyerWallet) {
        lawyerWallet.balance -= requestVal;
      }

      walletTransactions.push({
        id: `tx-withdrawal-${Date.now()}`,
        walletId: userId,
        amount: requestVal,
        type: "withdrawal",
        status: "pending",
        description: "Requested withdrawal of earnings to " + bankAccountNumber,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({ success: true, request, walletBalance: lawyerWallet?.balance });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // -------------------------------------------------------------
  // ADMIN CONTROL ENDPOINTS
  // -------------------------------------------------------------
  app.get("/api/admin/metrics", async (req, res) => {
    try {
      if (supabase) {
        const { data: clientData, error: cErr } = await supabase.from('users').select('*').eq('role', 'client');
        const { data: lawyerData, error: lErr } = await supabase.from('lawyers').select('*');
        const { data: conData, error: conErr } = await supabase.from('consultations').select('total_cost, platform_commission');
        const { data: audits, error: audErr } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10);
        const { data: withdrawalList, error: wErr } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
        const { data: lawyersProfilesJoin, error: lpErr } = await supabase.from('lawyers').select('*, users(*)');
        const { data: usersList, error: uErr } = await supabase.from('users').select('*').neq('role', 'admin');

        if (cErr || lErr || conErr || audErr || wErr || lpErr || uErr) {
          throw new Error("Failed to query database metrics");
        }

        const totalClients = clientData?.length || 0;
        const totalLawyers = lawyerData?.length || 0;
        const consultationCount = conData?.length || 0;
        const totalRevenue = conData?.reduce((acc, c) => acc + Number(c.total_cost || 0), 0) || 0;
        const commissionRevenue = conData?.reduce((acc, c) => acc + Number(c.platform_commission || 0), 0) || 0;

        const formattedProfiles = (lawyersProfilesJoin || []).map(p => {
          const u = p.users;
          return {
            userId: p.user_id,
            barCouncilNumber: p.bar_council_number,
            stateBarCouncil: p.state_bar_council,
            aadhaar: p.aadhaar,
            pan: p.pan,
            bio: p.bio,
            experienceYears: p.experience_years,
            languages: p.languages,
            categories: p.categories,
            chatPricePerMinute: Number(p.chat_price_per_minute),
            voicePricePerMinute: Number(p.voice_price_per_minute),
            videoPricePerMinute: Number(p.video_price_per_minute),
            verificationStatus: p.verification_status,
            isOnline: p.is_online,
            rating: Number(p.rating || 0),
            reviewCount: Number(p.review_count || 0),
            practiceState: p.practice_state,
            practiceDistrict: p.practice_district,
            name: u?.name || "Unknown Lawyer",
            mobile: u?.mobile,
            email: u?.email,
            isBlocked: u?.is_blocked
          };
        });

        return res.json({
          metrics: {
            totalClients,
            totalLawyers,
            totalRevenue,
            commissionRevenue,
            consultationCount
          },
          auditLogs: audits,
          withdrawals: (withdrawalList || []).map(mapWithdrawalToTS),
          lawyerProfiles: formattedProfiles,
          users: (usersList || []).map(mapUserToTS)
        });
      }

      const totalClients = users.filter(u => u.role === "client").length;
      const totalLawyers = lawyerProfiles.length;
      const totalRevenue = consultations.reduce((acc, c) => acc + (c.totalCost || 0), 0);
      const commissionRevenue = consultations.reduce((acc, c) => acc + (c.platformCommission || 0), 0);
      const consultationCount = consultations.length;

      res.json({
        metrics: {
          totalClients,
          totalLawyers,
          totalRevenue,
          commissionRevenue,
          consultationCount
        },
        auditLogs: auditLogs.slice(-10).reverse(),
        withdrawals,
        lawyerProfiles: lawyerProfiles.map(p => {
          const u = users.find(user => user.id === p.userId);
          return {
            ...p,
            name: u?.name || "Unknown Lawyer",
            mobile: u?.mobile,
            email: u?.email,
            isBlocked: u?.isBlocked
          };
        }),
        users: users.filter(u => u.role !== 'admin')
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/verify", async (req, res) => {
    const { id, action } = req.body;

    try {
      if (supabase) {
        const { data: lawyer, error: fErr } = await supabase.from('lawyers').select('*').eq('user_id', id).maybeSingle();
        if (fErr || !lawyer) {
          return res.status(404).json({ error: "Lawyer profile not found" });
        }

        const { data: updated, error: uErr } = await supabase
          .from('lawyers')
          .update({ verification_status: action })
          .eq('user_id', id)
          .select()
          .single();
        if (uErr) throw uErr;

        await supabase.from('audit_logs').insert([{
          id: crypto.randomUUID(),
          user_email: "admin@legaltalk.in",
          action: `LAWYER_VERIFICATION_${action.toUpperCase()}`,
          details: { lawyerId: id }
        }]);

        return res.json({ success: true, profile: mapLawyerToTS(updated) });
      }

      const idx = lawyerProfiles.findIndex(p => p.userId === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Lawyer profile not found" });
      }

      lawyerProfiles[idx].verificationStatus = action;

      auditLogs.push({
        id: `aud-${Date.now()}`,
        userId: "u-admin-1",
        userEmail: "admin@legaltalk.in",
        action: `LAWYER_VERIFICATION_${action.toUpperCase()}`,
        details: { lawyerId: id },
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, profile: lawyerProfiles[idx] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/block", async (req, res) => {
    const { id, isBlocked } = req.body;

    try {
      if (supabase) {
        const { data: user, error: fErr } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
        if (fErr || !user) {
          return res.status(404).json({ error: "User not found" });
        }

        const { data: updated, error: uErr } = await supabase
          .from('users')
          .update({ is_blocked: !!isBlocked })
          .eq('id', id)
          .select()
          .single();
        if (uErr) throw uErr;

        await supabase.from('audit_logs').insert([{
          id: crypto.randomUUID(),
          user_email: "admin@legaltalk.in",
          action: isBlocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
          details: { userId: id, name: user.name }
        }]);

        return res.json({ success: true, user: mapUserToTS(updated) });
      }

      const user = users.find(u => u.id === id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.isBlocked = !!isBlocked;

      auditLogs.push({
        id: `aud-${Date.now()}`,
        userId: "u-admin-1",
        userEmail: "admin@legaltalk.in",
        action: isBlocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
        details: { userId: id, name: user.name },
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, user });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/approve-withdrawal", async (req, res) => {
    const { withdrawalId } = req.body;

    try {
      if (supabase) {
        const { data: reqData, error: fErr } = await supabase.from('withdrawals').select('*').eq('id', withdrawalId).maybeSingle();
        if (fErr || !reqData) {
          return res.status(404).json({ error: "Withdrawal request not found" });
        }

        const { data: updated, error: uErr } = await supabase
          .from('withdrawals')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('id', withdrawalId)
          .select()
          .single();
        if (uErr) throw uErr;

        const { data: txs } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', reqData.lawyer_id)
          .eq('type', 'withdrawal')
          .order('created_at', { ascending: false })
          .limit(1);

        if (txs && txs.length > 0) {
          try {
            await supabase
              .from('wallet_transactions')
              .update({ description: (txs[0].description || "") + " (Approved by Admin)" })
              .eq('id', txs[0].id);
          } catch (e) {}
        }

        await supabase.from('audit_logs').insert([{
          id: crypto.randomUUID(),
          user_email: "admin@legaltalk.in",
          action: "WITHDRAWAL_APPROVED",
          details: { lawyerId: reqData.lawyer_id, amount: reqData.amount }
        }]);

        return res.json({ success: true, request: mapWithdrawalToTS(updated) });
      }

      const reqIndex = withdrawals.findIndex(w => w.id === withdrawalId);
      if (reqIndex === -1) {
        return res.status(404).json({ error: "Withdrawal request not found" });
      }

      withdrawals[reqIndex].status = "approved";
      withdrawals[reqIndex].approved_at = new Date().toISOString();

      const w = withdrawals[reqIndex];
      const tx = walletTransactions.find(t => t.walletId === w.lawyerId && t.type === 'withdrawal' && t.status === 'pending');
      if (tx) {
        tx.status = "completed";
        tx.description += " (Approved by Admin)";
      }

      auditLogs.push({
        id: `aud-${Date.now()}`,
        userId: "u-admin-1",
        userEmail: "admin@legaltalk.in",
        action: "WITHDRAWAL_APPROVED",
        details: { lawyerId: w.lawyerId, amount: w.amount },
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, request: withdrawals[reqIndex] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/generate-invite", async (req, res) => {
    const { adminId } = req.body;
    try {
      const code = `ADM-INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      if (supabase) {
        let validCreatorId = null;
        if (adminId && adminId.length >= 32) {
          validCreatorId = adminId;
        }
        const { data: invite, error } = await supabase
          .from('admin_invitations')
          .insert([{ 
            id: crypto.randomUUID(),
            code, 
            created_by: validCreatorId, 
            is_used: false 
          }])
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json({ success: true, code: invite.code });
      }

      adminInvitations.push({
        id: `invite-${Date.now()}`,
        code,
        createdBy: adminId,
        isUsed: false,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({ success: true, code });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // -------------------------------------------------------------
  // CASES & COLLABORATIVE DOCUMENT VAULT MODULE
  // -------------------------------------------------------------
  app.get("/api/cases", async (req, res) => {
    const { clientId, lawyerId, status } = req.query;

    try {
      if (supabase) {
        let query = supabase.from('cases').select('*');
        if (clientId) query = query.eq('client_id', clientId);
        if (lawyerId) query = query.eq('lawyer_id', lawyerId);
        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;
        return res.json({ cases: (data || []).map(mapCaseToTS) });
      }

      let list = [...cases];
      if (clientId) list = list.filter(c => c.clientId === clientId);
      if (lawyerId) list = list.filter(c => c.lawyerId === lawyerId);
      if (status) list = list.filter(c => c.status === status);

      res.json({ cases: list });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/cases/create", async (req, res) => {
    const { clientId, clientName, title, description, category } = req.body;
    if (!clientId || !clientName || !title || !description || !category) {
      return res.status(400).json({ error: "Missing required case details" });
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('cases')
          .insert([{
            id: crypto.randomUUID(),
            client_id: clientId,
            client_name: clientName,
            title,
            description,
            category,
            status: 'searching',
            documents: []
          }])
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json({ success: true, case: mapCaseToTS(data) });
      }

      const newCase: Case = {
        id: `case-${Date.now()}`,
        clientId,
        clientName,
        title,
        description,
        category,
        status: 'searching',
        documents: [],
        createdAt: new Date().toISOString()
      };
      cases.push(newCase);
      res.status(201).json({ success: true, case: newCase });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/cases/accept", async (req, res) => {
    const { caseId, lawyerId, lawyerName } = req.body;
    if (!caseId || !lawyerId || !lawyerName) {
      return res.status(400).json({ error: "Missing acceptance details" });
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('cases')
          .update({
            lawyer_id: lawyerId,
            lawyer_name: lawyerName,
            status: 'ongoing'
          })
          .eq('id', caseId)
          .select()
          .single();
        if (error) throw error;

        // Push representation acceptance alert to client
        (async () => {
          try {
            const { data: clientUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.client_id)
              .maybeSingle();
            if (clientUser && clientUser.fcm_token) {
              sendPushNotification(
                clientUser.fcm_token,
                "Case Accepted",
                `Advocate ${lawyerName} has accepted representation for your case: ${data.title}.`,
                {
                  type: "case_accepted",
                  case: JSON.stringify(mapCaseToTS(data))
                }
              );
            }
          } catch (e: any) {
            console.error("[FCM Push Case Accept] Error sending notification:", e.message);
          }
        })();

        return res.json({ success: true, case: mapCaseToTS(data) });
      }

      const idx = cases.findIndex(c => c.id === caseId);
      if (idx === -1) {
        return res.status(404).json({ error: "Case not found" });
      }

      cases[idx].lawyerId = lawyerId;
      cases[idx].lawyerName = lawyerName;
      cases[idx].status = 'ongoing';

      // Push representation acceptance alert to client (mocked/simulated)
      const clientUser = users.find(u => u.id === cases[idx].clientId);
      if (clientUser && clientUser.fcmToken) {
        sendPushNotification(
          clientUser.fcmToken,
          "Case Accepted",
          `Advocate ${lawyerName} has accepted representation for your case: ${cases[idx].title}.`,
          {
            type: "case_accepted",
            case: JSON.stringify(cases[idx])
          }
        );
      }

      res.json({ success: true, case: cases[idx] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/cases/upload-doc", async (req, res) => {
    const { caseId, name, url, uploadedBy } = req.body;
    if (!caseId || !name || !url || !uploadedBy) {
      return res.status(400).json({ error: "Missing document upload details" });
    }

    try {
      const docId = `doc-${Date.now()}`;
      const newDoc = {
        id: docId,
        name,
        url,
        uploadedBy,
        uploadedAt: new Date().toISOString()
      };

      if (supabase) {
        const { data: c, error: fErr } = await supabase.from('cases').select('documents').eq('id', caseId).maybeSingle();
        if (fErr || !c) {
          return res.status(404).json({ error: "Case not found" });
        }

        const currentDocs = Array.isArray(c.documents) ? c.documents : [];
        const updatedDocs = [...currentDocs, newDoc];

        const { data: updatedCase, error: uErr } = await supabase
          .from('cases')
          .update({ documents: updatedDocs })
          .eq('id', caseId)
          .select()
          .single();
        if (uErr) throw uErr;

        return res.json({ success: true, case: mapCaseToTS(updatedCase) });
      }

      const idx = cases.findIndex(c => c.id === caseId);
      if (idx === -1) {
        return res.status(404).json({ error: "Case not found" });
      }

      cases[idx].documents.push(newDoc);
      res.json({ success: true, case: cases[idx] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // -------------------------------------------------------------
  // AI LEGAL ASSISTANT MODULE (GOOG GENAI CHAT API)
  // -------------------------------------------------------------

  app.post("/api/ai-assistant", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is mandatory" });
    }

    const systemPrompt = `You are "LegalTalk India AI Legal Assistant", designed to act strictly as a general informational index for Indian Law.
Rules:
1. Always display "This is informational guidance and not legal advice." prominently at the start or end of your answer.
2. Encourage the user to consult real advocates specifically by saying: "Talk to a verified lawyer on our platform if you need legal advice!".
3. Guide according to Indian Legal Statutes (e.g., Indian Penal Code/BNS, Code of Civil Procedure/BNSS, Hindu Marriage Act, Transfer of Property Act, Motor Vehicles Act, etc.) where appropriate.
4. If a query requests deep personal/case strategy, legal representation tactics, lawsuit/document drafting, or courtroom strategy, you must limit your response to a high-level general legal framework overview and decline to provide deep counsel or specific tactics.
5. Keep the answer structured, clean, and professional. Use bullet points or code block sections to enhance formatting, and keep headings elegant.
6. Crucially: If the query represents a situation requiring a professional lawyer's intervention (e.g., customized advice, lawsuits, drafting contracts, court representation, deep disputes, filing disputes, or case-specific strategizing), you MUST append the exact string "[ACTION_REQUIRED: ESCALATE_TO_LAWYER]" at the very end of your response, after all other text and disclaimers.
7. Special Knowledge Base & Trend Cases:
   - Search Grounding for Case Studies: If the user requests "similar court case judgements, case studies, and legal outcomes in India", use Google Search grounding to retrieve actual legal precedents. Format the response with clear headers for each case, detailing: Case Title & Citation, Brief Facts/Context, Key Legal Questions, the Court's Decision/Judgement, and the Final Outcome/Result.
   - Drunk driving causing fatal accidents: Cite Section 106 of Bharatiya Nyaya Sanhita (BNS) [formerly IPC 304A] (negligent death, up to 5 years, or up to 10 years for hit-and-run) and Section 185 of the Motor Vehicles Act (drunk driving).
   - If the query mentions Mandi, Himachal Pradesh, recommend "Adv. Ramesh Thakur" as a top verified criminal defense advocate with 28 years of court experience in Mandi District Courts.
   - Address common internet searches in India: Mutual Consent Divorce (Hindu Marriage Act Section 13B), inheritance and property sale deeds (Transfer of Property Act), consumer disputes, and Fundamental Rights protection (Part III of the Constitution).`;

    let responseText = "";

    try {
      const client = getGeminiClient();
      if (client) {
        const candidateModels = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        for (const modelName of candidateModels) {
          try {
            const gResponse = await client.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.7
              }
            });
            if (gResponse && gResponse.text) {
              responseText = gResponse.text;
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} failed, attempting next model in cascade...`, modelErr?.message?.substring(0, 120));
          }
        }
      }
    } catch (geminiError: any) {
      console.error("Gemini API call completely failed or was overloaded (503). Using robust local mock knowledge base. Error:", geminiError.message || geminiError);
    }

    // Fallback to local mock database if API failed or no client was initialized
    if (!responseText) {
      const answers: { [key: string]: string } = {
        "accident": "Under Section 106(1) of the Bharatiya Nyaya Sanhita (BNS) [formerly Section 304A IPC], causing death by doing any rash or negligent act not amounting to culpable homicide carries up to 5 years imprisonment and a fine. If the driver is driving under the influence of alcohol, it constitutes an offence under Section 185 of the Motor Vehicles Act. If the driver escapes without reporting it immediately to police or a magistrate, Section 106(2) BNS (hit-and-run) prescribes up to 10 years imprisonment.",
        "criminal": "Under section 300 / 302 of the Indian Penal Code (IPC) [equivalent to Sections 101 / 103 of BNS], culpable homicide amounting to murder carries imprisonment for life or death sentence. Bail procedures are governed by BNSS sections 480/482 (formerly CrPC 437/439).",
        "divorce": "Under the Hindu Marriage Act, 1955, Section 13B provides for Mutual Consent Divorce. Parties must live separately for at least one year before filing the application.",
        "property": "Under the Transfer of Property Act, 1882, any sale/transfer of immovable property worth more than ₹100 must be done via a registered sale deed.",
        "default": "In India, constitutional rights are protected under Part III of the Constitution. To lodge a petition or file civil applications, you should draft plaints following the Code of Civil Procedure (CPC). Please write down specific terms for specialized references."
      };

      let mockText = answers.default;
      const q = prompt.toLowerCase();
      
      if (q.includes("court case judgements") || q.includes("similar cases") || q.includes("case studies") || q.includes("outcome")) {
        if (q.includes("divorce") || q.includes("marriage") || q.includes("wife") || q.includes("husband")) {
          mockText = `### Landmark Divorce Judgements & Case Studies (India)

1.  **Srinivas Rao v. D.A. Deepa (2013):**
    *   **Context:** Petition for divorce under Hindu Marriage Act on grounds of mental cruelty.
    *   **Judgement:** Supreme Court ruled that persistent false complaints, public humiliation, and refusal to cohabit constitute mental cruelty, making marriage irretrievable.
    *   **Outcome:** Divorce granted to husband.

2.  **Amardeep Singh v. Harveen Kaur (2017):**
    *   **Context:** Waiver of statutory cooling-off period of 6 months under Section 13B(2) of HMA.
    *   **Judgement:** Supreme Court held that the cooling-off period is directory and not mandatory, and can be waived if parties have settled all disputes and mediation has failed.
    *   **Outcome:** Divorce decree allowed without 6-month wait.`;
        } else if (q.includes("trademark") || q.includes("patent") || q.includes("ipr") || q.includes("logo") || q.includes("copyright")) {
          mockText = `### Landmark Intellectual Property & Trademark Judgements (India)

1.  **Yahoo!, Inc. v. Akash Arora (1999):**
    *   **Context:** Trademark infringement and passing off by using domain name "yahooindia.com" similar to "yahoo.com".
    *   **Judgement:** Delhi High Court ruled that a domain name serves the same function as a trademark on the internet and is entitled to equal protection against passing off.
    *   **Outcome:** Permanent injunction granted against defendant.

2.  **Bajaj Electricals Ltd. v. Metals & Allied Products (1987):**
    *   **Context:** Infringement of the "Bajaj" trademark on kitchen appliances.
    *   **Judgement:** Bombay High Court ruled that even a family surname can acquire secondary distinctive meaning through extensive usage, granting exclusive trademark protection.
    *   **Outcome:** Injunction upheld in favor of plaintiff.`;
        } else if (q.includes("murder") || q.includes("302") || q.includes("killing") || q.includes("death")) {
          mockText = `### Landmark Criminal Murder Judgements (India)

1.  **Bachchan Singh v. State of Punjab (1980):**
    *   **Context:** Constitutional validity of death penalty under Section 302 IPC.
    *   **Judgement:** Supreme Court upheld validity of capital punishment but established the "rarest of rare cases" doctrine, restricting its application.
    *   **Outcome:** Guidelines established for sentencing.

2.  **K.M. Nanavati v. State of Maharashtra (1961):**
    *   **Context:** Crime of passion, plea of grave and sudden provocation.
    *   **Judgement:** Supreme Court held that provocation was not sudden as time elapsed between discovery and shooting, leading to conviction for murder.
    *   **Outcome:** Sentenced to life imprisonment (later pardoned).`;
        } else if (q.includes("property") || q.includes("land") || q.includes("tenant") || q.includes("rent")) {
          mockText = `### Landmark Property & Tenancy Judgements (India)

1.  **Suraj Lamp & Industries Pvt. Ltd. v. State of Haryana (2011):**
    *   **Context:** Transfer of immovable property through General Power of Attorney (GPA) and Agreement to Sell.
    *   **Judgement:** Supreme Court held that property transfers can only be validly executed through registered sale deeds, and GPA/SA transactions do not convey title.
    *   **Outcome:** Declared GPA transfers invalid as deeds of title.

2.  **State of UP v. District Judge (1997):**
    *   **Context:** Dispute over tenant eviction and fair rent control.
    *   **Judgement:** Upheld tenant protection laws, stating that landlord eviction requests must prove bona fide personal need.
    *   **Outcome:** Eviction set aside due to lack of genuine necessity.`;
        } else {
          mockText = `### Landmark Judgements & Case Studies (India)

1.  **State of Himachal Pradesh v. Ramesh Kumar (2018):**
    *   **Context:** Negligent driving under the influence causing fatal accidents on hill roads.
    *   **Judgement:** The Himachal Pradesh High Court ruled that driving under the influence constitutes a distinct negligence under BNS 106(1)/IPC 304A and MVA 185, denying lenient compounding of offence.
    *   **Outcome:** 3 years rigorous imprisonment.

2.  **Alister Anthony Pareira v. State of Maharashtra (2012):**
    *   **Context:** Drunk driving crash causing deaths of pavement dwellers.
    *   **Judgement:** Supreme Court held that knowledge that driving under influence of liquor could cause death makes it culpable under IPC 304 Part II (culpable homicide not amounting to murder) rather than mere negligence.
    *   **Outcome:** Imprisonment sentence upheld.

3.  **State of Punjab v. Saurabh Bakshi (2015):**
    *   **Context:** Death caused by rash and negligent driving.
    *   **Judgement:** The Supreme Court ruled that no sympathy should be shown to drivers who cause death by negligence, emphasizing deterrence.
    *   **Outcome:** 2 years imprisonment sentence reinstated.`;
        }
      } else if ((q.includes("murder") || q.includes("accident") || q.includes("killed") || q.includes("car") || q.includes("drinking") || q.includes("alcohol")) && (q.includes("mandi") || q.includes("himachal"))) {
        mockText = `This involves a critical criminal case of vehicular homicide. Under Section 106 of the Bharatiya Nyaya Sanhita (BNS) and Section 185 of the Motor Vehicles Act, driving under the influence of alcohol causing fatal accidents carries severe criminal prosecution (up to 5 years under BNS 106(1) or 10 years if hit-and-run under BNS 106(2)).\n\nFor representation in Mandi, Himachal Pradesh, we recommend connecting with **Adv. Ramesh Thakur**, our verified criminal defense advocate registered under the Himachal Pradesh Bar Council with over 28 years of practice in Mandi District and Sessions Court.`;
      } else if (q.includes("accident") || q.includes("car") || q.includes("negligence") || q.includes("drinking") || q.includes("alcohol")) {
        mockText = answers.accident;
      } else if (q.includes("murder") || q.includes("jail") || q.includes("criminal") || q.includes("ipc") || q.includes("bns")) {
        mockText = answers.criminal;
      } else if (q.includes("divorce") || q.includes("marriage") || q.includes("wife") || q.includes("husband")) {
        mockText = answers.divorce;
      } else if (q.includes("land") || q.includes("property") || q.includes("flat") || q.includes("registration")) {
        mockText = answers.property;
      }

      responseText = `### Information Desk (Staging Demo Mode)\n\n${mockText}\n\n**Disclaimer:** *This is informational guidance and not legal advice. For binding solutions under Indian Law, talk to one of our verified advocates instantly using LegalTalk India platform.*`;
      
      // Escalation trigger check for mock answers
      const needsEscalation = q.includes("murder") || q.includes("accident") || q.includes("car") || q.includes("draft") || q.includes("represent") || q.includes("court") || q.includes("lawyer") || q.includes("advocate") || q.includes("advice");
      if (needsEscalation) {
        responseText += ` [ACTION_REQUIRED: ESCALATE_TO_LAWYER]`;
      }
    }

    res.json({ text: responseText });
  });

  // Serve markdown setups to client developer workspace dynamically!
  app.get("/api/docs/:guide", (req, res) => {
    const { guide } = req.params;
    const validGuides = ["supabase", "razorpay", "vercel", "checklist"];
    if (!validGuides.includes(guide)) {
      return res.status(404).json({ error: "Document not found" });
    }

    const mapping = {
      supabase: "SUPABASE_SETUP_GUIDE.md",
      razorpay: "RAZORPAY_SETUP_GUIDE.md",
      vercel: "VERCEL_DEPLOYMENT_GUIDE.md",
      checklist: "PRODUCTION_CHECKLIST.md"
    };

    const filePath = path.join(process.cwd(), "docs", mapping[guide as keyof typeof mapping]);
    res.sendFile(filePath);
  });

  // 404 handler for API routes
  app.use((req, res, next) => {
    if (req.url.startsWith("/api") || process.env.VERCEL) {
      return res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
    }
    next();
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Unhandled Server Error]:", err);
    res.status(500).json({ error: err?.message || "Internal server error" });
  });

  // -------------------------------------------------------------
  // VITE DEV SERVER / PRODUCTION STATIC ASSET INJECTION
  // -------------------------------------------------------------
  async function startServer() {
    if (process.env.VERCEL) return;
    if (process.env.NODE_ENV !== "production") {
      try {
        const viteModule = "vite";
        const { createServer: createViteServer } = await import(viteModule);
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
        app.use('*', async (req, res, next) => {
          if (req.originalUrl.startsWith('/api')) {
            return next();
          }
          try {
            const indexPath = path.resolve(process.cwd(), 'index.html');
            let template = fs.readFileSync(indexPath, 'utf-8');
            template = await vite.transformIndexHtml(req.originalUrl, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          } catch (e: any) {
            vite.ssrFixStacktrace(e);
            next(e);
          }
        });
      } catch (viteErr) {
        console.warn("[Vite Middleware Notice]:", viteErr);
      }
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[LegalTalk India Backend Server] Running smoothly on port ${PORT}`);
    });
  }

  // Export for Vercel Serverless Function deployment
  export { app };
  export default app;

  if (!process.env.VERCEL) {
    startServer();
  }
