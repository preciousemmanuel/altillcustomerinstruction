"use client"

import { useState } from "react"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function AccountForm() {
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [transactionType, setTransactionType] = useState("deposit")
  const [accountType, setAccountType] = useState("savings")
  const [amount, setAmount] = useState("₦1,000,000,000.00")
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])

  const handleProceed = () => {
    setShowDetailModal(true)
  }

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
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Account Number</Label>
            <Input value="0503370166" readOnly className="bg-gray-50 text-gray-900 font-medium h-12 rounded-full" />
          </div>

          {/* Account Name */}
          <div className="mb-6">
            <div className="bg-blue-200 text-gray-700 font-medium h-12 rounded-md px-4 flex items-center">
              S MAI NONO MULTIPURPOSE VENTURES
            </div>
          </div>

          {/* Account Type */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Account Type</Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger className="w-full h-12 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="fixed">Fixed Deposit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="mb-8">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Enter Amount</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold h-12 rounded-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleProceed}
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
                <span className="text-gray-400">John Chukwuma Eze</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Number</span>
                <span className="text-gray-400">1234567890</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Currency</span>
                <span className="text-gray-400">NGN</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="text-gray-400">₦1,000,000,000.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Type</span>
                <span className="text-gray-400">Savings</span>
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
  )
}
