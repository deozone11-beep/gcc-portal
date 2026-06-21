import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import "./PpaDetails.css";

const PROXY_URL = "/api/proxy";
const ERP_URL = "https://erp.chennaicorporation.gov.in/bpa/citizen/registerReport.action";

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function fetchPpaDetails(planNum, jsessionid) {
  try {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planSubmissionNum: planNum, jsessionid }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { planNum, status: "success", data };
  } catch (err) {
    return { planNum, status: "error", error: err.message, data: null };
  }
}

function exportToExcel(results) {
  const rows = results.map((r) => {
    const d = r.data || {};
    return {
      "Plan Submission No": r.planNum,
      Status: r.status === "success" ? "Success" : "Error",
      "Applicant Name": d.applicantName || r.error || "",
      "Mobile No": d.mobileNo || "",
      "Address": d.address || "",
      "Application Date": d.applicationDate || "",
      "Plot Area": d.plotArea || "",
      "Building Type": d.buildingType || "",
      "App. Status": d.applicationStatus || "",
      "BA Number": d.baNumber || "",
      "Zone": d.zone || "",
      "Ward": d.ward || "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    {wch:28},{wch:10},{wch:25},{wch:14},{wch:40},
    {wch:16},{wch:12},{wch:18},{wch:18},{wch:16},{wch:8},{wch:8}
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PPA Results");
  XLSX.writeFile(wb, `PPA_Results_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export default function PpaDetails() {
  const [numbers, setNumbers] = useState([]);
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();
  const abortRef = useRef(false);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setResults([]);
    setProgress(0);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const nums = [];
        rows.forEach((row) => row.forEach((cell) => {
          const val = String(cell || "").trim();
          if (/^PPA\/.+\/.+\/.+$/i.test(val)) nums.push(val);
        }));
        if (nums.length === 0) {
          alert("No PPA numbers found! Format: PPA/WDCN15/02117/2024");
        } else {
          setNumbers(nums);
          alert(`✅ Found ${nums.length} PPA number(s)!`);
        }
      } catch (err) { alert("Error reading Excel: " + err.message); }
    };
    reader.readAsArrayBuffer(file);
  }

  async function startFetch() {
    if (numbers.length === 0) { alert("Upload Excel file first!"); return; }
    if (!sessionId.trim()) { alert("JSESSIONID paste பண்ணணும்!"); return; }
    setRunning(true);
    abortRef.current = false;
    setResults([]);
    setProgress(0);
    const total = numbers.length;
    const allResults = [];
    for (let i = 0; i < total; i++) {
      if (abortRef.current) break;
      const planNum = numbers[i];
      setResults([...allResults, { planNum, status: "loading" }]);
      const result = await fetchPpaDetails(planNum, sessionId.trim());
      allResults.push(result);
      setResults([...allResults]);
      setProgress(Math.round(((i + 1) / total) * 100));
      if (i < total - 1) await sleep(800);
    }
    setRunning(false);
  }

  function stopFetch() { abortRef.current = true; setRunning(false); }

  // Cookie helper — open ERP in new tab with bookmarklet instructions
  function openCookieHelper() {
    const newWin = window.open(ERP_URL, "_blank");
    setTimeout(() => {
      alert(
        "ERP site open ஆச்சு!\n\n" +
        "Steps:\n" +
        "1. F12 press பண்ணு (DevTools open)\n" +
        "2. 'Application' tab click\n" +
        "3. Left side → Cookies → erp.chennaicorporation.gov.in\n" +
        "4. JSESSIONID row → Value copy பண்ணு\n" +
        "5. இந்த page la paste பண்ணு"
      );
    }, 2000);
  }

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">PPA Building Plan Details</h2>
        <p className="page-sub">Fetch plan approval details from Chennai Corporation ERP</p>
      </div>

      {/* Step 1 - Session Cookie */}
      <div className="ppa-card">
        <div className="step-badge">Step 1</div>
        <h3 className="card-title">ERP Session Cookie</h3>

        <div className="cookie-helper-row">
          <button className="btn-cookie" onClick={openCookieHelper}>
            🌐 Open ERP Site
          </button>
          <span className="cookie-hint">→ F12 → Application → Cookies → JSESSIONID → Copy → Paste below</span>
        </div>

        <label className="field-label" style={{marginTop:"14px"}}>JSESSIONID Value</label>
        <input
          className="text-input"
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="e.g. 5BB1415B0D77CDD19838C1B781B84E9D.node2"
        />
        {sessionId && <p className="hint" style={{color:"#15803d"}}>✓ Session ID entered</p>}
        <p className="hint">Session expires every few hours — renew பண்ண வேண்டியிருக்கும்.</p>
      </div>

      {/* Step 2 - Upload */}
      <div className="ppa-card">
        <div className="step-badge">Step 2</div>
        <h3 className="card-title">Upload Excel File</h3>
        <p className="card-desc">Format: <code>PPA/WDCN15/02117/2024</code> — Any column, any row.</p>
        <div className="drop-zone" onClick={() => fileRef.current.click()}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {fileName
            ? <p className="drop-filename">📄 {fileName} — {numbers.length} PPA numbers found</p>
            : <p className="drop-text">Click to upload Excel (.xlsx / .xls)</p>}
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} style={{display:"none"}}/>
      </div>

      {/* Step 3 - Fetch */}
      <div className="ppa-card">
        <div className="step-badge">Step 3</div>
        <h3 className="card-title">Fetch PPA Details</h3>
        {numbers.length > 0 && (
          <div className="summary-pills">
            <span className="pill blue">{numbers.length} Loaded</span>
            {results.length > 0 && <>
              <span className="pill green">{successCount} ✓ Success</span>
              <span className="pill red">{errorCount} ✗ Failed</span>
            </>}
          </div>
        )}
        {running && (
          <div className="progress-wrap">
            <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
            <p className="progress-text">{progress}% — {results.length}/{numbers.length} done</p>
          </div>
        )}
        <div className="btn-row-ppa">
          <button className="btn-primary" onClick={startFetch} disabled={running || numbers.length === 0}>
            {running ? "⏳ Fetching..." : "▶ Start Fetching"}
          </button>
          {running && <button className="btn-danger" onClick={stopFetch}>⏹ Stop</button>}
          {results.length > 0 && !running && (
            <button className="btn-export" onClick={() => exportToExcel(results)}>📥 Export to Excel</button>
          )}
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="ppa-card results-card">
          <div className="results-header">
            <h3 className="card-title" style={{marginBottom:0}}>
              Results — {successCount}/{results.length} Success
            </h3>
            <button className="btn-export-sm" onClick={() => exportToExcel(results)}>📥 Export Excel</button>
          </div>
          <div className="table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Plan Submission No</th>
                  <th>Status</th>
                  <th>Applicant Name</th>
                  <th>Mobile</th>
                  <th>App. Date</th>
                  <th>Plot Area</th>
                  <th>Building Type</th>
                  <th>App. Status</th>
                  <th>BA Number</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={r.status==="error"?"row-error":r.status==="loading"?"row-loading":""}>
                    <td>{i+1}</td>
                    <td className="mono">{r.planNum}</td>
                    <td>
                      {r.status==="loading" && <span className="badge badge-loading">⏳</span>}
                      {r.status==="success" && <span className="badge badge-success">✓ OK</span>}
                      {r.status==="error" && <span className="badge badge-error">✗ Err</span>}
                    </td>
                    <td>{r.data?.applicantName || r.error || "—"}</td>
                    <td>{r.data?.mobileNo || "—"}</td>
                    <td>{r.data?.applicationDate || "—"}</td>
                    <td>{r.data?.plotArea || "—"}</td>
                    <td>{r.data?.buildingType || "—"}</td>
                    <td>{r.data?.applicationStatus || "—"}</td>
                    <td>{r.data?.baNumber || "—"}</td>
                    <td className="addr-cell">{r.data?.address || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
