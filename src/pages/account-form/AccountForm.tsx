import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function AccountForm() {
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [amount, setAmount] = useState("");

  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isOtpModalOpen, setOtpModalOpen] = useState(false);

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
    <div className="flex flex-col items-center h-screen py-10">
      <div className="bg-white w-[80%] p-6 rounded-xl text-center min-h-[50vh]">
        <p className="text-2xl font-bold py-2">Customer Instruction Portal</p>
        <p className="text-base text-[#9CA3AF] pb-12">
          Submit your transaction instructions quickly and securely,
          <br /> to be treated by a teller.
        </p>
        <Card className="w-full text-left rounded-4xl shadow-none border-none">
          <CardHeader>
            <CardTitle className="text-3xl font-bold max-w-[80%] pb-2 pt-8">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="Enter account name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Select onValueChange={setAccountType} value={accountType}>
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
          <Button
            className="rounded-full y-[22px] mt-4 p-8 bg-[#304DAF] text-white w-[50%] my-12"
            onClick={handleProceed}
          >
            Proceed
          </Button>
        </DepositInfoModal>

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
