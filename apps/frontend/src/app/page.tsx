import styles from "./page.module.css";
import { HeroHeadline } from "./hero-headline";
import { PrivacyDialog } from "./privacy-dialog";
import { ProcessNarrative } from "./process-narrative";
import { SmoothScrollLink } from "./smooth-scroll-link";
import { BrandMark } from "../shared/ui/brand-mark";

const clippingPlatforms = [
  { name: "whop", detail: "Content Rewards", brand: "whop" },
  { name: "CLIPPING", detail: "Campaign network", brand: "clipping" },
  { name: "Picsart", detail: "Clipping", brand: "picsart" },
  { name: "insy", detail: "Creator campaigns", brand: "insy" },
  { name: "Clipped", detail: "Pay per result", brand: "clipped" },
  { name: "AMPLIFY", detail: "CLIPS", brand: "amplify" },
  { name: "Clipster", detail: "Clipping campaigns", brand: "clipster" },
  { name: "ClipReward", detail: "Funded rewards", brand: "clipreward" },
  { name: "CLIPCO", detail: "Verified campaigns", brand: "clipco" },
] as const;

function Wordmark() {
  return (
    <>
      <BrandMark className={styles.wordmarkMark} />
      <span className={styles.wordmarkText}>ClipBuilder</span>
    </>
  );
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <SmoothScrollLink
            className={styles.wordmark}
            href="#top"
            aria-label="ClipBuilder home"
          >
            <Wordmark />
          </SmoothScrollLink>

          <nav className={styles.primaryNav} aria-label="Primary navigation">
            <SmoothScrollLink href="#how-it-works">
              How it works
            </SmoothScrollLink>
            <PrivacyDialog triggerClassName={styles.navButton} />
          </nav>

          <a className={styles.headerAction} href="/start">
            Get Started
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className={styles.hero} id="top" aria-labelledby="hero-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.heroBrand} data-hero-brand="true">
                <Wordmark />
              </p>
              <HeroHeadline />
              <p className={styles.heroDescription}>
                You bring the conversation. ClipBuilder finds the complete ideas
                worth clipping and turns your choice into a polished vertical
                cut, grounded in the source from first frame to final word.
              </p>
            </div>

            <div className={styles.heroMedia} aria-hidden="true">
              <div className={styles.heroMediaTopbar}>
                <div className={styles.windowControls}>
                  <span />
                  <span />
                  <span />
                </div>
                <p>Product motion preview</p>
                <span>00:24</span>
              </div>

              <div className={styles.heroMediaCanvas}>
                <div className={styles.heroMediaTranscript}>
                  <span />
                  <span />
                  <strong />
                  <span />
                </div>

                <div className={styles.heroMediaFocus}>
                  <div className={styles.heroPlayMark}>
                    <span />
                    <span />
                  </div>
                  <p>Reserved for the product motion story</p>
                </div>

                <div className={styles.heroMediaPhone}>
                  <div className={styles.heroPhoneLight} />
                  <div className={styles.heroPhoneSubject} />
                  <span />
                  <strong />
                </div>
              </div>

              <div className={styles.heroMediaFooter}>
                <span>Source</span>
                <span>Grounded moment</span>
                <span>Vertical cut</span>
              </div>
            </div>
          </div>
        </section>

        <ProcessNarrative />

        <section className={styles.finalSection} aria-labelledby="final-title">
          <div className={styles.marketIntro}>
            <p className={styles.eyebrowLight}>The clipping economy is live</p>
            <div className={styles.marketMetric}>
              <strong>9+</strong>
              <span>platforms publicly host paid clipping campaigns</span>
            </div>
            <h2 id="final-title">Your cut can carry the story further.</h2>
            <p>
              Brands and creators fund the brief. Clippers turn long-form
              moments into short-form attention—to entertain, to deliver, and,
              when the rules are met, to earn.
            </p>
            <p className={styles.marketCallout}>
              The next clip does not care when you started.
            </p>
          </div>

          <ul
            className={styles.campaignWall}
            aria-label="Platforms with public paid clipping campaigns"
          >
            {clippingPlatforms.map((platform) => (
              <li
                className={styles.campaignLogo}
                data-platform-logo
                data-brand={platform.brand}
                key={platform.name}
              >
                <strong>{platform.name}</strong>
                <span>{platform.detail}</span>
              </li>
            ))}
          </ul>

          <p className={styles.marketDisclaimer}>
            Public campaign platforms shown as market examples. No affiliation
            or earnings guarantee. Availability, eligibility, payout rates, and
            campaign rules vary.
          </p>

          <SmoothScrollLink className={styles.backToTop} href="#top">
            Back to top
            <span aria-hidden="true">↑</span>
          </SmoothScrollLink>
        </section>
      </main>

      <footer className={styles.siteFooter}>
        <SmoothScrollLink
          className={styles.wordmark}
          href="#top"
          aria-label="ClipBuilder home"
        >
          <Wordmark />
        </SmoothScrollLink>
      </footer>
    </div>
  );
}
