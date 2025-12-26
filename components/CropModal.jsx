"use client";

import React, { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedCirclePng } from "../lib/crop";

export default function CropModal({ open, imageSrc, onClose, onDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setBusy(false);
      setErr(null);
    }
  }, [open]);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleDone = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    setErr(null);
    try {
      const blob = await getCroppedCirclePng(imageSrc, croppedAreaPixels, 512);
      onDone(blob);
      onClose();
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50
      }}
    >
      <div className="card modalCard" style={{ width: "min(920px, 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Recadrer la photo (rond)</h2>
          <button onClick={onClose}>Fermer</button>
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: 420,
            marginTop: 12,
            background: "#111",
            borderRadius: 12,
            overflow: "hidden"
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div style={{ marginTop: 12 }} className="row">
          <div>
            <label>Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
            <div className="small">Zoomer de sorte que l'on voie entièrement la tête et le haut du buste.</div>
          </div>
          <div>
            <label>Sortie</label>
            <div className="small">PNG 512×512 avec transparence + masque circulaire.</div>
          </div>
        </div>

        <div className="actions">
          <button className="primary" disabled={busy} onClick={handleDone}>
            {busy ? "Export..." : "Valider le recadrage"}
          </button>
          <button disabled={busy} onClick={onClose}>
            Annuler
          </button>
        </div>

        {err && <div className="error">{err}</div>}
      </div>
    </div>
  );
}
