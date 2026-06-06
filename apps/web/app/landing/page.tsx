import styles from './landing.module.css'

const features = [
  {
    icon: 'pdf',
    title: 'Upload and sign PDFs instantly',
    copy: 'Drop in a contract, place your signature, and send it out in a familiar flow.',
  },
  {
    icon: 'wallet',
    title: 'Base and Stellar payments',
    copy: 'Let users pay before signing through wallet-native payment flows on both supported testnets.',
  },
  {
    icon: 'team',
    title: 'Team collaboration',
    copy: 'Share documents, assign signers, and keep workspace access clear for every member.',
  },
  {
    icon: 'chain',
    title: 'Tamper-evident verification',
    copy: 'Preserve document hashes and payment proof without publishing the private PDF on-chain.',
  },
]

const trustCards = [
  ['Payment proof', 'Each paid signing action can be tied to a recorded wallet payment attempt.'],
  ['Document integrity', 'Signed files can be verified by hash while the document itself stays private.'],
  ['Clear consent', 'Users review the document, network, and amount before approving payment.'],
]

function Icon({ name }: { name: string }) {
  const common = {
    width: 30,
    height: 30,
    viewBox: '0 0 30 30',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  }

  if (name === 'wallet') {
    return (
      <svg {...common}>
        <path d="M6 9.5h16.5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-12A2.5 2.5 0 0 1 5.5 6H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20.5 15.5h5v4h-5a2 2 0 0 1 0-4Z" fill="currentColor" opacity=".22" />
        <path d="M21.25 17.5h.1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'team') {
    return (
      <svg {...common}>
        <path d="M11.5 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor" opacity=".2" />
        <path d="M11.5 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 24c.6-4.3 3.3-6.5 7.5-6.5s6.9 2.2 7.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 14.2a3.5 3.5 0 1 0-1.1-6.8M19.5 17.8c3.4.3 5.6 2.4 6.1 6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'chain') {
    return (
      <svg {...common}>
        <path d="M12.2 10.2 9.8 7.8a4.5 4.5 0 0 0-6.4 6.4l3 3a4.5 4.5 0 0 0 6.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="m17.8 19.8 2.4 2.4a4.5 4.5 0 0 0 6.4-6.4l-3-3a4.5 4.5 0 0 0-6.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="m11.5 18.5 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M8 3h10l6 6v18H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="currentColor" opacity=".14" />
      <path d="M8 3h10l6 6v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 3v7h6M10 16h10M10 21h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <main className={styles.landing} id="top">
      <nav className={styles.navbar} aria-label="Primary navigation">
        <div className={styles.container}>
          <div className={`${styles.navShell} liquid-glass`}>
            <a className={styles.brand} href="#top" aria-label="SignHere home">
              <img src="/main_logo.png" alt="" width="44" height="44" />
              <span>SignHere</span>
            </a>
            <div className={styles.navLinks}>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#docs">Docs</a>
              <a href="/auth/login">Login</a>
            </div>
            <a className={styles.navCta} href="/sign">Sign Now</a>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopyBlock}>
              <p className={styles.eyebrow}>Blockchain e-signatures for real documents</p>
              <h1>Sign documents smarter, not harder.</h1>
              <p className={styles.heroCopy}>
                Secure, fast, wallet-powered signatures for individuals and teams, now supporting Base and Stellar testnet payments.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="/sign">Start Signing</a>
                <a className={styles.secondaryButton} href="/auth/login">Connect Wallet</a>
              </div>
              <div className={styles.heroNotes} aria-label="Product highlights">
                <span>Base payments</span>
                <span>Stellar testnet</span>
                <span>Document hash proof</span>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={`${styles.documentFloat} liquid-glass`}>
                <div className={styles.docTop}>
                  <span>Service Agreement.pdf</span>
                  <b>Ready</b>
                </div>
                <div className={styles.docLines}>
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.signatureBox}>
                  <span>Place signature</span>
                  <svg viewBox="0 0 260 64" aria-hidden="true">
                    <path d="M9 42c23-30 38-30 45-3 5 19 24 12 39-10 17-25 33-23 28 3-5 25 32 16 128-17" />
                  </svg>
                </div>
              </div>
              <img className={styles.mascot} src="/main_logo.png" alt="SignHere mascot holding a pen" />
              <div className={`${styles.verifyBadge} liquid-glass`}>
                <span className={styles.pulseDot} />
                Verified on Base
              </div>
              <div className={`${styles.walletPill} liquid-glass`}>Freighter ready</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.previewSection} id="docs">
        <div className={styles.container}>
          <div className={styles.previewGrid}>
            <div>
              <p className={styles.sectionKicker}>Product Preview</p>
              <h2>A calm dashboard for real signing work</h2>
              <p className={styles.sectionCopy}>
                Keep documents, payments, signers, and verification state in one workspace without hiding your original brand personality.
              </p>
            </div>
            <div className={`${styles.dashboardMock} liquid-glass`}>
              <div className={styles.dashboardTop}>
                <div>
                  <strong>Documents</strong>
                  <span>Team workspace</span>
                </div>
                <div className={styles.connected}>Wallet connected</div>
              </div>
              <div className={styles.docList}>
                {['Creator agreement', 'Rental addendum', 'Invoice approval'].map((item, index) => (
                  <div className={styles.docRow} key={item}>
                    <div>
                      <b>{item}</b>
                      <span>{index === 0 ? '2 signers waiting' : index === 1 ? 'Signed 12 minutes ago' : 'Hash pending'}</span>
                    </div>
                    <em className={index === 0 ? styles.pending : styles.signed}>{index === 0 ? 'Pending' : index === 1 ? 'Signed' : 'Verify'}</em>
                  </div>
                ))}
              </div>
              <div className={styles.emptyState}>
                <img src="/main_logo.png" alt="" width="44" height="44" />
                <span>Your signature assistant is ready.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection} id="features">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>Core Features</p>
            <h2>Crypto-native without the crypto headache</h2>
            <p>Clear signing, simple payments, and blockchain verification that still feels friendly.</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <article className={`${styles.featureCard} liquid-glass`} key={feature.title}>
                <span className={styles.featureIcon}><Icon name={feature.icon} /></span>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.trustGrid}>
            <div>
              <p className={styles.sectionKicker}>Powered by blockchain security</p>
              <h2>Trust users can verify from day one</h2>
              <p className={styles.sectionCopy}>
                The new design keeps your own mascot and icon, while the interface focuses on proof, consent, and payment clarity.
              </p>
            </div>
            <div className={styles.trustCards}>
              {trustCards.map(([title, copy]) => (
                <div className={`${styles.trustCard} liquid-glass`} key={title}>
                  <b>{title}</b>
                  <span>{copy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.pricingSection} id="pricing">
        <div className={styles.container}>
          <div className={`${styles.ctaPanel} liquid-glass`}>
            <img src="/main_logo.png" alt="" width="92" height="92" />
            <p className={styles.sectionKicker}>Simple pricing model</p>
            <h2>Pay per signature, then scale into teams</h2>
            <p>Individual users pay only when they sign. Teams can grow into owner-managed workspace access.</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="/sign">Start Signing</a>
              <a className={styles.secondaryButton} href="/auth/login">Connect Wallet</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
