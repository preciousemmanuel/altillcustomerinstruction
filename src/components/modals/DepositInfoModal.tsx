import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface DepositInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountName: string;
  accountNumber: string;
  currency: string;
  amount: string;
  accountType: string;
  onProceed: () => void;
  children: React.ReactNode;
}

function DepositInfoModal({
  open,
  onOpenChange,
  accountName,
  accountNumber,
  currency,
  amount,
  accountType,
  onProceed,
  children,
}: DepositInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <p>Account Name</p>
            <p className="font-semibold">{accountName}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p>Account Number</p>
            <p className="font-semibold">{accountNumber}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p>Currency</p>
            <p className="font-semibold">{currency}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p>Amount</p>
            <p className="font-semibold">{amount}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p>Account Type</p>
            <p className="font-semibold">{accountType}</p>
          </div>
        </div>
        <Button onClick={onProceed} className="w-full">
          Proceed
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default DepositInfoModal;
