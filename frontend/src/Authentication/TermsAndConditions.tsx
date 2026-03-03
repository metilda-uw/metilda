import React, { useEffect, useRef, useState } from "react";
import { withRouter } from "react-router-dom";
import * as ROUTES from "../constants/routes";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

type TncDoc = {
  currentTncVersion: number;
  tncHtml?: string | null;
  updatedTime?: firebase.firestore.Timestamp | null;
};

// normalize email for doc id
const emailKey = (u: firebase.User | null) =>
  u?.email ? u.email.trim().toLowerCase() : null;

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    maxWidth: 1100,
    margin: "24px auto",
    padding: 20,
    boxSizing: "border-box",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e6e6e6",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 6px 18px rgba(20,20,20,0.06)",
  },
  titleRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "0.2px",
  },
  versionBadge: {
    background: "#f1f5f9",
    color: "#0f172a",
    padding: "4px 8px",
    borderRadius: 8,
    fontSize: 13,
    border: "1px solid #e2e8f0",
  },
  container: {
    marginTop: 16,
  },
  scrollBox: {
    width: "100%",
    height: 520,
    overflowY: "auto",
    padding: 22,
    borderRadius: 8,
    border: "1px solid #eef2f7",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
    background: "linear-gradient(180deg,#fff,#fbfdff)",
    boxSizing: "border-box",
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  progressText: {
    fontSize: 13,
    color: "#475569",
  },
  progressBarOuter: {
    flex: 1,
    height: 10,
    background: "#eef2f7",
    borderRadius: 6,
    overflow: "hidden",
    marginLeft: 12,
    marginRight: 12,
  },
  progressBarInner: {
    height: "100%",
    background: "linear-gradient(90deg,#10b981,#06b6d4)",
    borderRadius: 6,
    transition: "width 240ms ease",
  },
  footer: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: 18,
  },
  acceptBtn: {
    background: "#0ea5a4",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 6px 14px rgba(14,165,164,0.12)",
  },
  acceptBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    background: "#0ea5a4",
  },
  declineBtn: {
    background: "transparent",
    border: "1px solid #e2e8f0",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },
  article: {
    textAlign: "justify",
    lineHeight: 1.6,
  },
  emptyMessage: {
    color: "#475569",
    fontSize: 15,
  },
};

