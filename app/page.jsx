"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import CropModal from "../components/CropModal";
import { buildSignatureHtml } from "../lib/signature";
import { ROLE_OPTIONS, ORG_OPTIONS, COUNTRY_CODES } from "../lib/options";

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function slugify(s) {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function MascotCow() {
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduce) return;

    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = 210; // zone du hero
      const dx = (e.clientX - cx) / cx; // -1..1
      const dy = (e.clientY - cy) / (window.innerHeight || 800);
      setPos({ x: dx, y: dy });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce]);

  const anim = reduce
    ? { rotateX: 0, rotateY: 0, x: 0, y: 0 }
    : {
        rotateX: -pos.y * 10,
        rotateY: pos.x * 14,
        x: pos.x * 10,
        y: pos.y * 8
      };

  return (
    <motion.div
      className="mascotWrap"
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
      animate={anim}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
      aria-label="Mascotte OFA"
      title="Mascotte OFA"
    >
      <img className="mascotImg" src="/3d-cow.png" alt="Mascotte" />
    </motion.div>
  );
}

export default function Page() {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    fonction: "",
    org: "",
    telCountryCode: "32",
    telNumber: "",
    email: ""
  });

  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);

  const [croppedPngDataUrl, setCroppedPngDataUrl] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const [busyUpload, setBusyUpload] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const previewRef = useRef(null);

  const signatureHtml = useMemo(() => {
    if (!photoUrl) return "";
    return buildSignatureHtml({
      prenom: form.prenom,
      nom: form.nom,
      fonction: form.fonction,
      org: form.org || undefined,
      email: form.email,
      telCountryCode: form.telCountryCode,
      telNumber: form.telNumber,
      photoUrl
    });
  }, [form, photoUrl]);

  const handlePickFile = async (file) => {
    setError(null);
    setToast(null);
    const url = URL.createObjectURL(file);
    setRawImageSrc(url);
    setCropOpen(true);
  };

  const handleCropped = async (blob) => {
    setError(null);
    setToast(null);
    const dataUrl = await blobToDataUrl(blob);
    setCroppedPngDataUrl(dataUrl);
    setPhotoUrl(null); // require upload
  };

  const uploadToGithub = async () => {
    if (!croppedPngDataUrl) return;
    setBusyUpload(true);
    setError(null);
    setToast(null);

    try {
      const filename = `photo_${slugify(form.prenom + "-" + form.nom) || "member"}_${Date.now()}.png`;
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: croppedPngDataUrl, filename })
      });

      const json = await res.json();
      if (!res.ok) {
        const details = json?.details?.message ? ` — ${json.details.message}` : "";
        throw new Error((json?.error || "Upload failed") + details);
      }

      setPhotoUrl(json.assetUrl);
      setToast("Photo téléchargée sur GitHub ✅");
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setBusyUpload(false);
    }
  };

  const copyHtmlSource = async () => {
    try {
      await navigator.clipboard.writeText(signatureHtml);
      setToast("HTML copié ✅");
    } catch {
      setError("Impossible de copier (permissions navigateur). Utilise le téléchargement HTML.");
    }
  };

  const copyRendered = async () => {
    setError(null);
    setToast(null);

    const node = previewRef.current;
    if (!node) return;

    // 1) Clipboard API (text/html)
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([signatureHtml], { type: "text/html" });
        const item = new ClipboardItem({
          "text/html": blob,
          "text/plain": new Blob([signatureHtml], { type: "text/plain" })
        });
        await navigator.clipboard.write([item]);
        setToast("Signature (rendu) copiée ✅ — colle-la dans Gmail");
        return;
      }
    } catch {
      // fallback below
    }

    // 2) Fallback selection + execCommand
    try {
      const selection = window.getSelection();
      if (!selection) throw new Error("No selection");
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.addRange(range);
      document.execCommand("copy");
      selection.removeAllRanges();
      setToast("Signature copiée (fallback) ✅ — colle-la dans Gmail");
      return;
    } catch {
      setError("Copie du rendu impossible. Télécharge le HTML, ouvre-le, puis copie le bloc signature.");
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([signatureHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signature_${slugify(form.prenom + "_" + form.nom) || "ofa"}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      {/* HERO (remplace les anciens titres) */}
      <section className="hero">
        <motion.div
          className="heroEyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          ⚡ Outil interne • OFA
        </motion.div>

        <motion.h1
          className="heroTitle"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          Crée ta signature mail <span className="accent">pro</span> en 2 minutes
        </motion.h1>

        <MascotCow />
      </section>
      <section className="tutorialCard">
        <div className="tutorialHead">
          <h2 className="tutorialTitle">Tutoriel : comment créer ta siganture et l'enregistrer sur Gmail</h2>
        </div>

        <div className="videoFrame">
          <iframe
            src="https://youtu.be/hIU6o1F3_Hc"
            title="Tutoriel signature OFA"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
      <section className="sectionHero" aria-label="Séparation tutoriel et générateur">
        <div className="sectionHeroIcon">
          <img src="/signature-illu.png" alt="" aria-hidden="true" />
        </div>

        <h2 className="sectionHeroTitle">
          Car tout se joue au <span className="accent">bluff</span>
        </h2>
      </section>
      <div className="grid">
        <div className="card" id="step1">
          <h2 style={{ marginTop: 0 }}>1) Infos membre</h2>

          {/* Ligne 1 : prénom / nom */}
          <div className="row">
            <div>
              <label>Prénom</label>
              <input
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                placeholder="Ex: Eric"
              />
            </div>
            <div>
              <label>Nom</label>
              <input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex: Dupont"
              />
            </div>
          </div>

          {/* Ligne 2 : fonction / pôle-axe */}
          <div className="row">
            <div>
              <label>Fonction</label>
              <select
                value={form.fonction}
                onChange={(e) => setForm({ ...form, fonction: e.target.value })}
              >
                <option value="">— Aucune —</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Pôle/Axe</label>
              <select
                value={form.org}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
              >
                <option value="">— Aucun —</option>
                {ORG_OPTIONS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((it) => (
                      <option key={it} value={it}>
                        {it}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Ligne 3 : téléphone (seul) */}
          <div>
            <label>Téléphone</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={form.telCountryCode}
                onChange={(e) => setForm({ ...form, telCountryCode: e.target.value })}
                style={{ maxWidth: 240 }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.label + c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>

              <input
                value={form.telNumber}
                onChange={(e) => setForm({ ...form, telNumber: e.target.value })}
                placeholder="numéro sans indicatif"
              />
            </div>
            <div className="small">
              Exemple : sélectionner “Belgique (+32)” puis saisir “471234567”.
            </div>
          </div>

          {/* Ligne 4 : email (en dessous) */}
          <div style={{ marginTop: 12 }}>
            <label>Email OFA</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="mail@exemple.com"
            />
          </div>

          <hr />

          <h2>2) Photo</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePickFile(f);
            }}
          />
          <div className="small">
            Après téléchargement : recadrage rond. Export PNG 512×512.
          </div>

          {croppedPngDataUrl && (
            <>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={croppedPngDataUrl}
                  alt="preview"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 999,
                    background: "#fff",
                    border: "1px solid rgba(255,255,255,.12)"
                  }}
                />
                <div className="small">Photo prête à être téléchargée sur GitHub.</div>
              </div>

              <div className="actions">
                <button className="primary" onClick={uploadToGithub} disabled={busyUpload}>
                  {busyUpload ? "Upload..." : "Télécharger sur GitHub"}
                </button>
                <button onClick={() => setCropOpen(true)}>Recadrer à nouveau</button>
              </div>
            </>
          )}

          {photoUrl && <div className="toast">URL image : {photoUrl}</div>}

          {error && <div className="error">{error}</div>}
          {toast && <div className="toast">{toast}</div>}
        </div>

        <div className="card" id="step3">
          <h2 style={{ marginTop: 0 }}>3) Signature</h2>
          <div className="small">La signature est générée uniquement après le téléchargement de la photo.</div>

          <div className="previewWrap" style={{ marginTop: 12 }}>
            {signatureHtml ? (
              <div ref={previewRef} dangerouslySetInnerHTML={{ __html: signatureHtml }} />
            ) : (
              <div className="small">→ Remplis les infos, puis télécharge la photo pour voir la signature.</div>
            )}
          </div>

          <div className="actions">
            <button className="primary" disabled={!signatureHtml} onClick={copyRendered}>
              Copier la signature (rendu)
            </button>
            <button disabled={!signatureHtml} onClick={copyHtmlSource}>
              Copier HTML (source)
            </button>
            <button disabled={!signatureHtml} onClick={downloadHtml}>
              Télécharger .html
            </button>
          </div>

          <hr />

          <h3 style={{ marginTop: 0 }}>HTML (debug)</h3>
          <div className="code">{signatureHtml || "(vide)"}</div>
        </div>
      </div>

      <CropModal
        open={cropOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropOpen(false)}
        onDone={handleCropped}
      />
    </main>
  );
}
