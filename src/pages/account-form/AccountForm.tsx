"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { ToastContainer } from "react-toastify";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Deposit from "@/components/account/Deposit";
import Withdrawal from "@/components/account/Withdrawal";
import { useState, useEffect } from "react";
import { useGlcodes } from "@/hooks/useGlcode";
import FullPageLoader from "@/components/common/fullpageloader";
import FullPageError from "@/components/common/fullpageerror";

export default function AccountForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactionType, setTransactionType] = useState("deposit");
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
              Customer instructions
            </h1>

            <Tabs
              defaultValue="deposit"
              className="w-full"
              onValueChange={(value:any) => setTransactionType(value)}
            >
              <div className="mb-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Select transaction type
                  </Label>
                  <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent p-0">
                    <TabsTrigger
                      value="deposit"
                      className="flex-1 h-12 rounded-md border-0 bg-white text-gray-600 hover:bg-gray-50 data-[state=active]:bg-[#d5dfff] data-[state=active]:text-blue-700"
                    >
                      Deposit
                    </TabsTrigger>
                    <TabsTrigger
                      value="withdrawal"
                      className="flex-1 h-12 rounded-md border-0 bg-white text-gray-600 hover:bg-gray-50 data-[state=active]:bg-[#d5dfff] data-[state=active]:text-blue-700"
                    >
                      Withdrawal
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <TabsContent value="deposit">
                <Deposit
                  userType={userType}
                  corporateGLCodes={corporateGLCodes}
                  individualCurrentGLCodes={individualCurrentGLCodes}
                  savingsIndividualGLCodes={savingsIndividualGLCodes}
                />
              </TabsContent>
              <TabsContent value="withdrawal">
                <Withdrawal
                  userType={userType}
                  corporateGLCodes={corporateGLCodes}
                  individualCurrentGLCodes={individualCurrentGLCodes}
                  savingsIndividualGLCodes={savingsIndividualGLCodes}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}