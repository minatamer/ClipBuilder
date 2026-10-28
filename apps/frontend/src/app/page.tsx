import styles from "./page.module.css";
import Image from "next/image";
import { HeroHeadline } from "./hero-headline";
import { LandingHeader } from "./landing-header";
import { PrivacyDialog } from "./privacy-dialog";
import { ProcessNarrative } from "./process-narrative";
import { SmoothScrollLink } from "./smooth-scroll-link";
import { BrandMark } from "../shared/ui/brand-mark";
import { ProductFilmHero } from "../features/product-film/product-film-hero";
import { TimeSavings } from "./time-savings";
import { CampaignWall } from "./campaign-wall";

const clippingPlatforms = [
  {
    name: "Whop",
    detail: "Content rewards",
    brand: "whop",
    width: 119,
    height: 26,
  },
  {
    name: "Clipster",
    detail: "Creator campaigns",
    brand: "clipster",
    width: 97,
    height: 23,
  },
  {
    name: "Picsart",
    detail: "Clipping campaigns",
    brand: "picsart",
    width: 104,
    height: 24,
  },
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

      <LandingHeader>
        <SmoothScrollLink
          className={styles.wordmark}
          href="#top"
          aria-label="ClipBuilder home"
        >
          <Wordmark />
        </SmoothScrollLink>

        <nav className={styles.primaryNav} aria-label="Primary navigation">
          <SmoothScrollLink href="#how-it-works">How it works</SmoothScrollLink>
          <PrivacyDialog triggerClassName={styles.navButton} />
        </nav>

        <a className={styles.headerAction} href="/start">
          Get Started
        </a>
      </LandingHeader>

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

            <ProductFilmHero />
          </div>
        </section>

        <ProcessNarrative />

        <section
          className={styles.finalSection}
          aria-labelledby="market-title"
          data-market-section
        >
          <div className={styles.marketIntro}>
            <p className={styles.eyebrowLight}>A market for your next cut</p>
            <h2 id="market-title">The clipping economy is live.</h2>
            <p>
              Brands and creators fund paid clipping campaigns on platforms like
              these.
            </p>
          </div>

          <CampaignWall>
            {clippingPlatforms.map((platform) => (
              <li
                className={styles.campaignLogo}
                data-brand={platform.brand}
                key={platform.name}
              >
                <div className={styles.campaignSurface}>
                  <span className={styles.campaignCategory} aria-hidden="true">
                    {platform.detail}
                  </span>
                  <Image
                    data-platform-logo
                    src={`/platforms/${platform.brand}.svg`}
                    alt={platform.name}
                    width={platform.width}
                    height={platform.height}
                  />
                </div>
              </li>
            ))}
          </CampaignWall>

          <p className={styles.marketDisclaimer}>
            Independent platforms. ClipBuilder is not affiliated with or
            partnered with these platforms. No earnings guarantee. Campaign
            availability, eligibility and payouts vary.
          </p>
        </section>

        <TimeSavings />
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
