import "./globals.css";

export const metadata = {
  title: "OFA — Signatures",
  description: "Outil interne OFA (signature mail).",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <div className="appShell">
          <header className="topbar">
            <div className="topbarInner">
              <div className="topbarContent">
                <div className="brand">
                  <img
                    src="/ofa-logo-white.png"
                    alt="OFA Collectif ASBL"
                    className="brandLogo"
                  />
                  <div className="brandText">
                    <b>OFA Collectif ASBL</b>
                  </div>
                </div>

                <div className="badge">Réservé aux membres effectifs OFA</div>
              </div>
            </div>
          </header>

          <main className="container">{children}</main>

          <footer className="footer">
            <div className="footerInner">
              <div className="footerContent">
                <div>© {new Date().getFullYear()} OFA Collectif ASBL</div>

                <div className="footerLinks">
                  <a
                    href="https://www.instagram.com/ofa_collectif/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.tiktok.com/@ofa_collectif"
                    target="_blank"
                    rel="noreferrer"
                  >
                    TikTok
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ofa-collectif-99679b301/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
