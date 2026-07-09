/**
 * LegalTalk India - Core TypeScript Definitions
 */

export interface User {
  id: string;
  role: 'client' | 'lawyer' | 'admin';
  name: string;
  email: string;
  mobile: string;
  city?: string;
  language?: string;
  avatarUrl?: string;
  isBlocked?: boolean;
  freeCallMinutesRemaining?: number;
  freeChatsRemaining?: number;
  fcmToken?: string;
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface LawyerProfile {
  userId: string;
  barCouncilNumber: string;
  stateBarCouncil: string;
  aadhaar: string;
  pan: string;
  bio: string;
  experienceYears: number;
  languages: string[];
  categories: string[];
  chatPricePerMinute: number;
  voicePricePerMinute: number;
  videoPricePerMinute: number;
  verificationStatus: VerificationStatus;
  isOnline: boolean;
  rating: number;
  reviewCount: number;
  practiceCertificateUrl?: string;
  practiceState?: string;
  practiceDistrict?: string;
  llbGraduationYear?: number;
  llbUniversity?: string;
  barAssociationName?: string;
  placeOfPractice?: string;
  enrollmentCertificateUrl?: string;
  copUrl?: string;
  llbCertificateUrl?: string;
  subscriptionExpiresAt?: string;
}

export type ConsultationType = 'chat' | 'voice' | 'video';
export type ConsultationStatus = 'requested' | 'active' | 'completed' | 'cancelled';

export interface Consultation {
  id: string;
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  type: ConsultationType;
  status: ConsultationStatus;
  startedAt?: string;
  endedAt?: string;
  totalMinutes?: number;
  ratePerMinute: number;
  totalCost?: number;
  lawyerReceipt?: number;
  platformCommission?: number;
  agoraChannelName?: string;
}

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Wallet {
  userId: string;
  balance: number;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'deposit' | 'deduction' | 'credit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  timestamp: string;
}

export interface Review {
  id: string;
  consultationId: string;
  clientName: string;
  lawyerId: string;
  rating: number;
  feedback: string;
  timestamp: string;
}

export interface WithdrawalRequest {
  id: string;
  lawyerId: string;
  lawyerName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bankHolderName: string;
  bankAccountNumber: string;
  ifscCode: string;
  timestamp: string;
  approved_at?: string;
}

export interface CommissionLog {
  id: string;
  consultationId: string;
  totalAmount: number;
  lawyerShare: number;
  platformShare: number;
  timestamp: string;
}

export interface SystemStats {
  totalClients: number;
  totalLawyers: number;
  totalRevenue: number;
  commissionRevenue: number;
  consultationCount: number;
}

export const STATE_DISTRICTS: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Anantapur", "Chittoor", "East Godavari", "West Godavari"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Changlang", "West Kameng", "Papum Pare"],
  "Assam": ["Kamrup Metropolitan (Guwahati)", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Arrah"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Bhilai", "Korba", "Rajnandgaon"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Rohtak", "Hisar", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Kangra"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
  "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davangere"],
  "Kerala": ["Thiruvananthapuram", "Kochi (Ernakulam)", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Kottayam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Ratlam"],
  "Maharashtra": ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Kolhapur", "Solapur"],
  "Manipur": ["Imphal East", "Imphal West", "Thoubal", "Churachandpur"],
  "Meghalaya": ["Shillong (East Khasi Hills)", "West Garo Hills", "Jaintia Hills"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar (Khordha)", "Cuttack", "Rourkela", "Sambalpur", "Puri", "Balasore"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali (SAS Nagar)"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar"],
  "Sikkim": ["Gangtok (East Sikkim)", "Mangan (North Sikkim)", "Namchi (South Sikkim)"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Vellore"],
  "Telangana": ["Hyderabad", "Secunderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Tripura": ["Agartala (West Tripura)", "Unakoti", "Dhalai"],
  "Uttar Pradesh": ["Lucknow", "Noida (Gautam Buddha Nagar)", "Kanpur", "Ghaziabad", "Prayagraj", "Varanasi", "Agra", "Meerut", "Bareilly"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Haldwani", "Roorkee"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur", "Kharagpur", "24 Parganas"],
  "Chandigarh": ["Chandigarh"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Ladakh": ["Leh", "Kargil"],
  "Andaman & Nicobar Islands": ["Port Blair (South Andaman)", "North & Middle Andaman", "Nicobar"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Lakshadweep": ["Kavaratti"]
};

export interface CaseDocument {
  id: string;
  name: string;
  url: string;
  uploadedBy: 'client' | 'lawyer';
  uploadedAt: string;
}

export interface Case {
  id: string;
  clientId: string;
  clientName: string;
  lawyerId?: string;
  lawyerName?: string;
  title: string;
  description: string;
  category: string;
  status: 'searching' | 'ongoing' | 'closed';
  documents: CaseDocument[];
  createdAt: string;
}

