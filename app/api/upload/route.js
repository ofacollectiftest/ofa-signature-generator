import { NextResponse } from "next/server";

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function guessAssetUrl(owner, repo, branch, path) {
  const base = (process.env.ASSET_BASE_URL || "").trim();
  if (base) return `${base.replace(/\/$/, "")}/${path}`;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

function encodePathPreserveSlashes(path) {
  // encode chaque segment, mais garde les / pour que GitHub comprenne members/xxx.png
  return String(path)
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const dataUrl = body?.dataUrl;
    const filename = body?.filename;

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/png;base64,")) {
      return NextResponse.json({ error: "Invalid dataUrl (expected base64 PNG)" }, { status: 400 });
    }

    const token = env("GITHUB_TOKEN");
    const owner = env("GITHUB_OWNER");
    const repo = env("GITHUB_REPO");
    const branch = env("GITHUB_BRANCH");
    const prefix = (process.env.GITHUB_PATH_PREFIX || "members").replace(/^\/+|\/+$/g, "");

    const base64 = dataUrl.replace("data:image/png;base64,", "");

    const safeName =
      (filename && String(filename).replace(/[^a-zA-Z0-9._-]/g, "_")) ||
      `member_${Date.now()}_${Math.random().toString(16).slice(2)}.png`;

    const path = `${prefix}/${safeName}`;
    const encodedPath = encodePathPreserveSlashes(path);

    const ghUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;

    const payload = {
      message: `Add signature photo: ${safeName}`,
      content: base64,
      branch
    };

    const r = await fetch(ghUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await r.json();

    if (!r.ok) {
      // Log serveur (visible dans terminal)
      console.error("GitHub upload failed:", r.status, json);
      return NextResponse.json(
        { error: "GitHub upload failed", status: r.status, details: json },
        { status: 502 }
      );
    }

    const assetUrl = guessAssetUrl(owner, repo, branch, path);
    return NextResponse.json({ ok: true, path, assetUrl });
  } catch (e) {
    console.error("Upload route error:", e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
