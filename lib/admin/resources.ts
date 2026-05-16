export type AdminResourceKey =
  | 'users'
  | 'admins'
  | 'sessions'
  | 'twoFactor'
  | 'accounts'
  | 'equity'
  | 'trades'
  | 'challenges'
  | 'coupons'
  | 'orders'
  | 'payouts'
  | 'kyc'
  | 'kycDocuments'
  | 'affiliates'
  | 'affiliateReferrals'
  | 'tickets'
  | 'supportMessages'
  | 'blog'
  | 'notifications'
  | 'aiChatSessions'
  | 'aiChatMessages'
  | 'webhooks'
  | 'audits'
  | 'siteAccessLogs'
  | 'userDevices'
  | 'securityEvents'
  | 'blockedIps';

export type AdminResourceConfig = {
  key: AdminResourceKey;
  label: string;
  description: string;
  table: string;
  idColumn: string;
  titleColumn: string;
  searchable: string[];
  columns: string[];
  editable: string[];
  filterOptions?: Record<string, string[]>;
  fixedFilters?: Array<{ column: string; values: string[] }>;
  createDefaults: Record<string, unknown>;
  readOnly?: boolean;
};

export const adminResources: Record<AdminResourceKey, AdminResourceConfig> = {
  users: {
    key: 'users',
    label: 'Users',
    description: 'Search, verify, ban, update roles, and create trader/admin accounts.',
    table: 'profiles',
    idColumn: 'id',
    titleColumn: 'email',
    searchable: ['email', 'first_name', 'last_name', 'phone', 'country'],
    columns: ['id', 'email', 'first_name', 'last_name', 'role', 'kyc_status', 'country', 'preferred_platform', 'two_factor_enabled', 'is_banned', 'is_deleted', 'created_at'],
    editable: ['email', 'first_name', 'last_name', 'phone', 'country', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'nationality', 'tax_country', 'preferred_platform', 'trading_experience', 'referral_source', 'role', 'kyc_status', 'two_factor_required', 'is_banned', 'is_deleted', 'deletion_reason', 'marketing_opt_in'],
    filterOptions: {
      role: ['trader', 'admin', 'super_admin'],
      kyc_status: ['unverified', 'pending', 'approved', 'rejected'],
      is_banned: ['true', 'false'],
      is_deleted: ['true', 'false'],
    },
    createDefaults: { email: '', password: '', first_name: '', last_name: '', phone: '', country: '', address_line1: '', city: '', nationality: '', preferred_platform: 'MT5', trading_experience: 'Beginner', role: 'trader', kyc_status: 'unverified', is_banned: false, is_deleted: false },
  },
  admins: {
    key: 'admins',
    label: 'Admin Accounts',
    description: 'Create, edit, disable, and audit admin and super admin access for the operations console.',
    table: 'profiles',
    idColumn: 'id',
    titleColumn: 'email',
    searchable: ['email', 'first_name', 'last_name', 'phone', 'country'],
    columns: ['id', 'email', 'first_name', 'last_name', 'role', 'country', 'two_factor_enabled', 'two_factor_required', 'is_banned', 'is_deleted', 'created_at'],
    editable: ['email', 'first_name', 'last_name', 'phone', 'country', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'nationality', 'tax_country', 'role', 'two_factor_required', 'is_banned', 'is_deleted', 'deletion_reason'],
    filterOptions: {
      role: ['admin', 'super_admin'],
      two_factor_required: ['true', 'false'],
      is_banned: ['true', 'false'],
      is_deleted: ['true', 'false'],
    },
    fixedFilters: [{ column: 'role', values: ['admin', 'super_admin'] }],
    createDefaults: { email: '', password: '', first_name: '', last_name: '', phone: '', country: '', role: 'admin', two_factor_required: true, is_banned: false },
  },
  sessions: {
    key: 'sessions',
    label: 'Sessions',
    description: 'Review and revoke user sessions, refresh token hashes, devices, IPs, and expiry.',
    table: 'sessions',
    idColumn: 'id',
    titleColumn: 'user_agent',
    searchable: ['user_agent', 'refresh_token_hash'],
    columns: ['id', 'user_id', 'user_agent', 'ip', 'revoked_at', 'expires_at', 'created_at'],
    editable: ['user_id', 'refresh_token_hash', 'user_agent', 'ip', 'revoked_at', 'expires_at'],
    filterOptions: { revoked_at: ['null'] },
    createDefaults: { user_id: '', refresh_token_hash: '', user_agent: '', expires_at: new Date(Date.now() + 7 * 86400000).toISOString() },
  },
  twoFactor: {
    key: 'twoFactor',
    label: '2FA Secrets',
    description: 'Manage 2FA enrollment records and recovery-code storage metadata.',
    table: 'two_factor_secrets',
    idColumn: 'user_id',
    titleColumn: 'user_id',
    searchable: ['secret_ciphertext'],
    columns: ['user_id', 'confirmed_at', 'created_at'],
    editable: ['user_id', 'secret_ciphertext', 'backup_code_hashes', 'confirmed_at'],
    createDefaults: { user_id: '', secret_ciphertext: '', backup_code_hashes: [], confirmed_at: null },
  },
  accounts: {
    key: 'accounts',
    label: 'Trading Accounts',
    description: 'Provision, reset, flag, phase-progress, and monitor trading account status.',
    table: 'trading_accounts',
    idColumn: 'id',
    titleColumn: 'account_number',
    searchable: ['account_number', 'broker', 'platform', 'status'],
    columns: ['id', 'user_id', 'account_number', 'platform', 'phase', 'status', 'starting_balance', 'balance', 'equity', 'created_at'],
    editable: ['user_id', 'challenge_tier_id', 'account_number', 'broker', 'broker_server', 'platform', 'phase', 'status', 'starting_balance', 'balance', 'equity', 'high_watermark_equity', 'daily_start_equity', 'breached_reason'],
    filterOptions: {
      platform: ['MT4', 'MT5', 'cTrader', 'Match-Trader'],
      phase: ['phase_1', 'phase_2', 'funded'],
      status: ['pending', 'active', 'passed', 'breached', 'funded', 'suspended', 'closed'],
    },
    createDefaults: { platform: 'MT5', phase: 'phase_1', status: 'pending', starting_balance: 10000, balance: 10000, equity: 10000, high_watermark_equity: 10000, daily_start_equity: 10000 },
  },
  equity: {
    key: 'equity',
    label: 'Equity Points',
    description: 'Inspect and correct account balance/equity history used by charts and drawdown checks.',
    table: 'account_equity_points',
    idColumn: 'id',
    titleColumn: 'account_id',
    searchable: [],
    columns: ['id', 'account_id', 'balance', 'equity', 'drawdown_pct', 'recorded_at'],
    editable: ['account_id', 'balance', 'equity', 'drawdown_pct', 'recorded_at'],
    createDefaults: { account_id: '', balance: 0, equity: 0, drawdown_pct: 0 },
  },
  trades: {
    key: 'trades',
    label: 'Trades',
    description: 'Manage synced broker trades, journal data, raw payloads, and PnL values.',
    table: 'trades',
    idColumn: 'id',
    titleColumn: 'symbol',
    searchable: ['broker_trade_id', 'symbol', 'side'],
    columns: ['id', 'account_id', 'broker_trade_id', 'symbol', 'side', 'volume', 'profit', 'opened_at', 'closed_at'],
    editable: ['account_id', 'broker_trade_id', 'symbol', 'side', 'volume', 'open_price', 'close_price', 'stop_loss', 'take_profit', 'commission', 'swap', 'profit', 'opened_at', 'closed_at', 'raw_payload'],
    filterOptions: { side: ['buy', 'sell'] },
    createDefaults: { account_id: '', symbol: '', side: 'buy', volume: 0.01, open_price: 0, commission: 0, swap: 0, profit: 0, opened_at: new Date().toISOString(), raw_payload: {} },
  },
  challenges: {
    key: 'challenges',
    label: 'Challenges',
    description: 'Create and tune challenge tiers, drawdown rules, targets, prices, and platforms.',
    table: 'challenge_tiers',
    idColumn: 'id',
    titleColumn: 'name',
    searchable: ['slug', 'name', 'model'],
    columns: ['id', 'slug', 'name', 'model', 'account_size', 'price', 'profit_split_pct', 'is_active', 'sort_order'],
    editable: ['slug', 'name', 'model', 'account_size', 'price', 'currency', 'phase1_profit_target_pct', 'phase2_profit_target_pct', 'daily_drawdown_pct', 'max_drawdown_pct', 'min_trading_days', 'duration_days', 'profit_split_pct', 'leverage', 'platform', 'is_active', 'sort_order', 'metadata'],
    filterOptions: {
      model: ['instant', 'one_step', 'two_step'],
      is_active: ['true', 'false'],
    },
    createDefaults: { slug: '', name: '', model: 'two_step', account_size: 10000, price: 99, currency: 'USD', phase1_profit_target_pct: 10, phase2_profit_target_pct: 5, daily_drawdown_pct: 5, max_drawdown_pct: 10, min_trading_days: 3, profit_split_pct: 80, leverage: '1:100', platform: ['MT5'], is_active: true, sort_order: 100, metadata: {} },
  },
  coupons: {
    key: 'coupons',
    label: 'Coupons',
    description: 'Create and expire discount codes, fixed discounts, percentage offers, and redemption caps.',
    table: 'coupons',
    idColumn: 'id',
    titleColumn: 'code',
    searchable: ['code'],
    columns: ['id', 'code', 'discount_pct', 'discount_amount', 'max_redemptions', 'redeemed_count', 'is_active', 'expires_at'],
    editable: ['code', 'discount_pct', 'discount_amount', 'max_redemptions', 'redeemed_count', 'starts_at', 'expires_at', 'is_active'],
    filterOptions: { is_active: ['true', 'false'] },
    createDefaults: { code: '', discount_pct: 10, discount_amount: null, max_redemptions: null, redeemed_count: 0, is_active: true },
  },
  orders: {
    key: 'orders',
    label: 'Orders',
    description: 'Review challenge purchases, invoices, payment providers, and payment state.',
    table: 'challenge_orders',
    idColumn: 'id',
    titleColumn: 'provider_reference',
    searchable: ['status', 'provider', 'provider_reference', 'currency'],
    columns: ['id', 'user_id', 'challenge_tier_id', 'amount', 'currency', 'status', 'provider', 'paid_at', 'created_at'],
    editable: ['user_id', 'challenge_tier_id', 'coupon_id', 'amount', 'currency', 'status', 'provider', 'provider_reference', 'invoice_url', 'paid_at'],
    filterOptions: {
      status: ['draft', 'pending', 'paid', 'failed', 'refunded', 'cancelled'],
      provider: ['stripe', 'nowpayments', 'coingate', 'manual'],
    },
    createDefaults: { amount: 0, currency: 'USD', status: 'draft' },
  },
  payouts: {
    key: 'payouts',
    label: 'Payouts',
    description: 'Approve, reject, track, and audit withdrawal requests and profit splits.',
    table: 'payout_requests',
    idColumn: 'id',
    titleColumn: 'method',
    searchable: ['method', 'status', 'admin_note'],
    columns: ['id', 'user_id', 'account_id', 'gross_amount', 'trader_amount', 'method', 'status', 'created_at'],
    editable: ['user_id', 'account_id', 'gross_amount', 'profit_split_pct', 'trader_amount', 'method', 'destination', 'status', 'admin_note', 'reviewed_by', 'reviewed_at', 'paid_at'],
    filterOptions: {
      status: ['pending', 'approved', 'rejected', 'processing', 'paid', 'cancelled'],
      method: ['USDT', 'bank_transfer', 'skrill', 'neteller', 'manual'],
    },
    createDefaults: { user_id: '', account_id: '', gross_amount: 0, profit_split_pct: 80, trader_amount: 0, method: 'USDT', destination: {}, status: 'pending' },
  },
  kyc: {
    key: 'kyc',
    label: 'KYC',
    description: 'Review identity submissions, provider references, rejection reasons, and status.',
    table: 'kyc_submissions',
    idColumn: 'id',
    titleColumn: 'provider_reference',
    searchable: ['provider', 'provider_reference', 'status', 'rejection_reason'],
    columns: ['id', 'user_id', 'provider', 'provider_reference', 'status', 'id_document_type', 'proof_of_address_type', 'reviewed_by', 'reviewed_at', 'created_at'],
    editable: ['user_id', 'provider', 'provider_reference', 'status', 'rejection_reason', 'reviewed_by', 'reviewed_at', 'legal_first_name', 'legal_last_name', 'date_of_birth', 'residential_address', 'id_document_type', 'id_document_number', 'proof_of_address_type'],
    filterOptions: {
      status: ['unverified', 'pending', 'approved', 'rejected'],
      provider: ['manual', 'sumsub', 'veriff', 'stripe_identity'],
    },
    createDefaults: { user_id: '', provider: 'manual', status: 'pending', legal_first_name: '', legal_last_name: '', residential_address: {}, id_document_type: 'Passport', proof_of_address_type: 'Bank Statement' },
  },
  kycDocuments: {
    key: 'kycDocuments',
    label: 'KYC Documents',
    description: 'Inspect uploaded identity and proof-of-address document records and review status.',
    table: 'kyc_documents',
    idColumn: 'id',
    titleColumn: 'document_type',
    searchable: ['document_type', 'storage_path', 'status'],
    columns: ['id', 'submission_id', 'document_type', 'storage_path', 'status', 'created_at'],
    editable: ['submission_id', 'document_type', 'storage_path', 'status'],
    filterOptions: { status: ['unverified', 'pending', 'approved', 'rejected'] },
    createDefaults: { submission_id: '', document_type: 'id', storage_path: '', status: 'pending' },
  },
  affiliates: {
    key: 'affiliates',
    label: 'Affiliates',
    description: 'Manage referral codes, approvals, and commission percentages.',
    table: 'affiliates',
    idColumn: 'user_id',
    titleColumn: 'referral_code',
    searchable: ['referral_code'],
    columns: ['user_id', 'referral_code', 'commission_pct', 'approved_at', 'created_at'],
    editable: ['user_id', 'referral_code', 'commission_pct', 'approved_at'],
    createDefaults: { referral_code: '', commission_pct: 10 },
  },
  affiliateReferrals: {
    key: 'affiliateReferrals',
    label: 'Affiliate Referrals',
    description: 'Track referred users, linked orders, commissions, and referral payout status.',
    table: 'affiliate_referrals',
    idColumn: 'id',
    titleColumn: 'status',
    searchable: ['status'],
    columns: ['id', 'affiliate_user_id', 'referred_user_id', 'order_id', 'commission_amount', 'status', 'created_at'],
    editable: ['affiliate_user_id', 'referred_user_id', 'order_id', 'commission_amount', 'status'],
    filterOptions: { status: ['pending', 'approved', 'paid', 'rejected'] },
    createDefaults: { affiliate_user_id: '', referred_user_id: '', commission_amount: 0, status: 'pending' },
  },
  tickets: {
    key: 'tickets',
    label: 'Support Tickets',
    description: 'Triage support queue, priorities, assignments, and ticket status.',
    table: 'support_tickets',
    idColumn: 'id',
    titleColumn: 'subject',
    searchable: ['subject', 'status', 'priority'],
    columns: ['id', 'user_id', 'subject', 'status', 'priority', 'assigned_to', 'created_at'],
    editable: ['user_id', 'subject', 'status', 'priority', 'assigned_to'],
    filterOptions: {
      status: ['open', 'pending', 'resolved', 'closed'],
      priority: ['low', 'normal', 'high', 'urgent'],
    },
    createDefaults: { subject: '', status: 'open', priority: 'normal' },
  },
  supportMessages: {
    key: 'supportMessages',
    label: 'Support Messages',
    description: 'Moderate ticket replies, internal notes, and author-linked support history.',
    table: 'support_messages',
    idColumn: 'id',
    titleColumn: 'body',
    searchable: ['body'],
    columns: ['id', 'ticket_id', 'author_id', 'is_internal', 'created_at'],
    editable: ['ticket_id', 'author_id', 'body', 'is_internal'],
    filterOptions: { is_internal: ['true', 'false'] },
    createDefaults: { ticket_id: '', author_id: '', body: '', is_internal: false },
  },
  blog: {
    key: 'blog',
    label: 'Blog',
    description: 'Manage CMS posts, publishing status, content, authors, and SEO copy.',
    table: 'blog_posts',
    idColumn: 'id',
    titleColumn: 'title',
    searchable: ['slug', 'title', 'excerpt', 'status'],
    columns: ['id', 'slug', 'title', 'status', 'author_id', 'published_at', 'created_at'],
    editable: ['slug', 'title', 'excerpt', 'content', 'cover_image_url', 'status', 'author_id', 'published_at'],
    filterOptions: {
      status: ['draft', 'published', 'archived'],
    },
    createDefaults: { slug: '', title: '', excerpt: '', content: '', status: 'draft' },
  },
  notifications: {
    key: 'notifications',
    label: 'Notifications',
    description: 'Create in-app, email, SMS, and webhook notifications or blasts.',
    table: 'notifications',
    idColumn: 'id',
    titleColumn: 'title',
    searchable: ['title', 'body', 'channel'],
    columns: ['id', 'user_id', 'channel', 'title', 'read_at', 'created_at'],
    editable: ['user_id', 'channel', 'title', 'body', 'metadata', 'read_at'],
    filterOptions: {
      channel: ['in_app', 'email', 'sms', 'webhook'],
    },
    createDefaults: { channel: 'in_app', title: '', body: '', metadata: {} },
  },
  aiChatSessions: {
    key: 'aiChatSessions',
    label: 'AI Chat Sessions',
    description: 'Review AI support sessions tied to users or anonymous visitors.',
    table: 'ai_chat_sessions',
    idColumn: 'id',
    titleColumn: 'title',
    searchable: ['visitor_id', 'title'],
    columns: ['id', 'user_id', 'visitor_id', 'title', 'created_at', 'updated_at'],
    editable: ['user_id', 'visitor_id', 'title'],
    createDefaults: { user_id: null, visitor_id: '', title: '' },
  },
  aiChatMessages: {
    key: 'aiChatMessages',
    label: 'AI Chat Messages',
    description: 'Inspect and moderate AI support conversation messages and metadata.',
    table: 'ai_chat_messages',
    idColumn: 'id',
    titleColumn: 'role',
    searchable: ['role', 'content'],
    columns: ['id', 'session_id', 'role', 'content', 'created_at'],
    editable: ['session_id', 'role', 'content', 'metadata'],
    filterOptions: { role: ['user', 'assistant', 'system'] },
    createDefaults: { session_id: '', role: 'assistant', content: '', metadata: {} },
  },
  webhooks: {
    key: 'webhooks',
    label: 'Webhook Events',
    description: 'Inspect payment, KYC, broker, and notification webhook payload processing.',
    table: 'webhook_events',
    idColumn: 'id',
    titleColumn: 'event_type',
    searchable: ['provider', 'event_type', 'external_id'],
    columns: ['id', 'provider', 'event_type', 'external_id', 'processed_at', 'created_at'],
    editable: ['provider', 'event_type', 'external_id', 'payload', 'processed_at'],
    filterOptions: { provider: ['stripe', 'nowpayments', 'coingate', 'sumsub', 'veriff', 'broker', 'sendgrid', 'resend'] },
    createDefaults: { provider: '', event_type: '', external_id: '', payload: {}, processed_at: null },
  },
  audits: {
    key: 'audits',
    label: 'Audit Logs',
    description: 'Immutable admin action trail showing who changed what and when.',
    table: 'audit_logs',
    idColumn: 'id',
    titleColumn: 'action',
    searchable: ['action', 'entity_table', 'entity_id'],
    columns: ['id', 'actor_id', 'action', 'entity_table', 'entity_id', 'created_at'],
    editable: [],
    createDefaults: {},
    readOnly: true,
  },
  siteAccessLogs: {
    key: 'siteAccessLogs',
    label: 'Access Logs',
    description: 'Review visitor access by IP, country, path, device, bot flags, and timeframe.',
    table: 'site_access_logs',
    idColumn: 'id',
    titleColumn: 'path',
    searchable: ['path', 'host', 'country_code', 'country', 'user_agent', 'forwarded_for'],
    columns: ['id', 'user_id', 'method', 'path', 'client_ip', 'country_code', 'is_bot', 'threat_flags', 'created_at'],
    editable: [],
    filterOptions: {
      is_bot: ['true', 'false'],
    },
    createDefaults: {},
    readOnly: true,
  },
  userDevices: {
    key: 'userDevices',
    label: 'User Devices',
    description: 'Track trusted and suspicious devices seen during signup, signin, and account access.',
    table: 'user_devices',
    idColumn: 'id',
    titleColumn: 'label',
    searchable: ['label', 'fingerprint_hash', 'country_code', 'country', 'user_agent'],
    columns: ['id', 'user_id', 'label', 'client_ip', 'country_code', 'is_blocked', 'login_count', 'signup_count', 'last_seen_at'],
    editable: ['label', 'is_blocked', 'block_reason', 'risk_flags'],
    filterOptions: {
      is_blocked: ['true', 'false'],
    },
    createDefaults: { label: '', is_blocked: false, risk_flags: [] },
  },
  securityEvents: {
    key: 'securityEvents',
    label: 'Security Events',
    description: 'Review bot, captcha, injection, suspicious-login, and provider security events.',
    table: 'security_events',
    idColumn: 'id',
    titleColumn: 'event_type',
    searchable: ['event_type', 'severity', 'country_code', 'user_agent'],
    columns: ['id', 'user_id', 'event_type', 'severity', 'client_ip', 'country_code', 'created_at'],
    editable: [],
    filterOptions: {
      severity: ['info', 'warning', 'high', 'critical'],
    },
    createDefaults: {},
    readOnly: true,
  },
  blockedIps: {
    key: 'blockedIps',
    label: 'Blocked IPs',
    description: 'Block or unblock IP addresses from opening the website.',
    table: 'blocked_ip_addresses',
    idColumn: 'id',
    titleColumn: 'ip_address',
    searchable: ['reason'],
    columns: ['id', 'ip_address', 'reason', 'is_active', 'blocked_by', 'blocked_at', 'expires_at'],
    editable: ['ip_address', 'reason', 'is_active', 'expires_at'],
    filterOptions: {
      is_active: ['true', 'false'],
    },
    createDefaults: { ip_address: '', reason: '', is_active: true, expires_at: null },
  },
};

export const adminResourceList = Object.values(adminResources);

export function getAdminResource(key: string) {
  return adminResources[key as AdminResourceKey];
}
