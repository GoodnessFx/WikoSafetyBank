import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
  useRef,
} from "react"
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  CreditCard,
  Eye,
  EyeOff,
  Globe2,
  Headphones,
  Home,
  Languages,
  LockKeyhole,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  UserRound,
  WalletCards,
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Landmark,
  FileText,
  Sliders,
  DollarSign,
  TrendingUp,
  Download,
  AlertTriangle,
  UserCheck,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Truck,
  Package,
  Globe,
  Phone,
} from "lucide-react"
import {
  INITIAL_USER,
  INITIAL_CLIENTS,
  INITIAL_CARDS,
  INITIAL_TRANSACTIONS,
  POPULAR_BANKS,
  ADMIN_MASTER_PASSWORD,
  type UserProfile,
  type Transaction,
  type BankCard,
  type CardOrder,
} from "./bankData"

type View = "home" | "transfer" | "wallet" | "cards" | "activity" | "settings" | "support" | "admin"
type ModalType = "deposit" | "withdraw" | "transfer" | "verify" | "adminLogin" | "receipt" | "requestCard" | "orderConfirmation" | null

function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "icon" | "danger"
}) {
  const variantClass = variant === "danger" ? "button-danger" : `button-${variant}`
  return (
    <button className={`button ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  )
}

function Brand({
  compact = false,
  onAdminClick,
}: {
  compact?: boolean
  onAdminClick?: () => void
}) {
  return (
    <div
      className="brand"
      aria-label="Wikosafetybank"
      onClick={onAdminClick}
      title="Wiko Safety Bank (Double click for Admin)"
      style={{ cursor: onAdminClick ? "pointer" : "default" }}
    >
      <span className="brand-mark">
        <ShieldCheck size={22} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span>
          Wikosafety<span className="brand-light">bank</span>
        </span>
      )}
    </div>
  )
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`panel ${className}`}>{children}</section>
}

export default function App() {
  // State Persistence with LocalStorage
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("wiko_current_user")
    return saved ? JSON.parse(saved) : INITIAL_USER
  })

  const [clients, setClients] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem("wiko_clients")
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS
  })

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("wiko_transactions")
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS
  })

  const [cards, setCards] = useState<BankCard[]>(() => {
    const saved = localStorage.getItem("wiko_cards")
    return saved ? JSON.parse(saved) : INITIAL_CARDS
  })

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("wiko_admin_auth") === "true"
  })

  // New state for physical card orders
  const [cardOrders, setCardOrders] = useState<CardOrder[]>(() => {
    const saved = localStorage.getItem("wiko_card_orders")
    return saved ? JSON.parse(saved) : []
  });
  const [currentOrder, setCurrentOrder] = useState<CardOrder | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("wiko_sidebar_collapsed") === "true"
  })

  const [view, setView] = useState<View>("home")
  const [modal, setModal] = useState<ModalType>(null)
  const [splash, setSplash] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("wiko_current_user", JSON.stringify(currentUser))
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem("wiko_clients", JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    localStorage.setItem("wiko_transactions", JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem("wiko_cards", JSON.stringify(cards))
  }, [cards])

  useEffect(() => {
    localStorage.setItem("wiko_card_orders", JSON.stringify(cardOrders))
  }, [cardOrders])

  useEffect(() => {
    localStorage.setItem("wiko_admin_auth", String(isAdminAuthenticated))
  }, [isAdminAuthenticated])

  useEffect(() => {
    localStorage.setItem("wiko_sidebar_collapsed", String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    const timer = window.setTimeout(() => setSplash(false), 700)
    return () => window.clearTimeout(timer)
  }, [])

  // Keyboard shortcut for secret admin: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault()
        if (isAdminAuthenticated) {
          setView("admin")
          showToast("Welcome to Administrator Portal")
        } else {
          setModal("adminLogin")
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isAdminAuthenticated])

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 4000)
  }

  // Update current user balance & sync in clients list
  const updateUserRecord = (updated: UserProfile) => {
    setCurrentUser(updated)
    setClients((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )
  }

  // Add transaction helper
  const addTransaction = (tx: Omit<Transaction, "id" | "timestamp" | "reference">) => {
    const refCode = `WIKO-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}`,
      reference: refCode,
      timestamp: "Just now",
    }
    setTransactions((prev) => [newTx, ...prev])
    return newTx
  }

  // Admin switch client
  const switchClient = (client: UserProfile) => {
    setCurrentUser(client)
    showToast(`Switched active view to client: ${client.name}`)
  }

  return (
    <div className={`app-shell ${isSidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="toast-banner">
          <Sparkles size={16} />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="toast-close">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        view={view}
        setView={setView}
        currentUser={currentUser}
        isAdmin={isAdminAuthenticated}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenAdmin={() => {
          if (isAdminAuthenticated) {
            setView("admin")
          } else {
            setModal("adminLogin")
          }
        }}
      />

      <div className={`app-main ${isSidebarCollapsed ? "app-main-expanded" : ""}`}>
        <Header
          currentUser={currentUser}
          isAdmin={isAdminAuthenticated}
          onMenu={() => setMobileMenu(true)}
          onAdminClick={() => {
            if (isAdminAuthenticated) {
              setView("admin")
            } else {
              setModal("adminLogin")
            }
          }}
          onVerificationClick={() => setModal("verify")}
        />

        <main>
          {view === "home" && (
            <HomeView
              user={currentUser}
              transactions={transactions.filter((t) => t.userId === currentUser.id)}
              card={cards[0]}
              setModal={setModal}
              setView={setView}
              showToast={showToast}
            />
          )}

          {view === "transfer" && (
            <TransferView
              user={currentUser}
              showToast={showToast}
              onTransfer={(data) => {
                // Check $50 limit
                if (data.amount > currentUser.withdrawalLimit) {
                  showToast(`Transfer restricted: $${currentUser.withdrawalLimit.toFixed(2)} client limit applies!`)
                  return false
                }
                if (data.amount > currentUser.balanceUSD) {
                  showToast("Insufficient balance for transfer!")
                  return false
                }

                // Deduct balance
                const updated = {
                  ...currentUser,
                  balanceUSD: currentUser.balanceUSD - data.amount,
                }
                updateUserRecord(updated)

                const newTx = addTransaction({
                  userId: currentUser.id,
                  type: "transfer_out",
                  amount: data.amount,
                  currency: "USD",
                  title: `Transfer to ${data.bankName}`,
                  description: `Outbound wire transfer to ${data.recipientName} (Acct â€¢â€¢${data.accountNumber.slice(-4)})`,
                  recipientBank: data.bankName,
                  recipientAccount: data.accountNumber,
                  recipientName: data.recipientName,
                  status: "completed",
                })

                setSelectedTx(newTx)
                setModal("receipt")
                showToast(`Successfully transferred $${data.amount.toFixed(2)} to ${data.bankName}`)
                return true
              }}
            />
          )}

          {view === "wallet" && (
            <WalletView
              user={currentUser}
              setModal={setModal}
              showToast={showToast}
            />
          )}

          {view === "cards" && (
            <CardsView
              cards={cards}
              user={currentUser}
              showToast={showToast}
              onToggleFreeze={(id) => {
                setCards((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, isFrozen: !c.isFrozen } : c))
                )
                showToast("Card status updated successfully.")
              }}
            />
          )}

          {view === "activity" && (
            <ActivityView
              transactions={transactions.filter((t) => t.userId === currentUser.id)}
              showToast={showToast}
              onSelectTx={(tx) => {
                setSelectedTx(tx)
                setModal("receipt")
              }}
            />
          )}

          {view === "settings" && (
            <SettingsView
              user={currentUser}
              onUpdateUser={(updated) => {
                updateUserRecord(updated)
                showToast("Settings and profile updated successfully!")
              }}
              onOpenVerification={() => setModal("verify")}
              onOpenAdmin={() => {
                if (isAdminAuthenticated) {
                  setView("admin")
                } else {
                  setModal("adminLogin")
                }
              }}
            />
          )}

          {view === "support" && <SupportView user={currentUser} />}

          {view === "admin" && (
            <AdminPortalView
              clients={clients}
              transactions={transactions}
              currentUser={currentUser}
              onSwitchClient={switchClient}
              onUpdateClients={setClients}
              onUpdateCurrentUser={setCurrentUser}
              onAddTransaction={addTransaction}
              onLogoutAdmin={() => {
                setIsAdminAuthenticated(false)
                setView("home")
                showToast("Admin logged out.")
              }}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {[
          { id: "home" as View, label: "Home", icon: Home },
          { id: "transfer" as View, label: "Transfer", icon: Send },
          { id: "wallet" as View, label: "Wallet", icon: WalletCards },
          { id: "cards" as View, label: "Cards", icon: CreditCard },
          { id: "settings" as View, label: "Settings", icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            className={view === id ? "bottom-item active" : "bottom-item"}
            onClick={() => setView(id)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Button>
        ))}
      </nav>

      {/* Mobile Sheet Menu */}
      {mobileMenu && (
        <div className="mobile-sheet">
          <div className="sheet-head">
            <Brand />
            <Button variant="icon" onClick={() => setMobileMenu(false)}>
              <X size={20} />
            </Button>
          </div>
          {[
            { id: "home" as View, label: "Home Dashboard", icon: Home },
            { id: "transfer" as View, label: "Send & Transfer", icon: Send },
            { id: "wallet" as View, label: "Currency Wallets", icon: WalletCards },
            { id: "cards" as View, label: "Cards & Security", icon: CreditCard },
            { id: "activity" as View, label: "Activity Ledger", icon: Clock3 },
            { id: "settings" as View, label: "Bank Settings & KYC", icon: Settings },
            { id: "support" as View, label: "Live Support Concierge", icon: Headphones },
            { id: "admin" as View, label: "Admin Operations Panel", icon: KeyRound },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              className={view === id ? "nav-item active" : "nav-item"}
              onClick={() => {
                if (id === "admin" && !isAdminAuthenticated) {
                  setMobileMenu(false)
                  setModal("adminLogin")
                  return
                }
                setView(id)
                setMobileMenu(false)
              }}
            >
              <Icon size={19} />
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* MODALS */}
      {modal === "deposit" && (
        <DepositModal
          user={currentUser}
          close={() => setModal(null)}
          onDeposit={(amount, method) => {
            const updated = {
              ...currentUser,
              balanceUSD: currentUser.balanceUSD + amount,
            }
            updateUserRecord(updated)
            const tx = addTransaction({
              userId: currentUser.id,
              type: "deposit",
              amount,
              currency: "USD",
              title: `Deposit via ${method}`,
              description: `Funds verified and settled to USD Checking Account ending in â€¢â€¢${currentUser.accountNumber.slice(-4)}`,
              status: "completed",
            })
            setModal(null)
            setSelectedTx(tx)
            showToast(`Deposited $${amount.toFixed(2)} USD successfully!`)
          }}
        />
      )}

      {modal === "withdraw" && (
        <WithdrawModal
          user={currentUser}
          close={() => setModal(null)}
          onWithdraw={(amount, destination) => {
            if (amount > currentUser.withdrawalLimit) {
              showToast(`Exceeded $${currentUser.withdrawalLimit.toFixed(2)} client withdrawal limit!`)
              return
            }
            if (amount > currentUser.balanceUSD) {
              showToast("Insufficient balance to withdraw!")
              return
            }
            const updated = {
              ...currentUser,
              balanceUSD: currentUser.balanceUSD - amount,
            }
            updateUserRecord(updated)
            const tx = addTransaction({
              userId: currentUser.id,
              type: "withdrawal",
              amount,
              currency: "USD",
              title: "Client Cash Out / Withdrawal",
              description: `Direct payout to ${destination} under client limit`,
              status: "completed",
            })
            setModal(null)
            setSelectedTx(tx)
            showToast(`Withdrawal of $${amount.toFixed(2)} processed.`)
          }}
        />
      )}

      {modal === "verify" && (
        <VerificationModal
          user={currentUser}
          close={() => setModal(null)}
          onSubmitVerification={(docType, docNumber) => {
            const updated: UserProfile = {
              ...currentUser,
              isVerified: true,
              verificationStatus: "verified",
              idDocumentType: docType,
              idDocumentNumber: docNumber,
            }
            updateUserRecord(updated)
            setModal(null)
            showToast("Identity verified! Credentials approved and verified.")
          }}
        />
      )}

      {modal === "adminLogin" && (
        <AdminLoginModal
          close={() => setModal(null)}
          onSuccess={() => {
            setIsAdminAuthenticated(true)
            setModal(null)
            setView("admin")
            showToast("Master Admin privileges granted!")
          }}
        />
      )}

      {modal === "receipt" && selectedTx && (
        <ReceiptModal tx={selectedTx} close={() => setModal(null)} />
      )}

      {/* Request Card Modal */}
      {modal === "requestCard" && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-icon text-amber-500"><Truck size={22} /></div>
              <Button variant="icon" onClick={() => setModal(null)}><X size={18} /></Button>
            </div>
            <h2>Order Physical Card</h2>
            <p>Enter delivery details. You will be redirected to our shipping partner.</p>
            <form className="mt-4" onSubmit={e => {
              e.preventDefault();
              const form = e.currentTarget as any;
              const newOrder: CardOrder = {
                id: "ord_" + Date.now(),
                trackingNumber: "TBD",
                fullName: form.fullName.value,
                address: form.address.value,
                phone: form.phone.value,
                method: "Standard",
                timestamp: new Date().toISOString(),
                status: "Ordered",
              };
              setCardOrders(prev => [...prev, newOrder]);
              setCurrentOrder(newOrder);
              setModal("orderConfirmation");
            }}>
              <div className="form-group mb-3">
                <label>Full Name</label>
                <input name="fullName" type="text" required className="input-text" />
              </div>
              <div className="form-group mb-3">
                <label>Address</label>
                <input name="address" type="text" required className="input-text" />
              </div>
              <div className="form-group mb-3">
                <label>Phone Number</label>
                <input name="phone" type="text" required className="input-text" />
              </div>
              <Button type="submit" className="full">Submit Order</Button>
            </form>
          </div>
        </div>
       )}
{/* Order Confirmation Modal */}
      {modal === "orderConfirmation" && currentOrder && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-icon text-green-600"><Check size={22} /></div>
              <Button variant="icon" onClick={() => setModal(null)}><X size={18} /></Button>
            </div>
            <h2>Card Order Confirmation</h2>
            <p>Your order has been recorded.</p>
            <ul className="list-disc pl-5">
              <li><strong>Name:</strong> {currentOrder.fullName}</li>
              <li><strong>Address:</strong> {currentOrder.address}</li>
              <li><strong>Phone:</strong> {currentOrder.phone}</li>
            </ul>
            <Button className="full mt-3" onClick={() => {
              showToast("Redirecting to shipping partner...");
              window.open("https://wikoshipping.com", "_blank");
              setModal(null);
            }}>Proceed to Shipping</Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* =========================================================================
   SIDEBAR & HEADER
   ========================================================================= */

function Sidebar({
  view,
  setView,
  currentUser,
  isAdmin,
  isCollapsed,
  onToggleCollapse,
  onOpenAdmin,
}: {
  view: View
  setView: (view: View) => void
  currentUser: UserProfile
  isAdmin: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  onOpenAdmin: () => void
}) {
  const mainNav: { id: View; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Overview", icon: Home },
    { id: "transfer", label: "Transfer to Bank", icon: Send },
    { id: "wallet", label: "Currency Wallets", icon: WalletCards },
    { id: "cards", label: "Virtual Cards", icon: CreditCard },
    { id: "activity", label: "Transactions", icon: Clock3 },
  ]

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        <Brand compact={isCollapsed} onAdminClick={onOpenAdmin} />
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      <nav className="side-nav" aria-label="Main navigation">
        {!isCollapsed && <span className="nav-label">CLIENT BANKING</span>}
        {mainNav.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            title={isCollapsed ? label : undefined}
            className={view === id ? "nav-item active" : "nav-item"}
            onClick={() => setView(id)}
          >
            <Icon size={19} />
            {!isCollapsed && <span>{label}</span>}
          </Button>
        ))}

        {!isCollapsed && <span className="nav-label nav-label-spaced">SETTINGS & ASSISTANCE</span>}
        <Button
          variant="ghost"
          title={isCollapsed ? "Account Settings" : undefined}
          className={view === "settings" ? "nav-item active" : "nav-item"}
          onClick={() => setView("settings")}
        >
          <Settings size={19} />
          {!isCollapsed && <span>Account Settings</span>}
        </Button>
        <Button
          variant="ghost"
          title={isCollapsed ? "Support Desk" : undefined}
          className={view === "support" ? "nav-item active" : "nav-item"}
          onClick={() => setView("support")}
        >
          <Headphones size={19} />
          {!isCollapsed && <span>Support Desk</span>}
        </Button>


      </nav>

      {/* Sidebar footer: account chip + profile row */}
      <div className="sidebar-footer">
        {/* Account chip */}
        <div
          className="sidebar-account-chip"
          title={isCollapsed ? `Acct: ${currentUser.accountNumber}` : undefined}
        >
          <span className="sidebar-account-chip-icon">
            <Building2 size={17} />
          </span>
          {!isCollapsed && (
            <div className="sidebar-account-chip-text">
              <strong>Acct: {currentUser.accountNumber}</strong>
              <p>Routing: {currentUser.routingNumber}</p>
            </div>
          )}
        </div>

        {/* Profile row */}
        <div
          className={`profile-row ${isCollapsed ? "profile-row-compact" : ""}`}
          onClick={() => setView("settings")}
          title={isCollapsed ? currentUser.name : undefined}
        >
          <span className="avatar">{currentUser.avatar}</span>
          {!isCollapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong>{currentUser.name}</strong>
              {currentUser.isVerified ? (
                <span className="verified-tag" style={{ marginTop: 2 }}>
                  <Check size={9} /> Verified
                </span>
              ) : (
                <span className="unverified-tag" style={{ marginTop: 2 }}>Unverified</span>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

function Header({
  currentUser,
  isAdmin,
  onMenu,
  onAdminClick,
  onVerificationClick,
}: {
  currentUser: UserProfile
  isAdmin: boolean
  onMenu: () => void
  onAdminClick: () => void
  onVerificationClick: () => void
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="mobile-brand">
          <Brand onAdminClick={onAdminClick} />
        </div>
        <Button
          variant="icon"
          className="menu-button"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </Button>
      </div>

      <div className="topbar-actions">
        {/* Verification Status Pill */}
        <button
          className={`status-pill ${currentUser.isVerified ? "status-pill-verified" : "status-pill-unverified"}`}
          onClick={onVerificationClick}
          title="Click to view/verify ID credentials"
        >
          {currentUser.isVerified ? (
            <>
              <CheckCircle2 size={14} />
              <span>Verified Client</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              <span>Verify Credentials</span>
            </>
          )}
        </button>

        {/* Withdrawal limit badge */}
        <div className="limit-pill" title="Client Daily Withdrawal Limit">
          <ShieldAlert size={14} className="text-amber-500" />
          <span>Limit: ${currentUser.withdrawalLimit.toFixed(0)}</span>
        </div>

        {/* Hidden Admin Quick Key */}


        <div className="user-profile-badge">
          <span className="top-avatar">{currentUser.avatar}</span>
          <div className="user-profile-text">
            <strong>{currentUser.name}</strong>
            <small>Client</small>
          </div>
        </div>
      </div>
    </header>
  )
}

/* =========================================================================
   HOME VIEW
   ========================================================================= */

function HomeView({
  user,
  transactions,
  card,
  setModal,
  setView,
  showToast,
}: {
  user: UserProfile
  transactions: Transaction[]
  card?: BankCard
  setModal: (v: ModalType) => void
  setView: (v: View) => void
  showToast: (m: string) => void
}) {
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyAccountDetails = () => {
    navigator.clipboard.writeText(
      `Bank: ${user.bankName}\nAccount Name: ${user.name}\nAccount Number: ${user.accountNumber}\nRouting Number: ${user.routingNumber}\nSWIFT/BIC: ${user.swiftBic}`
    )
    setCopied(true)
    showToast("Full bank wire credentials copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="welcome-row">
        <div>
          <span className="date-label">WIKO INSTITUTIONAL SAFETY BANKING</span>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p>Real-time banking ledger and multi-currency treasury.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={copyAccountDetails}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>Account Wire Details</span>
          </Button>
          {!user.isVerified && (
            <Button onClick={() => setModal("verify")}>
              <Sparkles size={16} /> Verify Credentials
            </Button>
          )}
        </div>
      </div>

      {/* Client Credentials & Verification Notice */}
      {!user.isVerified ? (
        <div className="status-banner">
          <span>
            <AlertCircle size={20} className="text-amber-500" />
          </span>
          <div className="status-banner-content">
            <strong>Identity Credential Verification Required</strong>
            <p>
              Please verify your government ID to unlock higher transaction tiers.
              Current withdrawal limit is strictly enforced at <strong>${user.withdrawalLimit.toFixed(2)}</strong>.
            </p>
          </div>
          <Button variant="secondary" className="banner-action-btn" onClick={() => setModal("verify")}>
            Verify Now <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <div className="status-banner status-banner-verified">
          <span>
            <ShieldCheck size={20} className="text-emerald-500" />
          </span>
          <div className="status-banner-content">
            <strong>Verified Banking Client ({user.idDocumentType || "Passport"})</strong>
            <p>
              Assigned Account No: <strong>{user.accountNumber}</strong> &bull; Routing:{" "}
              <strong>{user.routingNumber}</strong> &bull; Client Withdrawal Policy:{" "}
              <strong>${user.withdrawalLimit.toFixed(2)} limit</strong>.
            </p>
          </div>
          <Button variant="secondary" className="banner-action-btn" onClick={copyAccountDetails}>
            <Copy size={15} /> Copy Credentials
          </Button>
        </div>
      )}

      {/* DASHBOARD GRID */}
      <div className="dashboard-grid">
        {/* Left column: balance hero + recent activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {/* Balance Hero Card */}
          <div className="balance-card">
            <div className="balance-top">
              <div>
                <span className="eyebrow light">TOTAL AVAILABLE BALANCE</span>
                <div className="balance-line">
                  <strong>
                    {balanceHidden
                      ? "$â€¢â€¢â€¢â€¢â€¢â€¢"
                      : `$${user.balanceUSD.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                  </strong>
                  <Button
                    variant="icon"
                    className="dark-icon"
                    onClick={() => setBalanceHidden(!balanceHidden)}
                    aria-label={balanceHidden ? "Show balance" : "Hide balance"}
                  >
                    {balanceHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                </div>
                <div className="balance-credentials-row">
                  <span>Acct: {user.accountNumber}</span>
                  <span>&bull;</span>
                  <span>Routing: {user.routingNumber}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                <span className="currency-pill">USD</span>
                <div className="client-limit-tag">$50 Limit Active</div>
              </div>
            </div>

            <div className="balance-actions">
              <button className="balance-action" onClick={() => setModal("deposit")}>
                <ArrowDownLeft size={16} /> Add Funds
              </button>
              <button className="balance-action" onClick={() => setView("transfer")}>
                <Send size={16} /> Transfer
              </button>
              <button className="balance-action" onClick={() => setModal("withdraw")}>
                <ArrowUpRight size={16} /> Withdraw
              </button>
            </div>

            <div className="balance-orbit orbit-one" />
            <div className="balance-orbit orbit-two" />
          </div>

          {/* Recent Transactions */}
          <Panel>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">RECENT ACTIVITY</span>
                <h2>Transactions</h2>
              </div>
              <Button variant="ghost" onClick={() => setView("activity")}>
                View all <ArrowRight size={15} />
              </Button>
            </div>
            {transactions.length === 0 ? (
              <div className="empty-state">
                <Clock3 size={22} className="text-blue-500" />
                <strong>No transactions yet</strong>
                <p>Deposits and transfers appear here in real-time.</p>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="tx-row">
                    <div className={`tx-icon tx-icon-${tx.type}`}>
                      {tx.type === "deposit" ? (
                        <ArrowDownLeft size={16} />
                      ) : tx.type === "transfer_out" || tx.type === "withdrawal" ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <CreditCard size={16} />
                      )}
                    </div>
                    <div className="tx-details">
                      <strong>{tx.title}</strong>
                      <span>{tx.description}</span>
                    </div>
                    <div className="tx-amount-col">
                      <strong
                        className={
                          tx.type === "deposit" || tx.type === "transfer_in"
                            ? "tx-positive"
                            : "tx-negative"
                        }
                      >
                        {tx.type === "deposit" || tx.type === "transfer_in" ? "+" : "-"}
                        ${tx.amount.toFixed(2)}
                      </strong>
                      <small>{tx.timestamp}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Right column: wallets + FX converter */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {/* Multi-Currency Wallets */}
          <Panel>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">MULTI-CURRENCY</span>
                <h2>Global Balances</h2>
              </div>
              <Button variant="ghost" onClick={() => setView("wallet")}>
                All <ArrowRight size={14} />
              </Button>
            </div>
            <div className="currency-list">
              <div className="currency-item">
                <div className="currency-flag">ðŸ‡ºðŸ‡¸</div>
                <div className="currency-info">
                  <strong>USD</strong>
                  <small>US Dollar</small>
                </div>
                <div className="currency-amount">
                  ${user.balanceUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="currency-item">
                <div className="currency-flag">ðŸ‡ªðŸ‡º</div>
                <div className="currency-info">
                  <strong>EUR</strong>
                  <small>Euro Â· SEPA</small>
                </div>
                <div className="currency-amount">
                  â‚¬{user.balanceEUR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="currency-item">
                <div className="currency-flag">ðŸ‡¬ðŸ‡§</div>
                <div className="currency-info">
                  <strong>GBP</strong>
                  <small>British Pound</small>
                </div>
                <div className="currency-amount">
                  Â£{user.balanceGBP.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="currency-item">
                <div className="currency-flag">ðŸ‡³ðŸ‡¬</div>
                <div className="currency-info">
                  <strong>NGN</strong>
                  <small>Nigerian Naira</small>
                </div>
                <div className="currency-amount">
                  â‚¦{user.balanceNGN.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </Panel>

          {/* FX Rate Calculator */}
          <Panel>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">LIVE RATES</span>
                <h2>FX Converter</h2>
              </div>
              <span className="live-dot">
                <i style={{ background: "#10b981" }} /> Live
              </span>
            </div>
            <LiveConverter user={user} showToast={showToast} />
          </Panel>
        </div>
      </div>
    </>
  )
}

/* =========================================================================
   TRANSFER VIEW (TRANSFER MONEY TO ANOTHER BANK)
   ========================================================================= */

function TransferView({
  user,
  onTransfer,
  showToast,
}: {
  user: UserProfile
  onTransfer: (data: {
    bankName: string
    recipientName: string
    accountNumber: string
    routingNumber: string
    amount: number
    note: string
  }) => boolean
  showToast?: (m: string) => void
}) {
  const [selectedBank, setSelectedBank] = useState(POPULAR_BANKS[0].name)
  const [customBank, setCustomBank] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [routingNumber, setRoutingNumber] = useState(POPULAR_BANKS[0].routing)
  const [amount, setAmount] = useState<string>("50")
  const [note, setNote] = useState("Invoice Settlement")
  const [transferType, setTransferType] = useState<"ach" | "wire" | "instant">("instant")
  const [isVerifying, setIsVerifying] = useState(false)
  const [validatedRecipient, setValidatedRecipient] = useState<string | null>(null)

  const numAmount = parseFloat(amount) || 0
  const isOverLimit = numAmount > user.withdrawalLimit

  const handleBankSelect = (bankName: string) => {
    setSelectedBank(bankName)
    const found = POPULAR_BANKS.find((b) => b.name === bankName)
    if (found) {
      setRoutingNumber(found.routing)
    }
  }

  const handleValidateAccount = () => {
    if (!accountNumber || accountNumber.length < 8) {
      if (showToast) showToast("Please enter a valid 8-12 digit bank account number.")
      else alert("Please enter a valid 8-12 digit bank account number.")
      return
    }
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setValidatedRecipient(recipientName || "Verified Account Holder")
    }, 600)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountNumber || !routingNumber || numAmount <= 0) {
      if (showToast) showToast("Please fill in all recipient bank and transfer details.")
      else alert("Please fill in all recipient bank and transfer details.")
      return
    }

    const finalBank = selectedBank === "Other" ? customBank : selectedBank

    const success = onTransfer({
      bankName: finalBank || "External Commercial Bank",
      recipientName: recipientName || "Commercial Recipient",
      accountNumber,
      routingNumber,
      amount: numAmount,
      note,
    })

    if (success) {
      setAccountNumber("")
      setRecipientName("")
      setValidatedRecipient(null)
    }
  }

  return (
    <div className="transfer-view">
      <div className="welcome-row">
        <div>
          <span className="date-label">EXTERNAL SETTLEMENT NETWORK</span>
          <h1>Transfer Money to Another Real Bank</h1>
          <p>
            Seamlessly send funds to real commercial banks worldwide. Real-time Fedwire, ACH, and SWIFT settlement.
          </p>
        </div>
      </div>

      {/* Compliance Rule: $50 Client Withdrawal Limit Alert */}
      <div className={`transfer-limit-alert ${isOverLimit ? "alert-exceeded" : ""}`}>
        <div className="flex items-start gap-3">
          <ShieldAlert size={22} className={isOverLimit ? "text-rose-500" : "text-amber-500"} />
          <div>
            <strong>Client Daily Transfer / Withdrawal Safeguard: ${user.withdrawalLimit.toFixed(2)} Maximum</strong>
            <p>
              As configured by banking compliance policy, single transfers and withdrawals for this client are limited to a maximum of <strong>${user.withdrawalLimit.toFixed(2)}</strong>.
              {isOverLimit && (
                <span className="block text-rose-600 font-semibold mt-1">
                  &times; You have entered ${numAmount.toFixed(2)}, which exceeds your ${user.withdrawalLimit.toFixed(2)} limit. Please adjust to $50 or request admin elevation.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="transfer-layout">
        <Panel className="transfer-form-panel">
          <form onSubmit={handleSubmit}>
            {/* Source Account Info */}
            <div className="form-group mb-4">
              <label>From Client Account</label>
              <div className="source-account-box">
                <Landmark size={20} className="text-blue-500" />
                <div className="flex-1">
                  <strong>Wiko Safety Checking ({user.accountNumber})</strong>
                  <small>Available Balance: ${user.balanceUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</small>
                </div>
                <span className="badge-primary">Primary</span>
              </div>
            </div>

            {/* Select Destination Real Bank */}
            <div className="form-group">
              <label>Destination Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => handleBankSelect(e.target.value)}
                className="input-select"
              >
                {POPULAR_BANKS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} (SWIFT: {b.code})
                  </option>
                ))}
                <option value="Other">Other Bank (Enter Manually)</option>
              </select>
            </div>

            {selectedBank === "Other" && (
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Deutsche Bank, Morgan Stanley"
                  className="input-text"
                  value={customBank}
                  onChange={(e) => setCustomBank(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Recipient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Johnathan Miller / Corp Inc"
                  className="input-text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label>Routing Number (ABA / Sort Code)</label>
                <input
                  type="text"
                  placeholder="9-digit routing"
                  className="input-text"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Recipient Account Number / IBAN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 10-12 digit real bank account number"
                  className="input-text flex-1 font-mono"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleValidateAccount}
                  disabled={isVerifying}
                >
                  {isVerifying ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span>Verify Account</span>
                </Button>
              </div>
              {validatedRecipient && (
                <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Interbank routing verified for: <strong>{validatedRecipient}</strong>
                </div>
              )}
            </div>

            {/* Transfer Amount */}
            <div className="form-group">
              <div className="flex justify-between items-center mb-1">
                <label>Transfer Amount (USD)</label>
                <span className="text-xs text-muted">
                  Max allowed: <strong>${user.withdrawalLimit.toFixed(2)}</strong>
                </span>
              </div>
              <div className="amount-input-box">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                  placeholder="0.00"
                  required
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => setAmount("10")}
                  >
                    $10
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => setAmount("25")}
                  >
                    $25
                  </button>
                  <button
                    type="button"
                    className="chip-btn chip-btn-active"
                    onClick={() => setAmount(String(user.withdrawalLimit))}
                  >
                    $50 (Max Limit)
                  </button>
                </div>
              </div>
            </div>

            {/* Transfer Rail */}
            <div className="form-group">
              <label>Settlement Speed</label>
              <div className="transfer-rails">
                <div
                  className={`rail-card ${transferType === "instant" ? "active" : ""}`}
                  onClick={() => setTransferType("instant")}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" />
                    <strong>Instant FedNow / Wire</strong>
                  </div>
                  <small>Immediate settlement &bull; $0.00 fee</small>
                </div>
                <div
                  className={`rail-card ${transferType === "ach" ? "active" : ""}`}
                  onClick={() => setTransferType("ach")}
                >
                  <div className="flex items-center gap-2">
                    <Clock3 size={16} className="text-blue-500" />
                    <strong>Standard ACH Direct</strong>
                  </div>
                  <small>1-2 Business Days &bull; Free</small>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Payment Memo / Reference</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reference or Invoice Number"
                className="input-text"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isOverLimit || numAmount <= 0}
            >
              <Send size={18} />
              <span>
                {isOverLimit
                  ? `Amount exceeds $${user.withdrawalLimit} limit`
                  : `Execute $${numAmount.toFixed(2)} Interbank Wire Transfer`}
              </span>
            </Button>
          </form>
        </Panel>

        {/* Transfer Security Summary Sidebar */}
        <div className="transfer-summary-col">
          <Panel className="summary-panel">
            <h3>Transfer Summary</h3>
            <div className="summary-row">
              <span>Origin Account</span>
              <strong>â€¢â€¢{user.accountNumber.slice(-4)} (USD)</strong>
            </div>
            <div className="summary-row">
              <span>Destination Bank</span>
              <strong>{selectedBank === "Other" ? customBank || "Other" : selectedBank}</strong>
            </div>
            <div className="summary-row">
              <span>Recipient Name</span>
              <strong>{recipientName || "â€”"}</strong>
            </div>
            <div className="summary-row">
              <span>Target Routing</span>
              <strong>{routingNumber || "â€”"}</strong>
            </div>
            <div className="summary-row">
              <span>Transfer Fee</span>
              <strong className="text-emerald-600">$0.00 (Waived)</strong>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total Settlement</span>
              <strong>${numAmount.toFixed(2)} USD</strong>
            </div>

            <div className="secure-badge-box mt-4">
              <ShieldCheck size={18} className="text-blue-500" />
              <div>
                <strong>ISO 20022 Financial Standard</strong>
                <p>Transfer instructions are digitally counter-signed with Wiko Safety Bank TLS 1.3 cryptographic rails.</p>
              </div>
            </div>
          </Panel>

          <Panel className="popular-banks-panel mt-4">
            <h4 className="text-sm font-semibold mb-3">Verified Real Bank Rails</h4>
            <div className="bank-chips-grid">
              {POPULAR_BANKS.slice(0, 6).map((b) => (
                <div
                  key={b.id}
                  className="bank-mini-chip"
                  onClick={() => handleBankSelect(b.name)}
                >
                  <Building2 size={14} className="text-blue-500" />
                  <span>{b.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   WALLET VIEW (MULTI-CURRENCY & CONVERSION)
   ========================================================================= */

function WalletView({
  user,
  setModal,
  showToast,
}: {
  user: UserProfile
  setModal: (v: ModalType) => void
  showToast: (m: string) => void
}) {
  const wallets = [
    {
      code: "USD",
      name: "United States Dollar",
      symbol: "$",
      balance: user.balanceUSD,
      routing: user.routingNumber,
      account: user.accountNumber,
      flag: "ðŸ‡ºðŸ‡¸",
      color: "#0b70df",
    },
    {
      code: "EUR",
      name: "European Union Euro",
      symbol: "â‚¬",
      balance: user.balanceEUR,
      routing: "WIKODEFFXXX",
      account: `DE893704004405${user.accountNumber.slice(-6)}`,
      flag: "ðŸ‡ªðŸ‡º",
      color: "#10b981",
    },
    {
      code: "GBP",
      name: "Great Britain Pound",
      symbol: "Â£",
      balance: user.balanceGBP,
      routing: "20-00-00",
      account: `GB29WIKO${user.accountNumber.slice(-8)}`,
      flag: "ðŸ‡¬ðŸ‡§",
      color: "#8b5cf6",
    },
    {
      code: "NGN",
      name: "Nigerian Naira",
      symbol: "â‚¦",
      balance: user.balanceNGN,
      routing: "058152062",
      account: user.accountNumber,
      flag: "ðŸ‡³ðŸ‡¬",
      color: "#f59e0b",
    },
  ]

  return (
    <div className="wallet-view">
      <div className="welcome-row">
        <div>
          <span className="date-label">MULTI-CURRENCY ASSETS</span>
          <h1>Currency Wallets &amp; Vaults</h1>
          <p>Store, receive, and swap major global currencies with dedicated IBANs and account numbers.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setModal("deposit")}>
            <ArrowDownLeft size={16} /> Deposit Funds
          </Button>
          <Button variant="secondary" onClick={() => setModal("withdraw")}>
            <ArrowUpRight size={16} /> Withdraw ($50 limit)
          </Button>
        </div>
      </div>

      <div className="wallets-grid">
        {wallets.map((w) => (
          <Panel key={w.code} className="wallet-card-panel">
            <div className="wallet-card-head">
              <span className="wallet-flag">{w.flag}</span>
              <span className="wallet-code">{w.code}</span>
            </div>
            <h3>{w.name}</h3>
            <div className="wallet-balance">
              {w.symbol}
              {w.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="wallet-meta">
              <div>
                <span>Account Number</span>
                <strong>{w.account}</strong>
              </div>
              <div>
                <span>Routing / Sort Code</span>
                <strong>{w.routing}</strong>
              </div>
            </div>
            <div className="wallet-actions">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(`${w.code} Account: ${w.account}\nRouting: ${w.routing}`)
                  showToast(`${w.code} account coordinates copied!`)
                }}
              >
                <Copy size={14} /> Details
              </Button>
              <Button
                className="flex-1"
                onClick={() => setModal("deposit")}
              >
                <Plus size={14} /> Add Money
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}

/* =========================================================================
   CARDS VIEW
   ========================================================================= */

function CardsView({
  cards,
  user,
  onToggleFreeze,
  showToast,
  setModal,
}: {
  cards: BankCard[]
  user: UserProfile
  onToggleFreeze: (id: string) => void
  showToast?: (m: string) => void
  setModal: (v: ModalType) => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const card = cards[0]

  return (
    <div className="cards-view">
      <div className="welcome-row">
        <div>
          <span className="date-label">COMMERCIAL ISSUANCE</span>
          <h1>Virtual Cards &amp; Spend Controls</h1>
          <p>High-security tokenized cards with zero fraud liability protection.</p>
        </div>
        <Button variant="secondary" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{showDetails ? "Hide Card Details" : "Show PAN & CVV"}</span>
        </Button>
      </div>

      <div className="cards-layout">
        <div className="card-visual-col">
          <BankCardComponent card={card} showDetails={showDetails} />

          <div className="card-actions-row mt-4">
            <Button
              variant={card.isFrozen ? "primary" : "secondary"}
              onClick={() => onToggleFreeze(card.id)}
              className="flex-1"
            >
              <LockKeyhole size={16} />
              <span>{card.isFrozen ? "Unfreeze Card" : "Freeze Card"}</span>
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                navigator.clipboard.writeText(card.cardNumber.replace(/\s+/g, ""))
                if (showToast) {
                  showToast("Card number copied to clipboard!")
                } else {
                  alert("Card Number copied to clipboard!")
                }
              }}
            >
              <Copy size={16} /> Copy PAN
            </Button>
          </div>
        </div>

        <Panel className="card-settings-panel">
          <h3>Card Security Controls</h3>
          <div className="setting-toggle-row">
            <div>
              <strong>Online &amp; E-commerce Transactions</strong>
              <small>Allow digital purchases across global internet merchants</small>
            </div>
            <input type="checkbox" defaultChecked className="toggle-checkbox" />
          </div>

          <div className="setting-toggle-row">
            <div>
              <strong>International Cross-Border Spending</strong>
              <small>Enable payments outside client home region</small>
            </div>
            <input type="checkbox" defaultChecked className="toggle-checkbox" />
          </div>

          <div className="setting-toggle-row">
            <div>
              <strong>Contactless NFC Payments</strong>
              <small>Apple Pay, Google Pay, and POS tap-to-pay</small>
            </div>
            <input type="checkbox" defaultChecked className="toggle-checkbox" />
          </div>

          <div className="daily-limit-box mt-4">
            <div className="flex justify-between items-center mb-1">
              <strong>Daily Card Spending Limit</strong>
              <span className="font-semibold text-blue-600">${card.dailyLimit} USD</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "35%" }} />
            </div>
            <small className="text-muted text-xs mt-1 block">
              $875.00 spent of ${card.dailyLimit}.00 available today
            </small>
          </div>
        </Panel>
        {/* Request Physical Card Button */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Button variant="primary" onClick={() => setModal("requestCard")}>Order Physical Card</Button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   ACTIVITY VIEW
   ========================================================================= */

function ActivityView({
  transactions,
  onSelectTx,
  showToast,
}: {
  transactions: Transaction[]
  onSelectTx: (tx: Transaction) => void
  showToast?: (m: string) => void
}) {
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState<string>("")

  const filtered = transactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false
    if (
      search &&
      !tx.title.toLowerCase().includes(search.toLowerCase()) &&
      !tx.reference.toLowerCase().includes(search.toLowerCase()) &&
      !tx.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="activity-view">
      <div className="welcome-row">
        <div>
          <span className="date-label">SETTLEMENT LEDGER</span>
          <h1>Account Activity &amp; Transactions</h1>
          <p>Every confirmed credit, debit, and external interbank wire.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            if (showToast) {
              showToast("Official Bank Statement (PDF) downloaded successfully.")
            } else {
              alert("Downloading Official Bank Statement (PDF simulation)...")
            }
          }}
        >
          <Download size={16} /> Download Statement
        </Button>
      </div>

      <Panel className="activity-main-panel">
        <div className="activity-filter-bar">
          <div className="search-box">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Search by reference, recipient, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-chips">
            {["all", "deposit", "transfer_out", "withdrawal", "card_spend"].map((f) => (
              <button
                key={f}
                className={`filter-chip ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? "All"
                  : f === "deposit"
                  ? "Deposits"
                  : f === "transfer_out"
                  ? "Transfers"
                  : f === "withdrawal"
                  ? "Withdrawals"
                  : "Card"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <Clock3 size={24} />
            <strong>No matching transactions found</strong>
            <p>Try clearing your search query or selecting a different filter.</p>
          </div>
        ) : (
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>DESCRIPTION &amp; RECIPIENT</th>
                  <th>REFERENCE</th>
                  <th>TIMESTAMP</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTx(tx)}
                    className="clickable-row"
                  >
                    <td>
                      <div className={`tx-icon tx-icon-${tx.type}`}>
                        {tx.type === "deposit" ? (
                          <ArrowDownLeft size={16} />
                        ) : tx.type === "transfer_out" || tx.type === "withdrawal" ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <CreditCard size={16} />
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{tx.title}</strong>
                      <span className="block text-xs text-muted">
                        {tx.recipientBank ? `${tx.recipientBank} â€¢ ` : ""}
                        {tx.description}
                      </span>
                    </td>
                    <td>
                      <code className="ref-code">{tx.reference}</code>
                    </td>
                    <td className="text-sm text-muted">{tx.timestamp}</td>
                    <td>
                      <span className="status-badge status-badge-completed">
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <strong
                        className={
                          tx.type === "deposit" || tx.type === "transfer_in"
                            ? "tx-positive"
                            : "tx-negative"
                        }
                      >
                        {tx.type === "deposit" || tx.type === "transfer_in" ? "+" : "-"}
                        ${tx.amount.toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

/* =========================================================================
   SETTINGS VIEW (ACCOUNT CREDENTIALS, PROFILE, LIMITS, KYC)
   ========================================================================= */

function SettingsView({
  user,
  onUpdateUser,
  onOpenVerification,
  onOpenAdmin,
}: {
  user: UserProfile
  onUpdateUser: (u: UserProfile) => void
  onOpenVerification: () => void
  onOpenAdmin: () => void
}) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [email, setEmail] = useState(user.email)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateUser({
      ...user,
      name,
      phone,
      email,
    })
  }

  return (
    <div className="settings-view">
      <div className="welcome-row">
        <div>
          <span className="date-label">Preferences &amp; Security</span>
          <h1>Bank Profile &amp; Credentials</h1>
          <p>Manage your legal client information, assigned account number, and security safeguards.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Assigned Bank Coordinates Box */}
        <Panel className="assigned-account-panel">
          <div className="panel-heading">
            <h3 className="flex items-center gap-2">
              <Landmark size={18} className="text-blue-600" />
              <span>Assigned Bank Coordinates</span>
            </h3>
            <span className="badge-primary">Official Wire</span>
          </div>
          <div className="coordinates-grid">
            <div className="coordinate-item">
              <span>Financial Institution</span>
              <strong>{user.bankName}</strong>
            </div>
            <div className="coordinate-item">
              <span>Client Account Number</span>
              <strong className="text-blue-600 font-mono">{user.accountNumber}</strong>
            </div>
            <div className="coordinate-item">
              <span>Routing Number (ABA)</span>
              <strong className="font-mono">{user.routingNumber}</strong>
            </div>
            <div className="coordinate-item">
              <span>SWIFT / BIC Code</span>
              <strong className="font-mono">{user.swiftBic}</strong>
            </div>
          </div>
          <p className="text-xs text-muted mt-3">
            These coordinates are registered with the Federal Clearinghouse and can be used to receive direct ACH deposits, payroll, and international wire transfers.
          </p>
        </Panel>

        {/* Identity & Credentials Verification Panel */}
        <Panel className="kyc-panel">
          <div className="panel-heading">
            <h3 className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>Identity &amp; Credential Verification</span>
            </h3>
            {user.isVerified ? (
              <span className="verified-tag">
                <Check size={11} /> Verified Level 2
              </span>
            ) : (
              <span className="unverified-tag">Unverified</span>
            )}
          </div>
          <p className="text-sm text-muted mb-4">
            Verify government credentials (Passport, National ID, or Driver&apos;s License) to maintain continuous banking operations and elevated tier standing.
          </p>

          <div className="kyc-status-box">
            <div className="kyc-status-info">
              <strong>Document: {user.idDocumentType || "None submitted"}</strong>
              <small className="font-mono">Number: {user.idDocumentNumber || "Pending verification"}</small>
            </div>
            <Button
              variant={user.isVerified ? "secondary" : "primary"}
              onClick={onOpenVerification}
            >
              {user.isVerified ? "Update Document" : "Verify Credentials Now"}
            </Button>
          </div>
        </Panel>

        {/* Withdrawal Safeguard & Limits */}
        <Panel className="withdrawal-safeguard-panel">
          <div className="panel-heading">
            <h3 className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-500" />
              <span>Client Withdrawal Limit Safeguard</span>
            </h3>
          </div>
          <p className="text-sm text-muted mb-3">
            In compliance with client protection protocols, individual withdrawals and outbound transfers are capped:
          </p>
          <div className="limit-meter-card">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-muted block mb-1">Current Withdrawal Cap</span>
                <strong className="text-2xl text-navy font-bold">${user.withdrawalLimit.toFixed(2)} USD</strong>
              </div>
              <Button variant="ghost" onClick={onOpenAdmin}>
                <KeyRound size={16} /> Admin Override
              </Button>
            </div>
            <div className="limit-alert-note mt-3">
              <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
              <span>To increase this limit above $50.00, authenticate into the Hidden Admin Portal using master credentials.</span>
            </div>
          </div>
        </Panel>

        {/* Profile Info Form */}
        <Panel className="profile-form-panel">
          <div className="panel-heading">
            <h3>Client Personal Information</h3>
          </div>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group mb-3">
              <label>Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-text"
                required
              />
            </div>
            <div className="form-group mb-3">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-text"
                required
              />
            </div>
            <div className="form-group mb-4">
              <label>Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-text"
                required
              />
            </div>
            <Button type="submit">
              <Check size={16} /> Save Changes
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  )
}

/* =========================================================================
   SUPPORT CONCIERGE VIEW
   ========================================================================= */

function SupportView({ user }: { user: UserProfile }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `Hello ${user.name}, welcome to Wiko Safety Bank Priority Concierge. How may our treasury team assist you today?`,
      time: "10:00 AM",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { sender: "user", text: input, time: "Just now" }
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    setTimeout(() => {
      let reply = "Your request has been logged with our 24/7 bank compliance officers. For transfers or account assistance, our clearinghouse is active."
      if (input.toLowerCase().includes("limit") || input.toLowerCase().includes("50")) {
        reply = "Client withdrawal limit is currently set to $50.00 per policy. You can contact an administrator or use the master admin console to elevate this limit."
      } else if (input.toLowerCase().includes("transfer") || input.toLowerCase().includes("bank")) {
        reply = "You can transfer directly to JPMorgan Chase, Bank of America, Wells Fargo, and other international institutions via the 'Transfer to Bank' tab."
      } else if (input.toLowerCase().includes("account") || input.toLowerCase().includes("number")) {
        reply = `Your official account number is ${user.accountNumber} with routing number ${user.routingNumber}.`
      }
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: reply, time: "Just now" },
      ])
    }, 800)
  }

  return (
    <div className="support-view">
      <div className="welcome-row">
        <div>
          <span className="date-label">PRIORITY DESK</span>
          <h1>Customer Care &amp; Support Concierge</h1>
          <p>Instant encrypted financial advisory and clearinghouse support.</p>
        </div>
      </div>

      <Panel className="support-chat-panel">
        <div className="chat-messages-container">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${m.sender === "user" ? "chat-user" : "chat-bot"}`}
            >
              <div className="chat-content">
                <p>{m.text}</p>
                <small>{m.time}</small>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            placeholder="Type your banking inquiry (e.g. transfer status, $50 withdrawal limit, account info)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-text flex-1"
          />
          <Button type="submit">
            <Send size={16} /> Send
          </Button>
        </form>
      </Panel>
    </div>
  )
}

/* =========================================================================
   HIDDEN ADMIN PORTAL VIEW (FULL MANAGEMENT CONSOLE)
   ========================================================================= */

function AdminPortalView({
  clients,
  transactions,
  currentUser,
  onSwitchClient,
  onUpdateClients,
  onUpdateCurrentUser,
  onAddTransaction,
  onLogoutAdmin,
  showToast,
}: {
  clients: UserProfile[]
  transactions: Transaction[]
  currentUser: UserProfile
  onSwitchClient: (client: UserProfile) => void
  onUpdateClients: React.Dispatch<React.SetStateAction<UserProfile[]>>
  onUpdateCurrentUser: React.Dispatch<React.SetStateAction<UserProfile[]>> | any
  onAddTransaction: (tx: any) => Transaction
  onLogoutAdmin: () => void
  showToast: (m: string) => void
}) {
  const [selectedClient, setSelectedClient] = useState<UserProfile>(currentUser)
  const [creditAmount, setCreditAmount] = useState<string>("500")
  const [newLimit, setNewLimit] = useState<string>(String(selectedClient.withdrawalLimit))
  const [newAcctNumber, setNewAcctNumber] = useState<string>("")
  const [showAddClientModal, setShowAddClientModal] = useState(false)

  // New Client Form
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")

  useEffect(() => {
    setNewLimit(String(selectedClient.withdrawalLimit))
  }, [selectedClient])

  // Direct Credit Funds to Client
  const handleCreditFunds = () => {
    const amt = parseFloat(creditAmount)
    if (!amt || amt <= 0) {
      showToast("Please enter a valid credit amount.")
      return
    }

    const updated = {
      ...selectedClient,
      balanceUSD: selectedClient.balanceUSD + amt,
    }

    onUpdateClients((prev: UserProfile[]) =>
      prev.map((c) => (c.id === selectedClient.id ? updated : c))
    )

    if (currentUser.id === selectedClient.id) {
      onUpdateCurrentUser(updated)
    }

    setSelectedClient(updated)

    onAddTransaction({
      userId: selectedClient.id,
      type: "deposit",
      amount: amt,
      currency: "USD",
      title: "Admin Treasury Credit Injection",
      description: `Disbursed by Master Bank Administrator directly to acct ${selectedClient.accountNumber}`,
      status: "completed",
    })

    showToast(`Credited $${amt.toFixed(2)} to ${selectedClient.name}!`)
  }

  // Update Withdrawal Limit (Default $50, admin can elevate or change)
  const handleUpdateLimit = () => {
    const limit = parseFloat(newLimit)
    if (isNaN(limit) || limit < 0) {
      showToast("Please enter a valid limit amount.")
      return
    }

    const updated = {
      ...selectedClient,
      withdrawalLimit: limit,
    }

    onUpdateClients((prev: UserProfile[]) =>
      prev.map((c) => (c.id === selectedClient.id ? updated : c))
    )

    if (currentUser.id === selectedClient.id) {
      onUpdateCurrentUser(updated)
    }

    setSelectedClient(updated)
    showToast(`Withdrawal limit for ${selectedClient.name} updated to $${limit.toFixed(2)}`)
  }

  // Assign New Account Number
  const handleAssignAccountNumber = () => {
    const generated =
      newAcctNumber.trim() ||
      Math.floor(1000000000 + Math.random() * 9000000000).toString()

    const updated = {
      ...selectedClient,
      accountNumber: generated,
    }

    onUpdateClients((prev: UserProfile[]) =>
      prev.map((c) => (c.id === selectedClient.id ? updated : c))
    )

    if (currentUser.id === selectedClient.id) {
      onUpdateCurrentUser(updated)
    }

    setSelectedClient(updated)
    setNewAcctNumber("")
    showToast(`Assigned new client account number: ${generated}`)
  }

  // Toggle KYC Verification
  const handleToggleVerification = () => {
    const newStatus = !selectedClient.isVerified
    const updated: UserProfile = {
      ...selectedClient,
      isVerified: newStatus,
      verificationStatus: newStatus ? "verified" : "unverified",
      idDocumentType: newStatus ? selectedClient.idDocumentType || "Passport" : undefined,
      idDocumentNumber: newStatus ? selectedClient.idDocumentNumber || "P-VERIFIED-ADMIN" : undefined,
    }

    onUpdateClients((prev: UserProfile[]) =>
      prev.map((c) => (c.id === selectedClient.id ? updated : c))
    )

    if (currentUser.id === selectedClient.id) {
      onUpdateCurrentUser(updated)
    }

    setSelectedClient(updated)
    showToast(`Client ${selectedClient.name} is now ${newStatus ? "VERIFIED" : "UNVERIFIED"}`)
  }

  // Create New Client
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName || !newClientEmail) return

    const randomAcct = Math.floor(1000000000 + Math.random() * 9000000000).toString()
    const initials = newClientName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    const newClient: UserProfile = {
      id: `usr_wik_${Math.floor(1000 + Math.random() * 9000)}`,
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone || "+1 (555) 000-0000",
      accountNumber: randomAcct,
      routingNumber: "021000021",
      swiftBic: "WIKOUSB33",
      bankName: "Wiko Safety Bank N.A.",
      balanceUSD: 1000.0,
      balanceEUR: 0.0,
      balanceGBP: 0.0,
      balanceNGN: 0.0,
      withdrawalLimit: 50.0, // Default $50 limit
      isVerified: true,
      verificationStatus: "verified",
      avatar: initials || "CL",
      createdDate: "Today",
    }

    onUpdateClients((prev: UserProfile[]) => [newClient, ...prev])
    setSelectedClient(newClient)
    setShowAddClientModal(false)
    setNewClientName("")
    setNewClientEmail("")
    setNewClientPhone("")
    showToast(`New client created: ${newClient.name} with Acct ${randomAcct}`)
  }

  return (
    <div className="admin-view">
      <div className="welcome-row">
        <div>
          <span className="date-label text-amber-500 font-bold flex items-center gap-2">
            <KeyRound size={16} /> MASTER ADMINISTRATOR CONSOLE
          </span>
          <h1>Wiko Bank Operations Portal</h1>
          <p>
            Assign client account numbers, disburse funds, manage credentials, and configure the $50 withdrawal limit.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAddClientModal(true)}>
            <Plus size={16} /> Create Client Account
          </Button>
          <Button variant="danger" onClick={onLogoutAdmin}>
            Exit Admin
          </Button>
        </div>
      </div>

      <div className="admin-layout-grid">
        {/* Left: Clients Directory */}
        <Panel className="admin-clients-panel">
          <div className="flex justify-between items-center mb-3">
            <h3 className="flex items-center gap-2">
              <UserRound size={18} className="text-blue-500" />
              <span>Registered Clients ({clients.length})</span>
            </h3>
          </div>
          <div className="clients-list">
            {clients.map((c) => (
              <div
                key={c.id}
                className={`client-row ${selectedClient.id === c.id ? "client-row-active" : ""}`}
                onClick={() => setSelectedClient(c)}
              >
                <span className="avatar">{c.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="truncate">{c.name}</strong>
                    {c.id === currentUser.id && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <small className="text-muted block truncate">
                    Acct: {c.accountNumber} &bull; ${c.balanceUSD.toLocaleString()}
                  </small>
                </div>
                <div>
                  {c.isVerified ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check size={12} /> KYC
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-semibold">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-line flex gap-2">
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => onSwitchClient(selectedClient)}
            >
              <UserCheck size={16} /> Switch to {selectedClient.name.split(" ")[0]}&apos;s View
            </Button>
          </div>
        </Panel>

        {/* Right: Client Controls & Actions */}
        <div className="admin-controls-col">
          {/* Selected Client Overview Banner */}
          <Panel className="client-detail-banner">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-muted font-bold tracking-wider">MANAGING CLIENT</span>
                <h2 className="text-2xl mt-1">{selectedClient.name}</h2>
                <div className="flex flex-wrap gap-3 text-xs text-muted mt-2">
                  <span>ID: <code>{selectedClient.id}</code></span>
                  <span>Email: {selectedClient.email}</span>
                  <span>Balance: <strong>${selectedClient.balanceUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`status-pill ${selectedClient.isVerified ? "status-pill-verified" : "status-pill-unverified"}`}>
                  {selectedClient.isVerified ? "KYC Approved" : "KYC Pending"}
                </span>
                <span className="text-xs text-amber-600 font-semibold">
                  Limit: ${selectedClient.withdrawalLimit.toFixed(2)}
                </span>
              </div>
            </div>
          </Panel>

          {/* Action Cards Grid */}
          <div className="admin-actions-grid">
            {/* 1. Assign Account Number */}
            <Panel className="admin-tool-card">
              <h4>Assign / Change Account Number</h4>
              <p className="text-xs text-muted mb-3">
                Current Number: <strong>{selectedClient.accountNumber}</strong> (Routing: {selectedClient.routingNumber})
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Custom 10-digit number (or leave blank to auto-generate)"
                  value={newAcctNumber}
                  onChange={(e) => setNewAcctNumber(e.target.value)}
                  className="input-text text-sm flex-1"
                />
                <Button onClick={handleAssignAccountNumber}>
                  Assign Number
                </Button>
              </div>
            </Panel>

            {/* 2. Direct Deposit / Credit to Client */}
            <Panel className="admin-tool-card">
              <h4>Credit / Deposit Funds to Client</h4>
              <p className="text-xs text-muted mb-3">
                Deposit money instantly into this client&apos;s checking account.
              </p>
              <div className="flex gap-2">
                <div className="amount-input-mini">
                  <span>$</span>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="input-text text-sm"
                  />
                </div>
                <Button onClick={handleCreditFunds}>
                  <ArrowDownLeft size={16} /> Credit Funds
                </Button>
              </div>
            </Panel>

            {/* 3. Manage $50 Withdrawal Limit */}
            <Panel className="admin-tool-card">
              <h4>Client Withdrawal Limit ($50 Standard)</h4>
              <p className="text-xs text-muted mb-3">
                Currently set to: <strong>${selectedClient.withdrawalLimit.toFixed(2)}</strong>. You can modify or restore to $50.
              </p>
              <div className="flex gap-2">
                <div className="amount-input-mini">
                  <span>$</span>
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="input-text text-sm"
                  />
                </div>
                <Button onClick={handleUpdateLimit}>
                  Save Limit
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setNewLimit("50")
                    const updated = { ...selectedClient, withdrawalLimit: 50.0 }
                    onUpdateClients((prev: UserProfile[]) =>
                      prev.map((c) => (c.id === selectedClient.id ? updated : c))
                    )
                    setSelectedClient(updated)
                    showToast("Enforced strict $50.00 withdrawal limit.")
                  }}
                >
                  Reset $50
                </Button>
              </div>
            </Panel>

            {/* 4. Credentials & KYC Approval */}
            <Panel className="admin-tool-card">
              <h4>Client Credential Verification</h4>
              <p className="text-xs text-muted mb-3">
                Status: <strong>{selectedClient.verificationStatus.toUpperCase()}</strong> &bull; Document:{" "}
                {selectedClient.idDocumentType || "None"} ({selectedClient.idDocumentNumber || "None"})
              </p>
              <div className="flex gap-2">
                <Button
                  variant={selectedClient.isVerified ? "secondary" : "primary"}
                  onClick={handleToggleVerification}
                >
                  {selectedClient.isVerified ? "Revoke Verification" : "Approve & Verify Credentials"}
                </Button>
              </div>
            </Panel>
          </div>

          {/* Master Audit Logs */}
          <Panel className="admin-audit-panel mt-4">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Clock3 size={16} /> Real-Time Federal Wire &amp; Bank Ledger
            </h4>
            <div className="admin-log-list">
              {transactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="admin-log-item">
                  <span className="font-mono text-xs text-blue-600">{tx.reference}</span>
                  <span className="text-xs">{tx.title}</span>
                  <span className="text-xs text-muted">{tx.timestamp}</span>
                  <strong className="text-xs">${tx.amount.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Create Client Modal */}
      {showAddClientModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <h3>Create New Bank Client</h3>
              <Button variant="icon" onClick={() => setShowAddClientModal(false)}>
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={handleCreateClient} className="mt-4">
              <div className="form-group mb-3">
                <label>Full Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Richard Hendricks"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="input-text"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label>Client Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. richard@piedpiper.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="input-text"
                  required
                />
              </div>
              <div className="form-group mb-4">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="input-text"
                />
              </div>
              <Button type="submit" className="w-full">
                Generate Client Account &amp; Routing
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* =========================================================================
   COMPONENTS: BANK CARD & LIVE CONVERTER
   ========================================================================= */

function BankCardComponent({
  card,
  showDetails = false,
}: {
  card: BankCard
  showDetails?: boolean
}) {
  return (
    <div className={`bank-card ${card.isFrozen ? "bank-card-frozen" : ""}`} aria-label="Virtual card preview">
      <div className="card-head">
        <Brand />
        <span className="test-chip">
          {card.isFrozen ? "FROZEN" : "PLATINUM DEBIT"}
        </span>
      </div>
      <div className="chip-row">
        <span className="chip">
          <i />
          <i />
          <i />
        </span>
        <span className="contactless">)))</span>
      </div>
      <div className="masked-pan">
        {showDetails
          ? card.cardNumber
          : `â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ ${card.cardNumber.slice(-4)}`}
      </div>
      <div className="card-foot">
        <div>
          <span>CARD HOLDER</span>
          <strong>{card.holderName}</strong>
        </div>
        <div>
          <span>EXPIRES</span>
          <strong>{card.expiry}</strong>
        </div>
        <div>
          <span>CVV</span>
          <strong>{showDetails ? card.cvv : "â€¢â€¢â€¢"}</strong>
        </div>
        <b>VISA</b>
      </div>
    </div>
  )
}

function LiveConverter({
  user,
  showToast,
}: {
  user: UserProfile
  showToast: (m: string) => void
}) {
  const [sendAmount, setSendAmount] = useState<string>("100")
  const [fromCurr, setFromCurr] = useState<string>("USD")
  const [toCurr, setToCurr] = useState<string>("NGN")

  const rates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    NGN: 1480.0,
  }

  const numSend = parseFloat(sendAmount) || 0
  const rate = (rates[toCurr] || 1) / (rates[fromCurr] || 1)
  const receiveAmount = (numSend * rate).toFixed(2)

  const handleSwap = () => {
    const temp = fromCurr
    setFromCurr(toCurr)
    setToCurr(temp)
  }

  return (
    <div>
      <div className="fx-box">
        <div className="flex justify-between items-center">
          <label>YOU SEND</label>
          <select
            value={fromCurr}
            onChange={(e) => setFromCurr(e.target.value)}
            className="currency-select"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="NGN">NGN</option>
          </select>
        </div>
        <div>
          <input
            type="number"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            className="fx-input"
          />
        </div>
      </div>

      <div className="swap" onClick={handleSwap} style={{ cursor: "pointer" }}>
        <RefreshCw size={15} />
      </div>

      <div className="fx-box">
        <div className="flex justify-between items-center">
          <label>YOU RECEIVE</label>
          <select
            value={toCurr}
            onChange={(e) => setToCurr(e.target.value)}
            className="currency-select"
          >
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <strong className="text-xl">{receiveAmount} {toCurr}</strong>
        </div>
      </div>

      <p className="rate-note">
        <Clock3 size={14} /> 1 {fromCurr} = {rate.toFixed(4)} {toCurr}. Live real-time interbank benchmark.
      </p>

      <Button
        className="full"
        onClick={() => {
          showToast(`Quote locked: 1 ${fromCurr} = ${rate.toFixed(4)} ${toCurr} for 60 seconds.`)
        }}
      >
        Lock Live Rate
      </Button>
    </div>
  )
}

/* =========================================================================
   MODALS: DEPOSIT, WITHDRAW, VERIFICATION, ADMIN LOGIN, RECEIPT
   ========================================================================= */

function DepositModal({
  user,
  close,
  onDeposit,
}: {
  user: UserProfile
  close: () => void
  onDeposit: (amount: number, method: string) => void
}) {
  const [activeTab, setActiveTab] = useState<"wire" | "card" | "instant">("card")
  const [amount, setAmount] = useState("500")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardHolder, setCardHolder] = useState(user.name)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount)
    if (!num || num <= 0) return

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      const method =
        activeTab === "card"
          ? `Debit Card (â€¢â€¢â€¢â€¢ ${cardNumber.slice(-4) || "8920"})`
          : activeTab === "wire"
          ? "Bank Wire Transfer"
          : "Instant Federal Inbound"
      onDeposit(num, method)
    }, 900)
  }

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="modal deposit-modal-clean" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-icon">
            <ArrowDownLeft size={22} />
          </div>
          <Button variant="icon" onClick={close}>
            <X size={18} />
          </Button>
        </div>
        <h2>Add Real Money to Account</h2>
        <p className="text-muted text-xs">
          Deposit funds to checking account <strong>{user.accountNumber}</strong> &bull; Wiko Safety Bank N.A.
        </p>

        {/* Tab selection */}
        <div className="deposit-tabs-row my-4">
          <button
            type="button"
            className={`deposit-tab-btn ${activeTab === "card" ? "active" : ""}`}
            onClick={() => setActiveTab("card")}
          >
            <CreditCard size={15} />
            <span>Debit / Credit Card</span>
          </button>
          <button
            type="button"
            className={`deposit-tab-btn ${activeTab === "wire" ? "active" : ""}`}
            onClick={() => setActiveTab("wire")}
          >
            <Landmark size={15} />
            <span>Bank Wire / ACH</span>
          </button>
          <button
            type="button"
            className={`deposit-tab-btn ${activeTab === "instant" ? "active" : ""}`}
            onClick={() => setActiveTab("instant")}
          >
            <Zap size={15} />
            <span>Instant Top-Up</span>
          </button>
        </div>

        {activeTab === "card" && (
          <form onSubmit={handleDepositSubmit}>
            <div className="form-group mb-3">
              <div className="flex justify-between items-center mb-1">
                <label>Amount to Deposit (USD)</label>
                <div className="flex gap-1">
                  {["100", "250", "500", "1000"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="chip-btn"
                      onClick={() => setAmount(v)}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="amount-input-box">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  step="1"
                  min="5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                  required
                />
              </div>
            </div>

            <div className="form-group mb-3">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="4532 â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ 9281"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="input-text font-mono"
                required
              />
            </div>

            <div className="form-row flex gap-3 mb-3">
              <div className="form-group flex-1">
                <label>Expiry (MM/YY)</label>
                <input
                  type="text"
                  placeholder="08/29"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="input-text font-mono"
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label>CVV / CVC</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="â€¢â€¢â€¢"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  className="input-text font-mono"
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label>Cardholder Name</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="input-text"
                required
              />
            </div>

            <Button type="submit" className="full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing Card Authorization...</span>
                </>
              ) : (
                <>
                  <LockKeyhole size={16} />
                  <span>Deposit ${amount} Instantly</span>
                </>
              )}
            </Button>
          </form>
        )}

        {activeTab === "wire" && (
          <div className="wire-instructions-box">
            <p className="text-xs text-muted mb-3">
              Transfer funds from your external bank (Chase, BofA, Wells Fargo, etc.) to your account using the Federal Reserve routing wire details below:
            </p>
            <div className="wire-fields-list">
              <div className="wire-field-item">
                <div>
                  <small>BENEFICIARY BANK</small>
                  <strong>{user.bankName}</strong>
                </div>
                <button
                  type="button"
                  className="copy-mini-btn"
                  onClick={() => copyToClipboard(user.bankName, "bank")}
                >
                  {copiedField === "bank" ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>

              <div className="wire-field-item">
                <div>
                  <small>ROUTING NUMBER (ABA)</small>
                  <strong className="font-mono text-blue-600">{user.routingNumber}</strong>
                </div>
                <button
                  type="button"
                  className="copy-mini-btn"
                  onClick={() => copyToClipboard(user.routingNumber, "routing")}
                >
                  {copiedField === "routing" ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>

              <div className="wire-field-item">
                <div>
                  <small>ACCOUNT NUMBER</small>
                  <strong className="font-mono text-blue-600">{user.accountNumber}</strong>
                </div>
                <button
                  type="button"
                  className="copy-mini-btn"
                  onClick={() => copyToClipboard(user.accountNumber, "acct")}
                >
                  {copiedField === "acct" ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>

              <div className="wire-field-item">
                <div>
                  <small>ACCOUNT NAME</small>
                  <strong>{user.name}</strong>
                </div>
                <button
                  type="button"
                  className="copy-mini-btn"
                  onClick={() => copyToClipboard(user.name, "name")}
                >
                  {copiedField === "name" ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex gap-2">
              <Button
                className="full"
                onClick={() => {
                  const num = parseFloat(amount) || 1000
                  onDeposit(num, "Direct Bank Wire Settlement")
                }}
              >
                <Check size={16} /> Confirm Inbound Wire (${amount || "1,000"})
              </Button>
            </div>
          </div>
        )}

        {activeTab === "instant" && (
          <form onSubmit={handleDepositSubmit}>
            <div className="form-group mb-4">
              <label>Instant Top-Up Amount (USD)</label>
              <div className="amount-input-box">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  step="10"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                  required
                />
              </div>
            </div>

            <div className="secure-note mb-4">
              <ShieldCheck size={18} />
              <span>
                <strong>Instant Treasury Clearinghouse</strong>
                Funds are immediately verified and credited to your available balance.
              </span>
            </div>

            <Button type="submit" className="full">
              Confirm &amp; Deposit ${amount} USD
            </Button>
          </form>
        )}

        <Button variant="ghost" className="full mt-2" onClick={close}>
          Close
        </Button>
      </div>
    </div>
  )
}

function WithdrawModal({
  user,
  close,
  onWithdraw,
}: {
  user: UserProfile
  close: () => void
  onWithdraw: (amount: number, destination: string) => void
}) {
  const [amount, setAmount] = useState<string>("50")
  const [destination, setDestination] = useState("External Bank Card")

  const num = parseFloat(amount) || 0
  const isExceeded = num > user.withdrawalLimit

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-icon">
            <ArrowUpRight size={22} />
          </div>
          <Button variant="icon" onClick={close}>
            <X size={18} />
          </Button>
        </div>
        <h2>Withdraw Funds ($50 Client Limit)</h2>
        <p>Withdrawal from checking account â€¢â€¢{user.accountNumber.slice(-4)}.</p>

        {/* $50 Limit Highlight */}
        <div className={`p-3 rounded-lg border text-xs my-3 ${isExceeded ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            <ShieldAlert size={16} />
            <span>Client Withdrawal Limit: ${user.withdrawalLimit.toFixed(2)} Maximum</span>
          </div>
          Client withdrawal policy strictly limits single cash-outs to $50.00.
        </div>

        <div className="form-group my-3">
          <label>Destination Channel</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="input-select"
          >
            <option value="External Debit Card">Linked External Visa/Mastercard</option>
            <option value="Bank of America Clearing">Bank of America Payout</option>
            <option value="Chase Wire Account">JPMorgan Chase Wire Payout</option>
            <option value="ATM Cash Token">Cardless ATM Instant Cash Token</option>
          </select>
        </div>

        <div className="form-group mb-4">
          <label>Amount (USD - Max $50)</label>
          <div className="amount-input-box">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              step="1"
              min="1"
              max={user.withdrawalLimit}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="amount-input"
            />
            <button
              type="button"
              className="chip-btn chip-btn-active"
              onClick={() => setAmount(String(user.withdrawalLimit))}
            >
              $50 Max
            </button>
          </div>
        </div>

        <Button
          className="full"
          disabled={isExceeded || num <= 0}
          onClick={() => {
            if (num > 0) onWithdraw(num, destination)
          }}
        >
          {isExceeded ? `Exceeds $${user.withdrawalLimit} Limit` : `Withdraw $${num.toFixed(2)} USD`}
        </Button>
        <Button variant="ghost" className="full" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function VerificationModal({
  user,
  close,
  onSubmitVerification,
}: {
  user: UserProfile
  close: () => void
  onSubmitVerification: (docType: string, docNumber: string) => void
}) {
  const [docType, setDocType] = useState(user.idDocumentType || "Passport")
  const [docNumber, setDocNumber] = useState(user.idDocumentNumber || "")
  const [isProcessing, setIsProcessing] = useState(false)
  const [verifiedStep, setVerifiedStep] = useState(1)

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docNumber) return

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setVerifiedStep(2)
      setTimeout(() => {
        onSubmitVerification(docType, docNumber)
      }, 700)
    }, 1200)
  }

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-icon">
            <ShieldCheck size={22} />
          </div>
          <Button variant="icon" onClick={close}>
            <X size={18} />
          </Button>
        </div>
        <h2>Identity &amp; Credential Verification</h2>
        <p>Verify your government identification to ensure safety and regulatory compliance.</p>

        {verifiedStep === 1 ? (
          <form onSubmit={handleVerify} className="mt-4">
            <div className="form-group mb-3">
              <label>Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="input-select"
              >
                <option value="Passport">International Passport</option>
                <option value="Driver's License">Driver&apos;s License (Real ID)</option>
                <option value="National ID">National Identity Card / NIN</option>
                <option value="State ID">State Identification Card</option>
              </select>
            </div>

            <div className="form-group mb-3">
              <label>Document Identifier Number</label>
              <input
                type="text"
                placeholder="e.g. P98124018A or DL-882910"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="input-text font-mono"
                required
              />
            </div>

            <div className="doc-upload-box mb-4">
              <Sparkles size={20} className="text-blue-500 mb-1" />
              <strong>Biometric Selfie &amp; Photo ID Scan</strong>
              <small>Simulated real-time cryptographic facial match against identity registry</small>
            </div>

            <Button type="submit" className="full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Validating Credentials with Registry...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Submit &amp; Verify Credentials</span>
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="verification-success py-6 text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
            <h3>Credentials Verified!</h3>
            <p className="text-sm text-muted">Your legal identity documents have been approved by Wiko Safety Bank.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminLoginModal({
  close,
  onSuccess,
}: {
  close: () => void
  onSuccess: () => void
}) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_MASTER_PASSWORD) {
      onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-icon text-amber-500">
            <KeyRound size={22} />
          </div>
          <Button variant="icon" onClick={close}>
            <X size={18} />
          </Button>
        </div>
        <h2>Hidden Admin Authentication</h2>
        <p>Enter the master administrator authorization password to unlock the backend bank console.</p>


        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-group mb-4">
            <label>Administrator Access Key</label>
            <div className="relative flex items-center">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                className={`input-text w-full pr-10 ${error ? "border-rose-500" : ""}`}
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 text-muted"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <span className="text-xs text-rose-600 mt-1 block">
                Incorrect master password. Please use <code>{ADMIN_MASTER_PASSWORD}</code>.
              </span>
            )}
          </div>

          <Button type="submit" className="full">
            <LockKeyhole size={16} /> Authenticate Admin Console
          </Button>
          <Button variant="ghost" className="full" onClick={close}>
            Cancel
          </Button>
        </form>
      </div>
    </div>
  )
}

function ReceiptModal({
  tx,
  close,
}: {
  tx: Transaction
  close: () => void
}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="modal receipt-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-icon text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
          <Button variant="icon" onClick={close}>
            <X size={18} />
          </Button>
        </div>
        <h2>Official Bank Wire Receipt</h2>
        <p className="text-xs text-muted mb-4">Wiko Safety Bank N.A. &bull; Clearinghouse Settlement</p>

        <div className="receipt-box">
          <div className="receipt-amount-row">
            <span>Amount Transferred</span>
            <strong>${tx.amount.toFixed(2)} {tx.currency}</strong>
          </div>
          <div className="receipt-divider" />
          <div className="receipt-row">
            <span>Transaction Reference</span>
            <code>{tx.reference}</code>
          </div>
          <div className="receipt-row">
            <span>Type / Description</span>
            <strong>{tx.title}</strong>
          </div>
          {tx.recipientBank && (
            <div className="receipt-row">
              <span>Destination Bank</span>
              <strong>{tx.recipientBank}</strong>
            </div>
          )}
          {tx.recipientAccount && (
            <div className="receipt-row">
              <span>Recipient Account</span>
              <strong>â€¢â€¢â€¢â€¢{tx.recipientAccount.slice(-4)}</strong>
            </div>
          )}
          {tx.recipientName && (
            <div className="receipt-row">
              <span>Beneficiary</span>
              <strong>{tx.recipientName}</strong>
            </div>
          )}
          <div className="receipt-row">
            <span>Date &amp; Timestamp</span>
            <span>{tx.timestamp}</span>
          </div>
          <div className="receipt-row">
            <span>Settlement Status</span>
            <span className="status-badge status-badge-completed">Settled</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1"
            variant="secondary"
            onClick={() => {
              window.print()
            }}
          >
            <Download size={15} /> Print Receipt
          </Button>
          <Button className="flex-1" onClick={close}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
