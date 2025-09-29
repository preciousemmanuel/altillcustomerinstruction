"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";

export default function Withdrawal({ userType }: { userType: string }) {
  const handleProceed = () => {
    toast.info("Withdrawal functionality is not yet implemented.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <>
      <ToastContainer />
      <div className="max-w-lg w-full mx-auto bg-white rounded-lg">
        <div className="p-6">
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Account Number
            </Label>
            <div className="bg-gray-100 text-gray-500 rounded-full h-12 flex items-center px-4">
              Please enter account number
            </div>
          </div>

          <div className="text-center text-gray-500 my-8">
            <p>Withdrawal functionality is coming soon.</p>
            <p>Please check back later.</p>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              onClick={handleProceed}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full font-medium"
            >
              Proceed
            </Button>
            <Button
              variant="outline"
              disabled
              className="flex-1 border-red-300 text-red-600 h-12 rounded-full font-medium bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}