function TermsAndConditionsBase({ history }: { history: any }) {
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState<number | null>(null);
  const [contentHtml, setContentHtml] = useState<string | null>(null);

  const [canAccept, setCanAccept] = useState(false);
  const [readPct, setReadPct] = useState(0);
  const scrollBoxRef = useRef<HTMLDivElement | null>(null);

  // Helper to compute progress and bottom-reached
  const recomputeScrollState = () => {
    const el = scrollBoxRef.current;
    if (!el) return;

    const { scrollTop, clientHeight, scrollHeight } = el;
    const atEndBufferPx = 8; 
    const atEnd = scrollTop + clientHeight >= scrollHeight - atEndBufferPx;

    const pct =
      scrollHeight <= 0
        ? 100
        : Math.min(100, Math.round(((scrollTop + clientHeight) / scrollHeight) * 100));

    setReadPct(pct);

    // If content doesn't overflow (no scroll), allow accept immediately
    if (scrollHeight <= clientHeight + 1) {
      setCanAccept(true);
    } else {
      setCanAccept(atEnd);
    }
  };

  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        history.replace(ROUTES.SIGN_IN);
        return;
      }

      try {
        const db = firebase.firestore();

        // 1) latest T&C
        const tncSnap = await db
          .collection("TermsAndConditions")
          .orderBy("currentTncVersion", "desc")
          .limit(1)
          .get({ source: "server" });

        let currentVersion = 1;
        let html: string | null = null;

        if (!tncSnap.empty) {
          const data = tncSnap.docs[0].data() as Partial<TncDoc>;
          const v = Math.trunc(Number(data.currentTncVersion));
          currentVersion = Number.isFinite(v) ? v : 1;
          html = typeof data.tncHtml === "string" ? data.tncHtml : null;
        }

        // 2) accepted version by email-keyed doc
        const ek = emailKey(user);
        if (!ek) {
          history.replace(ROUTES.SIGN_IN);
          return;
        }
        const userDoc = await db.doc(`users/${ek}`).get({ source: "server" });
        const acceptedRaw = userDoc.exists ? userDoc.get("acceptedTncVersion") : undefined;
        const accepted = Math.trunc(Number(acceptedRaw));

        // 3) redirect if up-to-date
        if (Number.isFinite(accepted) && accepted === currentVersion) {
          history.replace(ROUTES.HOME);
          return;
        }

        setVersion(currentVersion);
        setContentHtml(html);
      } catch (e) {
        console.error("Failed to load Terms & Conditions:", e);
        setVersion(1);
        setContentHtml(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [history]);

  useEffect(() => {
    const id = setTimeout(recomputeScrollState, 0);
    window.addEventListener("resize", recomputeScrollState);

    window.addEventListener("load", recomputeScrollState);

    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", recomputeScrollState);
      window.removeEventListener("load", recomputeScrollState);
    };
  }, [contentHtml, loading]);

  const handleAccept = async () => {
    if (!canAccept) return;

    const user = firebase.auth().currentUser;
    if (!user || version == null) return;

    const ek = emailKey(user);
    if (!ek) return;

    try {
      const vInt = Math.trunc(Number(version));
      const userRef = firebase.firestore().doc(`users/${ek}`);

      await userRef.set(
        {
          acceptedTncVersion: vInt,
          acceptedTncAt: firebase.firestore.FieldValue.serverTimestamp(),
          userEmail: user.email,
        },
        { merge: true }
      );

      await userRef.get({ source: "server" });
      history.replace(ROUTES.HOME);
    } catch (e) {
      console.error("Failed to accept T&C:", e);
    }
  };

  const handleDecline = () => history.replace(ROUTES.SIGN_IN);

  if (loading) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div style={styles.titleRow}>
            <h1 style={styles.title}>MeTILDA Terms of Use</h1>
            {version != null && <div style={styles.versionBadge}>v{version}</div>}
          </div>
          <div style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
            These terms govern your access to and use of MeTILDA. Please read carefully.
          </div>
        </header>

        <section>
          <div
            ref={scrollBoxRef}
            onScroll={recomputeScrollState}
            style={styles.scrollBox}
            aria-label="Terms and conditions content"
          >
            {contentHtml ? (
              <>
                <style>{`
                  /* Headings: centered and bold (colors inherited) */
                  .tnc-article h1, .tnc-article h2, .tnc-article h3, .tnc-article h4, .tnc-article h5, .tnc-article h6 {
                    text-align: center !important;
                    font-weight: 700 !important;
                    margin: 14px 0 8px !important;
                    line-height: 1.2 !important;
                  }

                  /* Size adjustments for visual hierarchy (keeps color inherited) */
                  .tnc-article h1 { font-size: 22px !important; }
                  .tnc-article h2 { font-size: 18px !important; }
                  .tnc-article h3 { font-size: 16px !important; }

                  /* Body text: justified, color inherited from page */
                  .tnc-article p, .tnc-article div, .tnc-article li, .tnc-article span {
                    text-align: justify !important;
                  }

                  /* List spacing tweak */
                  .tnc-article ul, .tnc-article ol { margin: 8px 0 12px 1.25rem !important; }
                `}</style>
                <article
                  className="tnc-article"
                  style={styles.article}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </>
            ) : (
              <article>
                <p style={styles.emptyMessage}>
                  Terms & Conditions content isn’t available yet. Please contact an
                  administrator.
                </p>
              </article>
            )}
          </div>

          <div style={styles.progressRow} aria-hidden={false}>
            <div style={styles.progressText}>
              Progress: <strong>{readPct}%</strong>
            </div>

            <div style={styles.progressBarOuter} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={readPct}>
              <div style={{ ...styles.progressBarInner, width: `${readPct}%` }} />
            </div>

            <div style={{ minWidth: 120, textAlign: "right", color: "#475569", fontSize: 13 }}>
              {canAccept ? "Ready to accept" : "Continue reading"}
            </div>
          </div>

          <footer style={styles.footer}>
            <button
              className="globalbtn"
              onClick={handleAccept}
              disabled={!canAccept}
              aria-disabled={!canAccept}
              style={{
                ...styles.acceptBtn,
                ...(canAccept ? {} : styles.acceptBtnDisabled),
              }}
              title="Accept the Terms"
            >
              I Accept
            </button>

            <button onClick={handleDecline} style={styles.declineBtn}>
              Decline
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}

export default withRouter(TermsAndConditionsBase);
