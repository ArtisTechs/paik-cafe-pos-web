import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./qr-page.css";
import { STORAGE_KEY } from "../../shared";

const getSavedBranchId = () => {
  return localStorage.getItem(STORAGE_KEY.BRANCH_ID) || "";
};

const BranchQrPage = () => {
  const [branchId, setBranchId] = useState("");

  useEffect(() => {
    setBranchId(getSavedBranchId());
  }, []);

  return (
    <div className="branch-qr-page">
      <div className="qr-code-container">
        {branchId ? (
          <>
            <QRCodeSVG value={branchId} size={300} fgColor="#1d1d1d" />
            <p className="branch-id-label">Branch ID</p>
          </>
        ) : (
          <p className="no-branch">No Branch ID found.</p>
        )}
      </div>
    </div>
  );
};

export default BranchQrPage;
