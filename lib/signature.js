function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildSignatureHtml(input) {
  const prenom = escapeHtml((input.prenom || "").trim());
  const nomUpper = escapeHtml((input.nom || "").trim().toUpperCase());
  const fonction = escapeHtml((input.fonction || "").trim());
  const org = escapeHtml((input.org || "").trim());
  const email = escapeHtml((input.email || "").trim());

  const telCountryCode = escapeHtml((input.telCountryCode || "").trim().replace(/^\+/, ""));
  const telNumber = escapeHtml((input.telNumber || "").trim().replace(/\s+/g, "").replace(/[^\d]/g, ""));

  const photoUrl = escapeHtml((input.photoUrl || "").trim());

  const roleLine = org ? `${fonction} ${org}` : fonction;

  const telE164 = telCountryCode && telNumber ? `+${telCountryCode}${telNumber}` : "";
  const telDisplay = telCountryCode && telNumber ? `+${telCountryCode} ${telNumber}` : "";

  return `
<table style="font-family: Georgia, sans-serif; font-size: 14px; color: #222222; line-height: 1.4; max-width: 600px;">
  <tr>
    <td style="padding-right: 10px;">
      <img src="${photoUrl}" alt="${prenom}" style="height: 120px; width: 120px; border-radius: 999px; object-fit: cover; display: block;">
    </td>
    <td style="width: 0.1px; background-color: #2B2B2B; vertical-align: top; border-radius: 8px;"></td>
    <td style="padding-left: 5px; vertical-align: top;">
      <strong style="color: #2B2B2B;">${prenom} ${nomUpper}</strong><br>
      <span style="color: #777; font-weight: normal;">${roleLine}</span><br>
      <span style="color: #444;">OFA Collectif <span style="color: orange;">ASBL</span></span><br><br>

      ${telE164 ? `📞 <a href="tel:${telE164}" style="color: #005A87; text-decoration: none;">${telDisplay}</a><br>` : ""}
      ✉️ <a href="mailto:${email}" style="color: #005A87; text-decoration: none;">${email}</a><br><br>

      <span style="color: #444;">Suivez OFA Collectif sur les réseaux sociaux :</span><br>
      <a href="https://www.instagram.com/ofa_collectif/" target="_blank" style="text-decoration: none; margin-right: 10px;">
        <img src="https://raw.githubusercontent.com/ofacollectiftest/ofa-signatures-assets/main/icons/instagram.png" alt="Instagram" width="20" height="20" style="vertical-align: middle;">
      </a>
      <a href="https://www.tiktok.com/@ofa_collectif?_t=ZN-8vG8M3Hx1ug&_r=1" target="_blank" style="text-decoration: none; margin-right: 10px;">
        <img src="https://raw.githubusercontent.com/ofacollectiftest/ofa-signatures-assets/main/icons/tiktok.png" alt="TikTok" width="20" height="20" style="vertical-align: middle;">
      </a>
      <a href="https://www.linkedin.com/in/ofa-collectif-99679b301/" target="_blank" style="text-decoration: none;">
        <img src="https://raw.githubusercontent.com/ofacollectiftest/ofa-signatures-assets/main/icons/linkedin.png" alt="LinkedIn" width="20" height="20" style="vertical-align: middle;">
      </a>
    </td>
  </tr>
</table>`.trim();
}