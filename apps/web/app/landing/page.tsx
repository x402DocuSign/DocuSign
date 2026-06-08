'use client'

import { useEffect, useState } from 'react'
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

const workflowTabs = [
  { id: 'upload', label: 'Upload', icon: 'chart' },
  { id: 'prepare', label: 'Prepare', icon: 'book' },
  { id: 'sign', label: 'Sign', icon: 'users' },
  { id: 'verify', label: 'Verify', icon: 'rocket' },
] as const

type WorkflowTab = typeof workflowTabs[number]['id']

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

  if (name === 'star') {
    return (
      <svg {...common}>
        <path d="m15 3 3.5 7.1 7.8 1.1-5.7 5.5 1.4 7.8-7-3.7-7 3.7 1.4-7.8-5.7-5.5 7.8-1.1L15 3Z" fill="currentColor" />
      </svg>
    )
  }

  if (name === 'chevron') {
    return (
      <svg {...common} width={18} height={18} viewBox="0 0 18 18">
        <path d="m4.5 6.75 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'chart') {
    return (
      <svg {...common}>
        <path d="M6 24V12M15 24V6M24 24V15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M4 24h22" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'book') {
    return (
      <svg {...common}>
        <path d="M6 5h9a4 4 0 0 1 4 4v16H9a3 3 0 0 0-3 3V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M19 8h3a2 2 0 0 1 2 2v15h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg {...common}>
        <path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 25c.7-4.5 3.2-6.8 7.5-6.8s6.8 2.3 7.5 6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M21 14.8a3.5 3.5 0 1 0-.9-6.8M21.2 18.3c2.8.6 4.5 2.8 5 6.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'rocket') {
    return (
      <svg {...common}>
        <path d="M16 5c4.8.4 7.8 3.4 8.2 8.2l-7.8 7.8-7.4-7.4L16 5Z" fill="currentColor" opacity=".16" />
        <path d="M16 5c4.8.4 7.8 3.4 8.2 8.2l-7.8 7.8-7.4-7.4L16 5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 13.5H5.8L3.8 19l5.2-2M16.5 21l-2 5.2 5.5-2v-3.2M17.8 11.3h.1" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [activeTab, setActiveTab] = useState<WorkflowTab>('upload')

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('signhere-theme')
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme)
      document.documentElement.dataset.theme = storedTheme
      return
    }

    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light')
      document.documentElement.dataset.theme = 'light'
    } else {
      document.documentElement.dataset.theme = 'dark'
    }
  }, [])

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
      window.localStorage.setItem('signhere-theme', nextTheme)
      document.documentElement.dataset.theme = nextTheme
      return nextTheme
    })
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTab((currentTab) => {
        const currentIndex = workflowTabs.findIndex((tab) => tab.id === currentTab)
        return workflowTabs[(currentIndex + 1) % workflowTabs.length].id
      })
    }, 4000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <main className={styles.landing} data-theme={theme} id="top">
      <nav className={styles.navbar} aria-label="Primary navigation">
        <div className={styles.container}>
          <div className={`${styles.navShell} liquid-glass`}>
            <a className={styles.brand} href="#top" aria-label="SignHere home">
              <img src="/main_logo.png" alt="" width="44" height="44" />
              <span>SignHere</span>
            </a>
            <div className={styles.navLinks}>
              <a href="#features">Solutions</a>
              <a href="#pricing">For Teams</a>
              <a href="#docs">Docs</a>
              <a href="/auth/login">Login</a>
            </div>
            <button
              className={styles.themeToggle}
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'light'}
            >
              <span className={styles.themeTrack} aria-hidden="true">
                <span className={styles.themeKnob} />
              </span>
            </button>
            <a className={styles.navCta} href="/sign">Sign Now</a>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroShell}>
            <h1 className={styles.heroTitle} style={{ animationDelay: '0.2s', opacity: 0 }}>
              Sign Faster. Verify Smarter.
              <span>Blockchain Powers Trust.</span>
            </h1>

            <p className={styles.heroCopy} style={{ animationDelay: '0.3s', opacity: 0 }}>
              Upload, prepare, pay, and sign documents with a clean eSign workflow backed by Base and Stellar testnet verification.
            </p>

            <div className={styles.heroActions} style={{ animationDelay: '0.4s', opacity: 0 }}>
              <a className={styles.primaryButton} href="/sign">Start Signing Free</a>
            </div>

            <div className={styles.workflowTabs} style={{ animationDelay: '0.5s', opacity: 0 }} role="tablist" aria-label="Signing workflow">
              {workflowTabs.map((tab, index) => (
                <button
                  key={tab.id}
                  className={`${styles.workflowTab} ${activeTab === tab.id ? styles.workflowTabActive : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon name={tab.icon} />
                  <span>{tab.label}</span>
                  {index < workflowTabs.length - 1 && <i aria-hidden="true" />}
                </button>
              ))}
            </div>

            <div className={styles.heroDemo} style={{ animationDelay: '0.6s', opacity: 0 }}>
              <video
                className={styles.demoVideo}
                src={theme === 'dark' ? '/night_theme.mp4' : '/light_theme.mp4'}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>

            <div className={styles.partnerRow} style={{ animationDelay: '0.7s', opacity: 0 }} aria-label="Supported workflow">
              <span>PDF</span>
              <span>Base</span>
              <span>Stellar</span>
              <span>Freighter</span>
              <span>Audit Trail</span>
              <span>Teams</span>
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
