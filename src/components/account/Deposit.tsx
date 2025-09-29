"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Bounce, ToastContainer, toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DOMPurify from "dompurify";
import {
  chequeValidation,
  depositTransaction,
  useTransaction,
} from "../../hooks/account/useTransaction";
import AccountNumberInput from "@/components/common/accountNumberInput";
import { sanitizeInput } from "@/utils/sanitizer";
import InlineTextLoader from "@/components/common/inlineTextLoader";
import { AccountType, CustomerType } from "@/utils/base.enum";
import CurrencyInput from "react-currency-input-field";
import generate, { capitalizeFirstLetter } from "@/utils/randomGenerator";
import SuccessModal from "@/components/common/SuccessModal";
import ButtonLoaderTransactions from "@/components/common/buttonLoader";

interface DepositProps {
  userType: string;
  corporateGLCodes: string[];
  individualCurrentGLCodes: string[];
  savingsIndividualGLCodes: string[];
}

export default function Deposit({
  userType,
  corporateGLCodes,
  individualCurrentGLCodes,
  savingsIndividualGLCodes,
}: DepositProps) {
  const navigate = useNavigate();
  const { validateCheque } = chequeValidation();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [queueNumber, setQueueNumber] = useState("");
  const [transactionType, setTransactionType] = useState("deposit");
  const [depositType, setDepositType] = useState("cash");
  const { validate, glcodesList } = useTransaction();
  const { deposit } = depositTransaction();
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [currency, setCurrency] = useState<string>("No currency");
  const [narration, setNarration] = useState<any>("");
  const [senderAccount, setSenderAccount] = useState<any>();
  const [accountNumber, setAccountNumber] = useState<any>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [depositor, setDepositor] = useState<string | null>("");

  const [accountType, setAccountType] = useState<string>("");
  const [accountSubType, setAccountSubType] = useState<any>("");

  const [chequeValidated, setChequeValidated] = useState<boolean>(false);
  const [loadingCheque, setLoadingCheque] = useState<boolean>(false);
  const [cheque, setCheque] = useState<string>("");

  useEffect(() => {
    const currentUser = localStorage.getItem("token");
    if (currentUser) {
      setCurrentUser(JSON.parse(currentUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const chequeValidationAction = async () => {
    if (cheque?.length < 0) {
      return;
    }
    setLoadingCheque(true);
    validateCheque(cheque, accountNumber)
      .then((res: any) => {
        console.log(res, "CHEQUE");
        if (
          res.sucesss == "false" &&
          res?.data?.data?.chequestatus != "DRAWN" &&
          res?.data?.data?.chequestatus != "AVAILABLE"
        ) {
          toast.error(DOMPurify.sanitize(res?.message) || "An error occurred", {
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
        } else if (res?.data?.data?.chequestatus === "DRAWN") {
          toast.error("This cheque number has already been used", {
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
        } else if (
          res?.data?.description === "True" &&
          res?.data?.data?.chequestatus === "AVAILABLE"
        ) {
          toast.success("Cheque number is valid", {
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
          setChequeValidated(true);
          setLoadingCheque(false);
        }
        setLoadingCheque(false);
      })
      .catch((e) => {
        setIsProcessing(false);
        setLoadingCheque(false);
        console.log(e?.response);
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
  };

  const handleProceed = () => {
    if (userType == CustomerType.Self) {
      setDepositor(senderAccount?.name);
      setNarration(
        `${capitalizeFirstLetter(depositType)} deposit by ${
          senderAccount?.name
        }`
      );
    } else {
      setDepositor(null);
      setNarration(
        `${capitalizeFirstLetter(depositType)} deposit by ${depositor}`
      );
    }
    setShowDetailModal(true);
  };

  const isProceedDisabled =
    !accountNumber || !senderAccount || !amount || loading || isProcessing;

  const formatCurrency = (value: number, currency: string) => {
    if (!currency || currency === "No currency" || currency === "N/A") {
      return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value || 0);
    }
    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
      }).format(value);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }
  };

  const validateAccount = useCallback(
    (accountNumber: string) => {
      if (!accountNumber) {
        setSenderAccount(null);
        return;
      }

      setLoading(true);
      setSenderAccount(null);
      setAccountSubType("");
      setAccountType("");
      validate(accountNumber)
        .then((res: any) => {
          setIsProcessing(false);
          const responseMessage = res?.description;
          console.log({ res });
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
            if (res?.data?.getaccounts?.currency) {
              setCurrency(res.data.currency);
              setSenderAccount(res.data.getaccounts);
              let glAccounType: string;
              let accountCategory: string;
              const glcode = res.data.getaccounts.gl_code.toString();
              console.log("GL CODE ", glcode);
              console.log("savingsIndividualGLCodes ", savingsIndividualGLCodes);
              console.log(
                "individualCurrentGLCodes ",
                individualCurrentGLCodes
              );
              console.log("corporateGLCodes ", corporateGLCodes);

              if (savingsIndividualGLCodes?.includes(glcode)) {
                glAccounType = "savings";
                accountCategory = "savings";
                setAccountSubType(accountCategory);
                setAccountType(glAccounType);
              } else if (individualCurrentGLCodes.includes(glcode)) {
                glAccounType = "current";
                accountCategory = "individual_current";
                setAccountSubType(accountCategory);
                setAccountType(glAccounType);
              } else if (corporateGLCodes.includes(glcode)) {
                glAccounType = "current";
                accountCategory = "corporate";
                setAccountSubType(accountCategory);
                setAccountType(glAccounType);
              } else {
                setSenderAccount(null);
                setAccountNumber("");
                toast.error("Invalid Account Type", {
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

                glAccounType = "disabled";
                accountCategory = "disabled";
                setAccountSubType(accountCategory);
              }
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
          setSenderAccount(null);
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

  const onSubmit = async () => {
    setLoading(true);
    const data: any = {
      accountNumber,
      transactionType: "deposit",
      currency: senderAccount?.currency,
      amount,
      accountName: senderAccount?.acc_name,
      transactionId: generate(12),
      accountStatus: "active",

      depositorType: userType,
      depositorName: depositor ? depositor : "Owner",
      narration: narration,
      mobileNumber: senderAccount.mobile,
      bvn: senderAccount?.customerBVN,
      branchNumber: currentUser.BRANCH_CODE,
    };
    deposit(data)
      .then((res: any) => {
        console.log("Deposit response: ", res);
        setLoading(false);
        if (res?.sucesss === false) {
          toast.error(DOMPurify.sanitize(res?.message || "An error occurred"), {
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
        } else {
          setShowDetailModal(false);
          setQueueNumber(res?.data!.queuenumber || "");
          setShowSuccessModal(true);
        }
      })
      .catch((e) => {
        toast.error(
          DOMPurify.sanitize(e?.response?.data?.title || "An error occurred"),
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
        setLoading(false);
      });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="max-w-lg w-full mx-auto bg-white rounded-lg">
        <div className="p-6">
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
                  <span className="text-gray-500">
                    {" "}
                    {senderAccount?.acc_name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-bold">Account Type:</span>{" "}
                  <span className="text-gray-500">
                    {senderAccount?.acc_type || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {(senderAccount && accountType == AccountType.Current) && (
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Deposit Type
              </Label>
              <Select value={depositType} onValueChange={setDepositType}>
                <SelectTrigger className="w-full !h-12.5 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {depositType === "cheque" && (
            <div className="mb-6">
              <AccountNumberInput
                type="number"
                name="chequeNumber"
                id="chequeNumber"
                value={cheque}
                handleChange={(e) => setCheque(e.target.value)}
                handleInput={(e) => {
                  e.target.value = sanitizeInput(e.target.value);
                }}
                onBlur={() => chequeValidationAction()}
                labelText={"Cheque Number"}
                labelFor={""}
                placeholder={"Please enter cheque number"}
                customClass={
                  "bg-white-50 h-[50px] border border-gray-200 text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-full pl-8"
                }
              />
            </div>
          )}
          {loadingCheque ? (
            <InlineTextLoader></InlineTextLoader>
          ) : chequeValidated ? (
            <div
              className={`${
                chequeValidated ? "text-[#099F4E]" : "text-[#304DAF]"
              } text-bold mt-16 ms-12 cursor-pointer`}
            >
              {"Validated"}
            </div>
          ) : null}

          {senderAccount && (
            <div className="mb-8">
              <div className="flex gap-3">
                {senderAccount &&
                  senderAccount?.acc_type &&
                  senderAccount?.acc_type
                    ?.toLowerCase()
                    .includes(AccountType.Current) && (
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Currency
                      </Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-full !h-12.5 rounded-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">NGN</SelectItem>
                          <SelectItem
                            value="USD"
                            disabled
                            className="text-gray-400"
                          >
                            USD
                          </SelectItem>
                          <SelectItem
                            value="EU"
                            disabled
                            className="text-gray-400"
                          >
                            Euro
                          </SelectItem>
                          <SelectItem
                            value="P"
                            disabled
                            className="text-gray-400"
                          >
                            Pounds
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Amount
                  </Label>
                  <CurrencyInput
                    id="input-example"
                    name="input-name"
                    className="bg-white-50 border border-gray-200 h-[48px] text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-[200px] pl-8 rounded-full w-full"
                    placeholder="Please enter amount"
                    value={amount}
                    allowDecimals
                    decimalsLimit={2}
                    allowNegativeValue={false}
                    onValueChange={(value) =>
                      setAmount(value ? Number(value) : 0)
                    }
                  />
                </div>
              </div>
            </div>
          )}

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
              onClick={() => navigate("/home")}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 h-12 rounded-full font-medium bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md mx-auto p-0 gap-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Deposit information
              </h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Name</span>
                <span className="text-gray-400">
                  {senderAccount?.acc_name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Number</span>
                <span className="text-gray-400">{accountNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Currency</span>
                <span className="text-gray-400">
                  {senderAccount?.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="text-gray-400">
                  {formatCurrency(amount, senderAccount?.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Type</span>
                <span className="text-gray-400">
                  {senderAccount?.acc_type}
                </span>
              </div>
            </div>

            {!loading ? (
              <Button
                onClick={onSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full font-medium"
              >
                {loading ? "Processing..." : "Proceed"}
              </Button>
            ) : (
              <ButtonLoaderTransactions />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        queueNumber={queueNumber}
      />

      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="max-w-md mx-auto p-0 gap-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                OTP Verification
              </h2>
              <button
                onClick={() => setShowOtpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 text-center mb-8">
              Please enter the OTP sent to your email or phone number
            </p>

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
    </>
  );
}