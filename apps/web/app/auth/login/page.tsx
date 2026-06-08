'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

/* ─── Types ─────────────────────────────────────────── */
type Panel = 'login' | 'signup'
type WalletProvider = 'metamask' | 'freighter'

/* ─── Left panel illustration ───────────────────────── */
function LeftPanel({ panel }: { panel: Panel }) {
  return (
    <div className={styles.left}>
      {/* Grid texture */}
      <div className={styles.leftGrid} aria-hidden="true" />

      {/* Card stack illustration */}
      <div className={styles.cardStack} aria-hidden="true">
        <div className={`${styles.card} ${styles.cardB1}`} />
        <div className={`${styles.card} ${styles.cardB2}`} />
        <div className={`${styles.card} ${styles.cardHero}`}>
          <div className={styles.cardInner}>
            <span className={styles.signWord}>SIGN</span>
            <div className={styles.signRule} />
            <span className={styles.hereWord}>HERE</span>

            {/* Ruled lines */}
            <div className={styles.ruledLines}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={styles.ruleLine}>
                  <span className={styles.xMark}>×</span>
                  <span className={styles.ruleBar} />
                </div>
              ))}
            </div>

            {/* Signature strokes */}
            <svg className={styles.sigSvg} viewBox="0 0 340 80" fill="none">
              <path d="M8 24 Q38 8 66 20 Q100 4 128 16" stroke="#5A5A5A" strokeWidth="2" strokeLinecap="round"/>
              <path d="M150 30 Q182 14 212 26 Q244 10 272 22" stroke="#5A5A5A" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 56 Q50 40 88 52 Q132 36 170 48 Q208 32 246 44" stroke="#484848" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom brand */}
      <div className={styles.leftBrand}>
        <div className={styles.leftRule} />
        <p className={styles.leftLabel}>
          {panel === 'login'
            ? 'INK COVENANT — Secure Document Platform'
            : 'INK COVENANT — Join the Platform'}
        </p>
      </div>

      {/* Dot matrix */}
      <div className={styles.dotMatrix} aria-hidden="true">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className={styles.dot} />
        ))}
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter()

  // Auth state
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Panel / transition state
  const [panel, setPanel]         = useState<Panel>('login')
  const [transitioning, setTrans] = useState(false)

  // Sign-up form state
  const [suName,     setSuName]     = useState('')
  const [suEmail,    setSuEmail]    = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm,  setSuConfirm]  = useState('')
  const [suError,    setSuError]    = useState('')
  const [suLoading,  setSuLoading]  = useState(false)
  const [showPwd,    setShowPwd]    = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [walletConnecting, setWalletConnecting] = useState<WalletProvider | null>(null)

  /* Switch panel with a slide transition */
  const switchPanel = (to: Panel) => {
    if (transitioning || panel === to) return
    setTrans(true)
    setError('')
    setSuError('')
    setTimeout(() => {
      setPanel(to)
      setTrans(false)
    }, 380)
  }

  /* Login submit */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signIn('credentials', { email, password, redirect: false })

      if (result?.error) {
        setError('Invalid email or password.')
        return
      }
      if (result?.ok) router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  /* Navigate to register page with transition */
  const handleCreateAccount = () => {
    setTrans(true)
    setTimeout(() => {
      router.push('/auth/register')
    }, 380)
  }

  const connectWallet = async (provider: WalletProvider) => {
    setWalletError('')
    setWalletConnecting(provider)

    try {
      if (provider === 'metamask') {
        const ethereum = (window as typeof window & {
          ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
        }).ethereum

        if (!ethereum) {
          setWalletError('MetaMask was not found. Install the extension and try again.')
          return
        }

        await ethereum.request({ method: 'eth_requestAccounts' })
        setWalletOpen(false)
        return
      }

      const freighter = await import('@stellar/freighter-api')
      const connected = await freighter.isConnected()
      const isConnected = typeof connected === 'boolean'
        ? connected
        : Boolean((connected as { isConnected?: boolean }).isConnected)

      if (!isConnected) {
        setWalletError('Freighter was not found. Install the extension and try again.')
        return
      }

      const allowed = await freighter.isAllowed()
      const isAllowed = typeof allowed === 'boolean'
        ? allowed
        : Boolean((allowed as { isAllowed?: boolean }).isAllowed)

      if (!isAllowed) {
        await freighter.setAllowed()
      }

      await freighter.getAddress()
      setWalletOpen(false)
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Wallet connection failed.')
    } finally {
      setWalletConnecting(null)
    }
  }

  /* Sign-up submit (stub — wire to your API) */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (suPassword !== suConfirm) {
      setSuError('Passwords do not match.')
      return
    }
    setSuLoading(true)
    setSuError('')
    try {
      // TODO: call your register API here
      await new Promise((r) => setTimeout(r, 800))
      switchPanel('login')
    } catch {
      setSuError('Registration failed. Please try again.')
    } finally {
      setSuLoading(false)
    }
  }

  /* ── Render ── */
  return (
    <div className={styles.page}>
      <div className={`${styles.card2} ${transitioning ? styles.cardSlide : ''}`}>

        {/* Left: always visible illustration */}
        <LeftPanel panel={panel} />

        {/* Right: form area */}
        <div className={styles.right}>

          {/* ── Login panel ── */}
          <div className={`${styles.formPanel} ${panel === 'login' ? styles.panelVisible : styles.panelHidden}`}>

            <div className={styles.formHead}>
              <h1 className={styles.formTitle}>Sign in</h1>
              <p className={styles.formSub}>
                No account?{' '}
                <button className={styles.switchBtn} onClick={handleCreateAccount}>
                  Create one
                </button>
              </p>
            </div>

            {error && <div className={styles.alertBox}>{error}</div>}

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Password</label>
                  <a href="/auth/forgot-password" className={styles.forgotLink}>
                    Forgot password?
                  </a>
                </div>
                <div className={styles.inputWrap}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPwd ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading && <span className={styles.spinner} />}
                Sign in
              </button>
            </form>

            <div className={styles.orRow}><span>or</span></div>
            <div className={styles.socialRow}>
              <button 
                type="button"
                className={styles.socialBtn}
                onClick={() => signIn('google', { redirect: true, callbackUrl: '/dashboard' })}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <button
              type="button"
              className={styles.walletEntryBtn}
              onClick={() => {
                setWalletError('')
                setWalletOpen(true)
              }}
            >
              Connect wallet
            </button>
          </div>

          {/* ── Sign-up panel ── */}
          <div className={`${styles.formPanel} ${panel === 'signup' ? styles.panelVisible : styles.panelHidden}`}>

            <button className={styles.backBtn} onClick={() => switchPanel('login')}>
              ← Back to sign in
            </button>

            <div className={styles.formHead}>
              <h1 className={styles.formTitle}>Create account</h1>
              <p className={styles.formSub}>Start signing documents in seconds.</p>
            </div>

            {suError && <div className={styles.alertBox}>{suError}</div>}

            <form onSubmit={handleSignUp} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Jane Smith"
                  value={suName}
                  onChange={(e) => setSuName(e.target.value)}
                  required
                  autoFocus={panel === 'signup'}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  value={suEmail}
                  onChange={(e) => setSuEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Min. 8 characters"
                    value={suPassword}
                    onChange={(e) => setSuPassword(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Confirm password</label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Repeat password"
                    value={suConfirm}
                    onChange={(e) => setSuConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={suLoading}>
                {suLoading && <span className={styles.spinner} />}
                Create account
              </button>
            </form>

            <p className={styles.termsNote}>
              By creating an account you agree to our{' '}
              <a href="/terms" className={styles.termsLink}>Terms &amp; Conditions</a>.
            </p>
          </div>

        </div>{/* /right */}
      </div>{/* /card2 */}

      {walletOpen && (
        <div className={styles.walletOverlay} role="dialog" aria-modal="true" aria-labelledby="wallet-title">
          <div className={styles.walletDialog}>
            <button
              className={styles.walletClose}
              type="button"
              aria-label="Close wallet dialog"
              onClick={() => setWalletOpen(false)}
            >
              x
            </button>

            <div className={styles.walletHeader}>
              <h2 id="wallet-title">Connect Wallet</h2>
              <p>
                Connect a wallet to prepare blockchain payment and verification for document signing.
              </p>
            </div>

            {walletError && <div className={styles.walletError}>{walletError}</div>}

            <div className={styles.walletOptions}>
              <button
                type="button"
                className={styles.walletOption}
                onClick={() => connectWallet('metamask')}
                disabled={walletConnecting !== null}
              >
                <span className={styles.metamaskIcon}>M</span>
                <span>
                  <b>MetaMask</b>
                  <small>Base Sepolia payments</small>
                </span>
                {walletConnecting === 'metamask' && <em>Connecting...</em>}
              </button>

              <button
                type="button"
                className={styles.walletOption}
                onClick={() => connectWallet('freighter')}
                disabled={walletConnecting !== null}
              >
                <span className={styles.freighterIcon}>F</span>
                <span>
                  <b>Freighter</b>
                  <small>Stellar testnet payments</small>
                </span>
                {walletConnecting === 'freighter' && <em>Connecting...</em>}
              </button>
            </div>

            <div className={styles.walletHelp}>
              <b>Still not using a crypto wallet?</b>
              <p>Wallets let you approve Base and Stellar testnet payments before signing documents.</p>
              <a href="/sign">Learn how signing payments work</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
