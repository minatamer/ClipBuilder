import styles from "./page.module.css";
import { ProcessNarrative } from "./process-narrative";

const proofFacts = [
  ["Source", "Synthetic sample"],
  ["Range", "00:18.4–00:52.6"],
  ["Evidence", "Words 184–291"],
] as const;

export default function HomePage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <a
            className={styles.wordmark}
            href="#top"
            aria-label="ClipBuilder home"
          >
            <span className={styles.wordmarkMark} aria-hidden="true">
              <span />
              <span />
            </span>
            <span>ClipBuilder</span>
          </a>

          <nav className={styles.primaryNav} aria-label="Primary navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#product-proof">Product proof</a>
            <a href="#privacy">Privacy &amp; limits</a>
          </nav>

          <a className={styles.headerAction} href="#product-proof">
            View prototype
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className={styles.hero} id="top" aria-labelledby="hero-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroHalo} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.prototypeBadge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              Visual prototype · sample only
            </div>
            <h1 id="hero-title">Find the moment. Keep the final word.</h1>
            <p className={styles.heroCopy}>
              ClipBuilder turns one owned conversation into a grounded vertical
              edit—so you can see why the moment works, refine the cut, and stay
              in control.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#product-proof">
                Preview the sample experience
                <span aria-hidden="true">→</span>
              </a>
              <a className={styles.secondaryAction} href="#privacy">
                Review privacy &amp; limits
              </a>
            </div>
            <p className={styles.prototypeNote}>
              No upload or processing runs on this page.
            </p>

            <div className={styles.heroStage} aria-hidden="true">
              <div className={styles.heroStageTopline}>
                <span>Source conversation</span>
                <span>Grounded cut · sample</span>
              </div>
              <div className={styles.heroStageFlow}>
                <div className={styles.heroTranscriptCue}>
                  <span />
                  <span />
                  <strong />
                  <span />
                </div>
                <div className={styles.heroFlowLine}>
                  <span />
                </div>
                <div className={styles.heroCutCue}>
                  <span className={styles.heroCutLight} />
                  <span className={styles.heroCutSubject} />
                  <span className={styles.heroCutCaption} />
                </div>
              </div>
              <div className={styles.heroStageFoot}>
                <span>Transcript evidence</span>
                <strong>Visible → inspectable → reversible</strong>
                <span>00:34.2</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.productSection}
          id="product-proof"
          aria-labelledby="product-proof-title"
        >
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Product proof</p>
            <h2 id="product-proof-title">
              The decision stays attached to the evidence.
            </h2>
            <p>
              One synthetic moment shows the intended product language:
              transcript words, an exact source range, a vertical preview, and
              an edit you can inspect.
            </p>
          </div>

          <div className={styles.productFrame}>
            <div className={styles.productTopbar}>
              <div className={styles.windowControls} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p>Selected moment</p>
              <div className={styles.frameStatus}>
                <span aria-hidden="true" />
                Sample · grounded
              </div>
            </div>

            <div className={styles.productGrid}>
              <section
                className={styles.transcriptPanel}
                aria-labelledby="transcript-heading"
              >
                <div className={styles.panelHeading}>
                  <p id="transcript-heading">Transcript evidence</p>
                  <span>34.2 sec</span>
                </div>
                <div className={styles.transcriptBody}>
                  <p className={styles.speaker}>Speaker A · 00:18.4</p>
                  <p>
                    The useful edit starts with the constraint: every claim
                    needs a word range.
                  </p>
                  <p className={styles.speaker}>Speaker B · 00:24.8</p>
                  <p className={styles.highlightedWords}>
                    So the first pass is not magic. It is a proposal you can
                    inspect.
                  </p>
                  <p className={styles.speaker}>Speaker A · 00:34.1</p>
                  <p>
                    You see what changed, why it changed, and how to undo it.
                  </p>
                  <div className={styles.rangeOverview}>
                    <div className={styles.rangeLabels}>
                      <span>00:18.4</span>
                      <span>00:52.6</span>
                    </div>
                    <div className={styles.rangeTrack} aria-hidden="true">
                      <span />
                    </div>
                    <p>Words 184–291 · complete idea</p>
                  </div>
                </div>
              </section>

              <section
                className={styles.previewPanel}
                aria-labelledby="preview-heading"
              >
                <div className={styles.panelHeadingDark}>
                  <p id="preview-heading">9:16 preview</p>
                  <span>00:31.6</span>
                </div>
                <div className={styles.previewStage}>
                  <div className={styles.verticalVideo}>
                    <div className={styles.previewLight} aria-hidden="true" />
                    <div className={styles.previewSubject} aria-hidden="true">
                      <span />
                      <span />
                    </div>
                    <p className={styles.previewKicker}>One grounded moment</p>
                    <div className={styles.previewCaptions}>
                      <span>the first pass stays</span>
                      <strong>visible and reversible</strong>
                    </div>
                    <div className={styles.safeFrame} aria-hidden="true" />
                  </div>
                </div>
              </section>

              <aside className={styles.proofPanel} aria-label="Moment evidence">
                <div className={styles.panelHeading}>
                  <p>Why this moment</p>
                  <span>Candidate 01</span>
                </div>
                <div className={styles.proofBody}>
                  <span className={styles.selectedLabel}>Selected</span>
                  <h3>A complete idea with a clean close.</h3>
                  <p>
                    Clear setup, concrete mechanism, and a conclusion that works
                    without promising performance or guessing audience behavior.
                  </p>
                  <dl>
                    {proofFacts.map(([term, detail]) => (
                      <div key={term}>
                        <dt>{term}</dt>
                        <dd>{detail}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className={styles.reversibleNote}>
                    <span aria-hidden="true">↶</span>
                    <p>
                      <strong>Reversible by design</strong>
                      The future editor keeps Apply, undo, and manual controls.
                    </p>
                  </div>
                </div>
              </aside>
            </div>

            <div
              className={styles.timeline}
              aria-label="Synthetic source range overview"
            >
              <span className={styles.timelineLabel}>Source range</span>
              <div className={styles.timelineTrack} aria-hidden="true">
                <span className={styles.timelineSelection} />
                <span className={styles.timelinePlayhead} />
              </div>
              <span className={styles.timelineTime}>00:52.6</span>
            </div>
          </div>
        </section>

        <ProcessNarrative />

        <section
          className={styles.controlSection}
          aria-labelledby="control-title"
        >
          <div className={styles.controlCopy}>
            <p className={styles.eyebrowLight}>The last word stays yours</p>
            <h2 id="control-title">A first cut you can question.</h2>
            <p>
              ClipBuilder is designed around bounded proposals: the candidate
              cites its source, framing stays inspectable, and nothing applies
              without an explicit decision.
            </p>
          </div>
          <div className={styles.controlProof}>
            <div className={styles.proposalHeader}>
              <span>Proposed edit</span>
              <span>3 changes · not applied</span>
            </div>
            <div className={styles.proposalRows}>
              <p>
                <span>Trim</span>Start at word 184
              </p>
              <p>
                <span>Caption</span>Correct one transcript word
              </p>
              <p>
                <span>Visual</span>Add one grounded context cue
              </p>
            </div>
            <div
              className={styles.proposalActions}
              aria-label="Visual example of future proposal controls"
            >
              <span>Dismiss</span>
              <strong>Apply 3 changes</strong>
            </div>
            <p className={styles.staticControlNote}>
              Static visual example · controls arrive with editor behavior.
            </p>
          </div>
        </section>

        <section
          className={styles.privacySection}
          id="privacy"
          aria-labelledby="privacy-title"
        >
          <div>
            <p className={styles.eyebrow}>Privacy &amp; limits</p>
            <h2 id="privacy-title">Small scope. Plain limits.</h2>
          </div>
          <div className={styles.privacyGrid}>
            <article>
              <span>01</span>
              <h3>Owned media only</h3>
              <p>
                The eventual upload flow requires confirmation that you own or
                have permission to use the recording.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>One temporary edit</h3>
              <p>
                No account, dashboard, project history, batch workflow, or
                direct social publishing.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Visible bounds</h3>
              <p>
                Recommended: MP4 under 10 minutes and 250 MiB. Maximum: 20
                minutes and 500 MiB. Final clip: 10–60 seconds.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.finalSection} aria-labelledby="final-title">
          <p className={styles.eyebrow}>Visual approval prototype</p>
          <h2 id="final-title">One conversation. One grounded cut.</h2>
          <p>
            This running page is for visual review only. The safe sample and
            real workflow arrive in dependency-ordered tickets after approval.
          </p>
          <a className={styles.primaryAction} href="#top">
            Return to the top
            <span aria-hidden="true">↑</span>
          </a>
        </section>
      </main>

      <footer className={styles.siteFooter}>
        <a
          className={styles.wordmark}
          href="#top"
          aria-label="ClipBuilder home"
        >
          <span className={styles.wordmarkMark} aria-hidden="true">
            <span />
            <span />
          </span>
          <span>ClipBuilder</span>
        </a>
        <p>AI-assisted clipping · visual prototype · no live providers</p>
        <a href="#privacy">Privacy &amp; limits</a>
      </footer>
    </div>
  );
}
