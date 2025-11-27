"use client";

import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Withdrawal from "@/components/account/Withdrawal";
import { useEffect } from "react";
import { useGlcodes } from "@/hooks/useGlcode";
import FullPageLoader from "@/components/common/fullpageloader";
import FullPageError from "@/components/common/fullpageerror";

export default function WithdrawalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType;

  const {
    loadingGlecode,
    errorGlcode,
    corporateGLCodes,
    individualCurrentGLCodes,
    savingsIndividualGLCodes,
  } = useGlcodes();

  useEffect(() => {
    if (!userType) {
      navigate("/home");
    }
  }, [userType, navigate]);

  if (loadingGlecode) return <FullPageLoader />;
  if (errorGlcode) return <FullPageError message={errorGlcode} />;

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-6 text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <h1 className="text-xl font-semibold mb-8 text-gray-900">
              Withdrawal
            </h1>

            <Withdrawal
              userType={userType}
              corporateGLCodes={corporateGLCodes}
              individualCurrentGLCodes={individualCurrentGLCodes}
              savingsIndividualGLCodes={savingsIndividualGLCodes}
            />
          </div>
        </div>
      </div>
    </>
  );
}
