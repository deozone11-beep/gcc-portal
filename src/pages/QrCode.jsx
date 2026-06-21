import { useState } from "react";
import "./QrCode.css";

const mask = "XX-XXX-XXXXX-XXX";

function formatValue(val) {
  val = val.replace(/\D/g, "").substring(0, 13);
  let result = "";
  if (val.length > 0) result += val.substring(0, 2);
  if (val.length > 2) result += "-" + val.substring(2, 5);
  if (val.length > 5) result += "-" + val.substring(5, 10);
  if (val.length > 10) result += "-" + val.substring(10, 13);
  return result;
}

function getDisplay(value) {
  let clean = value.replace(/-/g, "");
  let result = "";
  let index = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === "X") {
      result += index < clean.length ? clean[index++] : "X";
    } else {
      result += "-";
    }
  }
  return result;
}

function buildURL(val) {
  if (val.replace(/-/g, "").length !== 13) return "";
  const parts = val.split("-");
  return `https://erp.chennaicorporation.gov.in/ptis/citizensearch/searchPropByBillNumber!search.action?collectionType=online&propertyId=${parts[2]}&search1=Search&subNo=${parts[3]}&wardNo=${parts[1]}&zoneNo=${parts[0]}`;
}

export default function QrCode() {
  const [value, setValue] = useState("");
  const [img, setImg] = useState("");
  const [loading, setLoading] = useState(false);
  const [payLink, setPayLink] = useState("");

  function handleChange(e) {
    setValue(formatValue(e.target.value));
  }

  function generateQR() {
    const fullURL = buildURL(value);
    setPayLink(fullURL);
    if (!fullURL) {
      alert("Please enter a valid Property Tax Bill number!");
      return;
    }
    setLoading(true);
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(fullURL)}`;
    setImg(qr);
    setLoading(false);
  }

  function downloadQR() {
    if (!img) return;
    fetch(img)
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${value}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Property Tax QR Generator</h2>
        <p className="page-sub">Generate QR code for online payment</p>
      </div>

      <div className="qr-card">
        <label className="field-label">Property Tax Bill Number</label>
        <div className="input-wrapper">
          <div className="mask">{getDisplay(value)}</div>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            className="real-input"
            placeholder=" "
          />
        </div>

        <div className="btn-row">
          <button className="btn-primary" onClick={generateQR} disabled={loading}>
            {loading ? "Generating..." : "Generate QR"}
          </button>
          <button className="btn-success" onClick={downloadQR} disabled={!img}>
            Download QR
          </button>
        </div>

        {img && (
          <div className="qr-result">
            <div className="qr-img-wrap">
              <img src={img} alt="QR Code" className="qr-img" />
            </div>
            <p className="qr-number">{value}</p>
            {payLink && (
              <a href={payLink} target="_blank" rel="noopener noreferrer" className="pay-link">
                🔗 Click to Pay Online
              </a>
            )}
          </div>
        )}

        <p className="card-footer">
          Designed by{" "}
          <a href="https://maps.app.goo.gl/S12NiZi7Vw4K6GRK9" target="_blank" rel="noreferrer">
            Zone-XI
          </a>
        </p>
      </div>
    </div>
  );
}
