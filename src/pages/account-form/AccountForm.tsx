import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DepositInfoModal from "@/components/modals/DepositInfoModal";
import OtpVerificationModal from "@/components/modals/OtpVerificationModal";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AccountForm() {
  const [transactionType, setTransactionType] = useState("deposit");
  const [accountNumber, setAccountNumber] = useState("0503370166");
  const [accountName, setAccountName] = useState(
    "S MAI NONO MULTIPURPOSE VENTURES"
  );
  const [accountType, setAccountType] = useState("savings");
  const [amount, setAmount] = useState("1,000,000,000.00");

  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isOtpModalOpen, setOtpModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleProceed = () => {
    setDepositModalOpen(true);
  };

  const handleDepositProceed = () => {
    setDepositModalOpen(false);
    setOtpModalOpen(true);
  };

  const handleOtpVerify = (otp: string) => {
    console.log("OTP verified:", otp);
    setOtpModalOpen(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white w-[450px] p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-semibold ml-4">Customer instructions</h1>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Select transaction type</Label>
            <div className="flex mt-2 border rounded-md p-1">
              <Button
                variant={transactionType === "deposit" ? "secondary" : "ghost"}
                className="flex-1"
                onClick={() => setTransactionType("deposit")}
              >
                Deposit
              </Button>
              <Button
                variant={
                  transactionType === "withdrawal" ? "secondary" : "ghost"
                }
                className="flex-1"
                onClick={() => setTransactionType("withdrawal")}
              >
                Withdrawal
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="bg-blue-100 p-3 rounded-md">
            <p className="text-blue-800 font-semibold">{accountName}</p>
          </div>

          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <Select onValueChange={setAccountType} value={accountType}>
              <SelectTrigger id="accountType" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="current">Current</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Enter Amount</Label>
            <Input
              id="amount"
              value={`₦${amount}`}
              onChange={(e) => setAmount(e.target.value.replace("₦", ""))}
              className="mt-2"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <DepositInfoModal
              open={isDepositModalOpen}
              onOpenChange={setDepositModalOpen}
              accountName={accountName}
              accountNumber={accountNumber}
              currency="NGN"
              amount={amount}
              accountType={accountType}
              onProceed={handleDepositProceed}
            >
              <Button className="w-full" onClick={handleProceed}>
                Proceed
              </Button>
            </DepositInfoModal>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </div>

        <OtpVerificationModal
          open={isOtpModalOpen}
          onOpenChange={setOtpModalOpen}
          onVerify={handleOtpVerify}
        >
          <div />
        </OtpVerificationModal>
      </div>
    </div>
  );
}

export default AccountForm;
