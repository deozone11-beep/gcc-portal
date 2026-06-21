const https = require("https");
const { URLSearchParams } = require("url");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { planSubmissionNum, jsessionid } = req.body;
  if (!planSubmissionNum) return res.status(400).json({ error: "planSubmissionNum required" });

  const postData = new URLSearchParams({
    planSubmissionNum: planSubmissionNum,
    baNum: "",
    applicationFromDate: "",
    applicationToDate: "",
    "method:newform": "Search",
  }).toString();

  const cookie = jsessionid ? `JSESSIONID=${jsessionid}` : "";

  const options = {
    hostname: "erp.chennaicorporation.gov.in",
    path: "/bpa/citizen/registerReport.action",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Cookie: cookie,
      Origin: "https://erp.chennaicorporation.gov.in",
      Referer: "https://erp.chennaicorporation.gov.in/bpa/citizen/registerReport.action",
    },
  };

  return new Promise((resolve) => {
    const proxyReq = https.request(options, (proxyRes) => {
      let body = "";
      proxyRes.on("data", (chunk) => (body += chunk));
      proxyRes.on("end", () => {
        const parsed = parseHtmlResponse(body, planSubmissionNum);
        res.status(200).json(parsed);
        resolve();
      });
    });
    proxyReq.on("error", (err) => {
      res.status(500).json({ error: err.message });
      resolve();
    });
    proxyReq.write(postData);
    proxyReq.end();
  });
};

function parseHtmlResponse(html, planNum) {
  const result = {
    planSubmissionNum: planNum,
    applicantName: "",
    applicationDate: "",
    mobileNo: "",
    address: "",
    plotArea: "",
    buildingType: "",
    zone: "",
    ward: "",
    applicationStatus: "",
    baNumber: "",
    rawFound: false,
  };

  if (html.includes("No records") || html.includes("no record")) {
    result.applicationStatus = "No Records Found";
    return result;
  }

  try {
    // Extract all <td> cell values
    const tdMatches = html.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    const cells = tdMatches.map((td) =>
      td.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
    ).filter(c => c.length > 0);

    // Find row containing the plan number
    const idx = cells.findIndex((c) =>
      c.replace(/\s/g, "").toUpperCase().includes(planNum.replace(/\s/g, "").toUpperCase())
    );

    if (idx !== -1) {
      result.rawFound = true;
      // Chennai Corp BPA table structure (columns in order):
      // S.No | PlanSubmissionNo | ApplicantName | MobileNo | Address | ApplicationDate | PlotArea | BuildingType | Status | BANumber
      result.applicantName   = cells[idx + 2] || cells[idx + 1] || "";
      result.mobileNo        = cells[idx + 3] || "";
      result.address         = cells[idx + 4] || "";
      result.applicationDate = cells[idx + 5] || "";
      result.plotArea        = cells[idx + 6] || "";
      result.buildingType    = cells[idx + 7] || "";
      result.applicationStatus = cells[idx + 8] || "";
      result.baNumber        = cells[idx + 9] || "";

      // Zone/Ward from page content
      const zoneMatch = html.match(/Zone\s*[:\-]\s*(\w+)/i);
      const wardMatch = html.match(/Ward\s*[:\-]\s*(\w+)/i);
      if (zoneMatch) result.zone = zoneMatch[1];
      if (wardMatch) result.ward = wardMatch[1];
    } else {
      // Fallback: return all cells for debugging
      result.applicationStatus = "Row not matched";
      result.applicantName = cells.slice(0, 15).join(" | ");
    }
  } catch (e) {
    result.applicationStatus = "Parse Error: " + e.message;
  }

  return result;
}
