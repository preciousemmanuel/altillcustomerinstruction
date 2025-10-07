import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import * as React from "react";

interface SuccessModalProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueNumber: string;
}

export default function SuccessModal({
  open,
  onOpenChange,
  queueNumber,
  title,
}: SuccessModalProps) {
  const navigate = useNavigate();

  const handleReturnToHomepage = () => {
    onOpenChange(false);
    navigate("/home");
  };

  // Prevent closing by overlay click or Esc key
  const handleOpenChange = (nextOpen: boolean) => {
    // Allow closing only when explicitly set to false in our handler
    if (nextOpen) onOpenChange(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md mx-auto p-0 gap-0"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
          </div>

          <h2 className="text-lg font-medium text-gray-700 mb-6 leading-relaxed">
            {title}
          </h2>

          <div className="text-6xl font-bold text-green-500 mb-6">
            {queueNumber}
          </div>

          <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
            Kindly note down this queue number for your submitted instruction. A teller will call it to identify and
            attend to you.
          </p>

          <Button
            onClick={handleReturnToHomepage}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full font-medium"
          >
            Return to homepage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
