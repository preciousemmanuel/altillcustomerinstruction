"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bounce, ToastContainer, toast } from "react-toastify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import DOMPurify from "dompurify";
import { useTransaction } from "../../hooks/account/useTransaction";
import AccountNumberInput from "@/components/common/accountNumberInput"
import { sanitizeInput } from "@/utils/sanitizer"
import InlineTextLoader from "@/components/common/inlineTextLoader"
import { AccountType } from "@/utils/base.enum"
export default function AccountForm() {
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [transactionType, setTransactionType] = useState("deposit")
  const [accountType, setAccountType] = useState("savings")
  const [depositType, setDepositType] = useState("cash")
  const { validate } = useTransaction();
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const [currency, setCurrency] = useState<string>("No currency");

  const [senderAccount, setSenderAccount] = useState<any>();
  const [accountNumber, setAccountNumber] = useState<any>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);

  const handleProceed = () => {
    setShowDetailModal(true)
  }

  const isProceedDisabled = !accountNumber || !senderAccount || !amount || loading || isProcessing;

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const validateAccount = useCallback(
    (accountNumber: string) => {
      if (!accountNumber) {
        setSenderAccount(null);
        return;
      }

      setLoading(true);
      setSenderAccount(null);
      validate(accountNumber)
        .then((res: any) => {
          setIsProcessing(false);
          const responseMessage = res?.description;
          if (responseMessage === "Imal account inquiry Failed") {
            toast.error(
              DOMPurify.sanitize(responseMessage) || "An error occurred",
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
              }
            );
            setSenderAccount(null);
          } else {
            if (res?.data?.currencyname) {
              setCurrency(res.data.currencyname);
              setSenderAccount(res.data);
            } else {
              setIsProcessing(false);
              toast.error(DOMPurify.sanitize(res?.description), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
              });
            }
          }
          setLoading(false);
        })
        .catch((e) => {
          setCurrency("N/A");
          setSenderAccount({});
          setLoading(false);
          toast.error(
            DOMPurify.sanitize(e?.response?.data) || "An error occurred",
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
            }
          );
        });
    },
    [validate]
  );

  const handleDetailProceed = () => {
    setShowDetailModal(false)
    setShowOtpModal(true)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtpValues = [...otpValues]
      newOtpValues[index] = value
      setOtpValues(newOtpValues)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen bg-gray-100">
        {/* Main Content */}
        <div className="max-w-md mx-auto bg-white mt-8 rounded-lg shadow-sm">
          <div className="p-6">
            {/* Back Button */}
            <button className="flex items-center gap-2 mb-6 text-gray-700">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <h1 className="text-xl font-semibold mb-8 text-gray-900">Customer instructions</h1>

            {/* Transaction Type Selection */}
            <div className="mb-8">
              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Select transaction type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={transactionType === "deposit" ? "default" : "ghost"}
                    className={`flex-1 h-12 rounded-md ${transactionType === "deposit" ? "text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-50 border-0"}`}
                    style={{ backgroundColor: transactionType === "deposit" ? "#d5dfff" : "transparent" }}
                    onClick={() => setTransactionType("deposit")}
                  >
                    Deposit
                  </Button>
                  <Button
                    variant="ghost"
                    className={`flex-1 h-12 rounded-md border-0 ${transactionType === "withdrawal" ? "text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                    style={{ backgroundColor: transactionType === "withdrawal" ? "#d5dfff" : "transparent" }}
                    onClick={() => setTransactionType("withdrawal")}
                  >
                    Withdrawal
                  </Button>
                </div>
              </div>
            </div>

            {/* Account Number */}
            <div className="mb-6">

              <AccountNumberInput
                type="number"
                name="accountNumber"
                id="email"
                value={accountNumber}
                handleChange={(e) => setAccountNumber(e.target.value)}
                handleInput={(e) => {
                  e.target.value = sanitizeInput(e.target.value);
                }}
                onBlur={() => validateAccount(accountNumber)}
                labelText={"Account Number"}
                labelFor={""}
                placeholder={"Please enter account number"}
                customClass={
                  "bg-white-50 h-[50px] border border-gray-200 text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-full pl-8"
                }
              />
            </div>

            {loading ? (
              <InlineTextLoader></InlineTextLoader>
            ) : senderAccount ? (

              <div className="mb-6">
                <div className="bg-blue-200 text-gray-700 rounded-md px-4 py-3 space-y-1">
                  <div>
                    <span className="font-bold">Account Name:</span>{" "}
                    <span className="text-gray-500"> {senderAccount?.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-bold">Account Type:</span> <span className="text-gray-500">{senderAccount?.ledgername || "N/A"}</span>
                  </div>
                </div>
              </div>

            ) : null}

            {/*  check if ledgername contains current*/}
            {senderAccount && senderAccount?.ledgername && senderAccount?.ledgername?.toLowerCase().includes(AccountType.Current) && (

              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Deposit Type</Label>
                <Select value={depositType} onValueChange={setDepositType}>
                  <SelectTrigger className="w-full h-12 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>

                  </SelectContent>
                </Select>
              </div>
            )}


            {/* Amount with Currency Dropdown */}
            {senderAccount && (
              <div className="mb-8">
                <div className="flex gap-3">
                  {senderAccount && senderAccount?.ledgername && senderAccount?.ledgername?.toLowerCase().includes(AccountType.Current) && (
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-full h-12 rounded-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">NGN</SelectItem>
                          <SelectItem value="USD" disabled className="text-gray-400">
                            USD
                          </SelectItem>
                          <SelectItem value="EU" disabled className="text-gray-400">
                          Euro
                          </SelectItem>
                          <SelectItem value="P" disabled className="text-gray-400">
                          Pounds
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Amount</Label>
                    <Input
                      value={amount}
                      onChange={(e: any) => setAmount(e.target.value)}
                      className="text-lg font-semibold h-12 rounded-full w-full"
                    />
                  </div>
                </div>
              </div>
            )}


            {/* Amount */}
            {/* <div className="mb-8">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Enter Amount</Label>
            <Input
              value={amount}
              onChange={(e:any) => setAmount(e.target.value)}
              className="text-lg font-semibold h-12 rounded-full"
            />
          </div> */}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleProceed}
                disabled={isProceedDisabled}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full font-medium"
              >
                Proceed
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 h-12 rounded-full font-medium bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Deposit Information Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-md mx-auto p-0 gap-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Deposit information</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Name</span>
                  <span className="text-gray-400">{senderAccount?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Number</span>
                  <span className="text-gray-400">{accountNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currency</span>
                  <span className="text-gray-400">{currency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-gray-400">{formatCurrency(amount, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Type</span>
                  <span className="text-gray-400">{senderAccount?.ledgername}</span>
                </div>
              </div>

              <Button
                onClick={handleDetailProceed}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full font-medium"
              >
                Proceed
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* OTP Verification Modal */}
        <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
          <DialogContent className="max-w-md mx-auto p-0 gap-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">OTP Verification</h2>
                <button onClick={() => setShowOtpModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 text-center mb-8">Please enter the OTP sent to your email or phone number</p>

              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-3 mb-6">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                ))}
              </div>

              <div className="text-center mb-8">
                <span className="text-gray-600">Didn't get an OTP? </span>
                <button className="text-blue-600 font-medium">Resend</button>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full font-medium">
                Verify OTP
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>

  )
}
