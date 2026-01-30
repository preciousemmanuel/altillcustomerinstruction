"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  chequeDepositTransaction,
  useTransaction,
} from "../../hooks/account/useTransaction";
import AccountNumberInput from "@/components/common/accountNumberInput";
import { sanitizeInput } from "@/utils/sanitizer";
import InlineTextLoader from "@/components/common/inlineTextLoader";
import { AccountType, Currencies, CustomerType, DepositType } from "@/utils/base.enum";
import CurrencyInput from "react-currency-input-field";
import generate, { capitalizeFirstLetter } from "@/utils/randomGenerator";
import SuccessModal from "@/components/common/SuccessModal";
import ButtonLoaderTransactions from "@/components/common/buttonLoader";
import { formatCurrency } from "@/utils/helper";
import AccountCard from "../accountName";
import BVNNumberInputs from "../common/bvninput";

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
  const [depositType, setDepositType] = useState("cash");
  const { validate } = useTransaction();
  const { deposit } = depositTransaction();
  const { chequeDeposit } = chequeDepositTransaction();
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [currency, setCurrency] = useState<string>("No currency");
  const [narration, setNarration] = useState<any>("");
  const [senderAccount, setSenderAccount] = useState<any>();
  const [accountNumber, setAccountNumber] = useState<any>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [beneficiaryLoading, setBeneficiaryLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [depositor, setDepositor] = useState<string | null>("");
  const [depositorPhone, setDepositorPhone] = useState<string | null>("");
  const [benefiaryAccountNumber, setBenefiaryAccountNumber] = useState<any>();
  const [benefiaryAccount, setBenefiaryAccount] = useState<any>();
  const [accountType, setAccountType] = useState<string>("");

  const [chequeValidated, setChequeValidated] = useState<boolean>(false);
  const [loadingCheque, setLoadingCheque] = useState<boolean>(false);
  const [bvn,setBVN] = useState<string>("");
  const [cheque, setCheque] = useState<string>("");

  useEffect(() => {
    const currentUser = localStorage.getItem("token");
    if (currentUser) {
      setCurrentUser(JSON.parse(currentUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const chequeValidationAction = async (cheque:string) => {
    if (!cheque || cheque?.length < 0) {
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

    if (depositType != "cheque") {
      if (userType == CustomerType.Self) {
        setDepositor(senderAccount?.acc_name);
        setNarration(
          `${capitalizeFirstLetter(depositType)} deposit by ${senderAccount?.acc_name
          }`
        );
        console.log("Narration set for self deposit.");
      } else {
        // setDepositor(null);
        setNarration(
          `${capitalizeFirstLetter(depositType)} deposit by ${depositor}`
        );
//console.log("Narration set for third-party deposit.",depositType,"dsdd");
      }

    } else {
      if (accountNumber == benefiaryAccountNumber) {
        toast.error("Beneficiary account number cannot be the same as sender account number", {
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
        return;

      }
    }
    console.log("Proceeding with deposit.",narration);
    setShowDetailModal(true);
  };

  const isProceedDisabled =
    !accountNumber || !senderAccount || !amount || loading || isProcessing
    || (accountType == AccountType.Current && depositType == DepositType.Cheque && !chequeValidated) ||
    (userType === CustomerType.ThirdParty && (!depositor || !depositorPhone))
    || (accountType == AccountType.Current && depositType == DepositType.Cheque && !currency)

    || (accountType == AccountType.Current && depositType == DepositType.Cheque && !benefiaryAccount)
    || (accountType == AccountType.Current && depositType == DepositType.Cheque && !narration)
    ;



  const validateAccount = useCallback(
    (accountNumber: string) => {
      if (!accountNumber) {
        setSenderAccount(null);
        return;
      }

      setLoading(true);
      setSenderAccount(null);
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
              setCurrency(res.data.getaccounts.currency);
              setSenderAccount(res.data.getaccounts);
              let glAccounType: string;
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
                setAccountType(glAccounType);
              } else if (individualCurrentGLCodes.includes(glcode)) {
                glAccounType = "current";
                setAccountType(glAccounType);
              } else if (corporateGLCodes.includes(glcode)) {
                glAccounType = "current";
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
              }
            } else {
              setIsProcessing(false);
              if (res.data && res.data.message===accountNumber) {
                toast.error(
                    "Account number is  invalid",
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
                setAccountNumber("");
                setLoading(false);
                return;
                
            }
              toast.error(DOMPurify.sanitize(res.data.message|| res?.description), {
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




  const validateBeneficiaryAccount = useCallback(
    (accountNumber: string) => {
      if (!accountNumber) {
        setBenefiaryAccount(null);
        return;
      }

      setBeneficiaryLoading(true);
      setBenefiaryAccount(null);

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
            setBenefiaryAccount(null);
          } else {
            if (res?.data?.getaccounts?.currency) {

              setBenefiaryAccount(res.data.getaccounts);

            } else {
              setIsProcessing(false);
              if (res.data && res.data.message===accountNumber) {
                toast.error(
                    "Account number is  invalid",
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
                setBenefiaryAccount(null);
                setBenefiaryAccountNumber("");
                setBeneficiaryLoading(false);
                return;
                
            }

              toast.error(DOMPurify.sanitize(res.data.message|| res?.description), {
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
          setBeneficiaryLoading(false);
        })
        .catch((e) => {

          setBenefiaryAccount(null);
          setBeneficiaryLoading(false);
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
      currency:  senderAccount.currency_code.toString(),
      amount,
      

      accountName: senderAccount?.acc_name,
      transactionId: generate(12),
      accountStatus: "active",
      isThirdparty: userType === CustomerType.ThirdParty ? true : false,
      depositorType: userType,
      depositorName: depositor ? depositor : "Owner",
      narration: narration,
      mobileNumber: userType === CustomerType.Self ? senderAccount.mobile : depositorPhone,
      bvn: userType === CustomerType.ThirdParty?bvn: senderAccount?.customerBVN,
      branchNumber: currentUser.BRANCH_CODE,
    };
    console.log("Deposit data: ", data);
    deposit(data)
      .then((res: any) => {
        console.log("Deposit response: ", res);
        setLoading(false);
        if (res?.sucesss === false || res.success === "false") {
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


  const onSubmitCheque = async () => {
    setLoading(true);
    const data: any = {
      fromAccount: accountNumber,
      transactionType: "Cheque Deposit",
      toAccount: benefiaryAccountNumber,
      senderName: senderAccount?.acc_name,
      recipientName: benefiaryAccount?.acc_name,
      chequeNumber: cheque,
      chequeType: "",
      currency: senderAccount?.currency,
      amount,
      accountStatus: "active",
      accountType: accountType,
      isThirdparty: userType === CustomerType.ThirdParty,


      transactionId: generate(12),

      narration: narration,

      bvn:userType === CustomerType.ThirdParty?bvn: senderAccount?.bvn,
      branchCode: currentUser.BRANCH_CODE,
    };
    chequeDeposit(data)
      .then((res: any) => {
        console.log("Deposit response: ", res);
        setLoading(false);
        if (res?.sucesss === false || res.success == "false") {
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
                e.currentTarget.value = sanitizeInput(e.currentTarget.value.replace(
                  /[^0-9]/g,
                  ""
                ));
                // e.target.value = sanitizeInput(e.target.value);
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
            <AccountCard account={senderAccount} userType={userType} />


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
                  e.currentTarget.value = sanitizeInput(e.currentTarget.value.replace(
                    /[^0-9]/g,
                    ""
                  ));
                }}
                onBlur={() => chequeValidationAction(cheque)}
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
              className={`${chequeValidated ? "text-[#099F4E]" : "text-[#304DAF]"
                } text-bold ml-0 mb-6 mt-0 ms-5 cursor-pointer`}
            >
              {"Cheque number Validated"}
            </div>
          ) : null}

          {(senderAccount && accountType == AccountType.Current && chequeValidated === true) && <div>
            <div className="mb-6">
              <AccountNumberInput
                type="number"
                name="accountNumber"
                id="beneficiaryAccountNumber"
                value={benefiaryAccountNumber}
                handleChange={(e) => setBenefiaryAccountNumber(e.target.value)}
                handleInput={(e) => {
                  e.currentTarget.value = sanitizeInput(e.currentTarget.value);
                }}
                onBlur={() => validateBeneficiaryAccount(benefiaryAccountNumber)}
                labelText={"Beneficiary Account Number"}
                labelFor={""}
                placeholder={"Please enter beneficiary account number"}
                customClass={
                  "bg-white-50 h-[50px] border border-gray-200 text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-full pl-8"
                }
              />
            </div>

            {beneficiaryLoading ? (
              <InlineTextLoader></InlineTextLoader>
            ) : benefiaryAccount ? (
              <AccountCard account={benefiaryAccount} userType={null} />
             
            ) : null}

          </div>}

          {senderAccount && (
            <div className="mb-8">
              <div className="flex gap-3">
                {(senderAccount &&
                  accountType == AccountType.Current) && (
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Currency
                      </Label>
                      <Select value={currency}>
                        <SelectTrigger className="w-full !h-12.5 rounded-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Currencies.map((c) => (
                            <SelectItem
                              key={c.value}
                              value={c.value}
                              disabled={c.value !== currency} // <-- disable all except selected
                              className={c.value !== currency ? "text-gray-400" : ""}
                            >
                              {c.label}
                            </SelectItem>
                          ))}

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

          {(userType === CustomerType.ThirdParty && amount) ? (
            <div>
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Depositor Name
                </Label>
                <input
                  type="text"
                  name="depositor"
                  id="depositor"
                  value={depositor || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                
                    // Allow letters and spaces only
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      setDepositor(value);
                    }
                  }}
                  placeholder="Please enter depositor name"
                  className="bg-white-50 h-[50px] border border-gray-200 text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-full pl-8"
                />
              </div>

              {/*** add depositors phone */}

              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Depositor Phone Number
                </Label>
                <input
                  type="text"
                  name="depositorPhone"
                  id="depositorPhone"
                  value={depositorPhone || ""}
                  onChange={(e) => {
                    // Remove anything that is not a digit
                    const cleaned = e.target.value.replace(/\D/g, "");
                
                    // Allow only up to 11 digits
                    if (cleaned.length <= 11) {
                      setDepositorPhone(cleaned);
                    }
                  }}
                  placeholder="Please enter depositor phone number"
                  className="bg-white-50 h-[50px] border border-gray-200 text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-full pl-8"
                />
              </div>


              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Enter Bvn
                </Label>
                <BVNNumberInputs
                          type="number"
                          name="bvn"
                          id="bvn"
                          handleChange={(e) => setBVN(e.target.value)}
                          value={bvn}
                          labelText={""}
                          handleInput={(e) => {
                            e.currentTarget.value = e.currentTarget.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                          }}
                          labelFor={"bvn"}
                          placeholder={"BVN"}
                          customClass={
                            "bg-white-50 border border-gray-200 h-[48px] text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                          }
                        ></BVNNumberInputs>
              </div>
            </div>

            
          ):null}

          {(accountNumber && benefiaryAccountNumber && amount && chequeValidated) ? (
            <div className="mt-4 mb-4">
              <div className="text-bold" style={{ color: "#000000" }}>
                Narration
              </div>
              <textarea
                className="bg-[#F4F6FF] h-[80px] border border-gray-200 text-gray-900 sm:text-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2"
                placeholder="Enter narration"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              />
            </div>
          ) : null}

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


              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deposit Type</span>
                <span className="text-gray-400">
                  {depositType.toLocaleUpperCase()} Deposit
                </span>
              </div>

              {benefiaryAccount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Beneficiary account number</span>
                  <span className="text-gray-400">
                    {benefiaryAccountNumber}
                  </span>
                </div>
              )}

              {benefiaryAccount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Beneficiary Name</span>
                  <span className="text-gray-400">
                    {benefiaryAccount?.acc_name}
                  </span>
                </div>
              )}
            </div>

            {!loading ? (
              <Button
                onClick={accountType == AccountType.Current && depositType == DepositType.Cheque ? onSubmitCheque : onSubmit}
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
        title="Your deposit instruction has been submitted successfully"
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