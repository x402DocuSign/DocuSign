import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`${styles.logo} imgLight`}
            src="/turborepo-dark.svg"
            alt="Logo"
            width={180}
            height={38}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`${styles.logo} imgDark`}
            src="/turborepo-light.svg"
            alt="Logo"
            width={180}
            height={38}
          />
        </>

        <h1>ESIGN Platform</h1>
        <p>Secure document signing system</p>

        <ol>
          <li>Edit <code>apps/web/app/page.tsx</code></li>
          <li>Build your ESIGN features 🚀</li>
        </ol>

        <div className={styles.ctas}>
          <a href="/auth/login" className={styles.primary}>
            Go to Login
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 ESIGN Platform</p>
      </footer>
    </div>
  );
}