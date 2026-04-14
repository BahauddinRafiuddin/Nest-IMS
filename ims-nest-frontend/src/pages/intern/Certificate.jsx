/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  checkCertificateEligibility,
  generateCertificate,
  getMyProgram,
} from "../../api/intern.api";
import { Award, Download, Lock, CheckCircle } from "lucide-react";
import Loading from "../../components/common/Loading";

const Certificate = () => {
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [details, setDetails] = useState(null);
  const [programId, setProgramId] = useState("");

  useEffect(() => {
    const loadEligibility = async () => {
      try {
        const programRes = await getMyProgram();
        // console.log("res",programRes)
        const id = programRes.enrollement[0].program._id;
        setProgramId(id);

        const res = await checkCertificateEligibility(id);
        // console.log("eligible",res)
        setEligible(res.eligible);
        setDetails(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEligibility();
  }, []);

  const handleDownload = async () => {
    try {
      const response = await generateCertificate(programId);

      const blob = new Blob([response], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "certificate.pdf";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Certificate download failed");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Certificate</h1>
        <p className="text-gray-500 mt-1">Internship completion certificate</p>
      </div>

      {/* ================= CARD ================= */}
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
        {/* ICON */}
        {eligible ? (
          <Award size={80} className="mx-auto text-yellow-500" />
        ) : (
          <Lock size={80} className="mx-auto text-gray-400" />
        )}

        {/* TITLE */}
        <h2 className="text-2xl font-bold">Internship Certificate</h2>

        {/* STATUS */}
        {eligible ? (
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-2 text-green-600 font-semibold">
              <CheckCircle size={20} />
              Eligible for Certificate
            </div>

            <div className="text-gray-600 text-sm">
              Grade: <b className="text-gray-900">{details.grade}</b> •
              Completion:{" "}
              <b className="text-gray-900">{details.completionPercentage}%</b>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 max-w-md mx-auto">
            You are not eligible yet. Complete your tasks and improve
            performance to unlock your certificate.
          </p>
        )}

        {/* ACTION */}
        {eligible && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition cursor-pointer"
          >
            <Download size={20} />
            Download Certificate
          </button>
        )}
      </div>

      {/* ================= INFO ================= */}
      {!eligible && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-700">
          <b>Eligibility Rules:</b>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Internship must be completed by your mentor</li>
            <li>At least one task submitted</li>
            <li>Completion ≥ 45%</li>
            <li>Grade must not be Fail</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Certificate;
