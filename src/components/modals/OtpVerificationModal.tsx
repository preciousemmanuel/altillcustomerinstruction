import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface OtpVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (otp: string) => void;
  children: React.ReactNode;
}

function OtpVerificationModal({
  open,
  onOpenChange,
  onVerify,
  children,
}: OtpVerificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">OTP Verification</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-center text-gray-500">
            Please enter the OTP sent to your email or phone number
          </p>
          <Input
            className="w-48 text-center text-2xl tracking-[1.5em]"
            maxLength={6}
            placeholder="______"
          />
          <p className="text-sm text-gray-500">
            Didn't get an OTP? <Button variant="link">Resend</Button>
          </p>
        </div>
        <Button onClick={() => onVerify("123456")} className="w-full">
          Verify OTP
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default OtpVerificationModal;
