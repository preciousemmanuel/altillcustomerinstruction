"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer, Bounce } from "react-toastify";
import AccountNumberInput from "../common/accountNumberInput";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InfoCircle } from "iconsax-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DOMPurify from "dompurify";
import {
  limitCBNAction,
  useTransaction,
  savingsWithdrawalTransaction,
  chequeWithdrawalTransaction,
  chequeValidation
} from "../../hooks/account/useTransaction";
import { sanitizeInput } from "@/utils/sanitizer";
import { AccountType, ChequeType, CustomerType } from "@/utils/base.enum";
import CurrencyInput from "react-currency-input-field";
import InlineTextLoader from "../common/inlineTextLoader";
import { formatCurrency } from "@/utils/helper";
import ButtonLoaderTransactions from "../common/buttonLoader";
import generate from "@/utils/randomGenerator";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../common/SuccessModal";

import PhoneNumberInputs from "../common/phonenumberInput";
import BVNNumberInputs from "../common/bvninput";


interface SenderAccount {
  acc_name: string;
  acc_type: string;
  aval_balance: number;
  bvn: string;
  cif_sub_no: string;
  currency: string;
  currency_code: string;
  gl_code: string;
}

interface CbnLimitResponse {
  description: string;
  data?: {
    total_withdrawn: number;
    remaining_limit: number;
    charge: number;
    vat: number;
  };
}





interface SavingsWithdrawalData {
  accountNumber: string;
  transactionType: string;
  currency: string;
  accountType: string;
  amount: number;
  accountName: string;
  nuban: string;
  transactionId: string;
  accountStatus: string;
  isThirdparty: boolean;
  narration: string;
  bvn: string;
  branchCode: string;
  isWithinLimit: boolean;
  remainingLimit: number;
  charge: number;
  vat: number;
}

interface CurrentWithdrawalData {
  accountNumber: string;
  chequeNumber: string;
  customerId: string;
  transactionType: string;
  currency: string;
  depositorName: string;
  chequeType: string;
  ischequeValid: boolean;
  isCorporate: boolean;
  accountType: string;
  amount: number;
  accountName: string;
  nuban: string;
  transactionId: string;
  accountStatus: string;
  isThirdparty: boolean;
  narration: string;
  bvn: string;
  branchCode: string;
  isWithinLimit: boolean;
  remainingLimit: number;
  charge: number;
  vat: number;
  beneficiary?: string;
  phone?: string;
}

interface CurrentUser {
  BRANCH_CODE: string;
}

interface WithdrawalProps {
  userType: string;
  corporateGLCodes: string[];
  individualCurrentGLCodes: string[];
  savingsIndividualGLCodes: string[];
}

export default function Withdrawal({
  userType,
  corporateGLCodes,
  individualCurrentGLCodes,
  savingsIndividualGLCodes,
}: WithdrawalProps) {
  const [senderAccount, setSenderAccount] = useState< any>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("");
  const [accountSubType, setAccountSubType] = useState<string>("");
  const [, setCurrency] = useState<string>("No currency");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { validate } = useTransaction();
  const { limitCBN } = limitCBNAction();
  const { validateCheque } = chequeValidation();
  const { savingsWithdrawal } = savingsWithdrawalTransaction();
  const { chequeWithdrawal } = chequeWithdrawalTransaction();
  const [amount, setAmount] = useState<number>(0);
  const [narration, setNarration] = useState<string>("");
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [, setLimitAmount] = useState<number>(0);
  const [excessAmount, ] = useState<number>(0);
  const [cfiloader, setCFILoader] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [queueNumber, setQueueNumber] = useState("");
  const [resp, setResp] = useState<CbnLimitResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [chequeType, setChequeType] = useState<string>("");
  const [cheque, setCheque] = useState<string>("");
  const [chequeValidated, setChequeValidated] = useState<boolean>(false);
  const [loadingCheque, setLoadingCheque] = useState<boolean>(false);
  const [beneficiary, setBeneficiary] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [bvn, setBVN] = useState<string>("ß");
  const navigate = useNavigate();


  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Store timeout reference


  useEffect(() => {
    const currentUser = localStorage.getItem("token");
    console.log({ currentUser });
    if (currentUser) {
      setCurrentUser(JSON.parse(currentUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const validateAccount = useCallback(
    (accountNumber: string) => {
      if (!accountNumber) {
        setSenderAccount(null);
        return;
      }

      setLoading(true);
      setSenderAccount(null);
      setAccountType("");
      setAccountSubType("");
      validate(accountNumber)
        .then((res:any) => {
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
                setAccountType(glAccounType);
                setAccountSubType(accountCategory);
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
        .catch((e: any) => {
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
    [validate, corporateGLCodes, individualCurrentGLCodes, savingsIndividualGLCodes]
  );

  const handleKeyUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Clear the previous timeout
    }

    timeoutRef.current = setTimeout(() => {
      checkLimit();
    }, 2000); // Delay API call by 2 seconds
  };

  const getCBNLimit = async (cif_sub_no: string) => {
    return limitCBN({
      cif_sub_no,
      withdrawalAmount: amount,
      balance: senderAccount.aval_balance,
      isCooporate: accountSubType === "corporate" ? true : false,
      isThirdparty: userType === CustomerType.ThirdParty ? true : false,
      isCurrent: accountSubType === "individual_current" ? true : false,
      ledgerName: senderAccount.acc_type,
    });
  };

  const checkLimit = () => {
    if (amount > 0 && senderAccount) {
      setResponseMessage("");
      if (Number(amount) > senderAccount.aval_balance) {
        setResponseMessage("");
        setCFILoader(false);
      } else {
        getCBNLimit(senderAccount.cif_sub_no.toString())
          .then((res: any) => {
            console.log(res, "Response MSG");
            setResp(res);
            localStorage.setItem("CFI", JSON.stringify(res));
            setResponseMessage(res.description);
            if (res.data) {
              setLimitAmount(res.data.total_withdrawn);
            }
            setCFILoader(false);

            // if (res?.data?.description.includes("Transaction exceeds limit")) {
            //   setAccountLimit(Number(res.data?.data?.LIMIT));
            //   setExcessAmount(totalAmount - Number(res.data?.data?.LIMIT));
            // }
          })
          .catch((error: any) => {
            console.log(error, "ERROR MESSAGE");
            toast.error(
              DOMPurify.sanitize(error?.response?.data) || "An Error Occured",
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
      }
    } else {
      return;
    }
  };
  const handleProceed = () => {

    //set narration based on user type
    if (userType === CustomerType.Self) {
      setNarration(`Cash withdrawal by ${senderAccount?.acc_name}`);
    } else {
      // setNarration(
      //   `Cash withdrawal by ${location.state.transaction?.beneficiary}`
      // );
    }
    setShowDetailModal(true);
    // toast.info("Withdrawal functionality is not yet implemented.", {
    //   position: "top-right",
    //   autoClose: 5000,
    //   hideProgressBar: false,
    //   closeOnClick: true,
    //   pauseOnHover: true,
    //   draggable: true,
    //   progress: undefined,
    //   theme: "light",
    // });
  };

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
          res.data?.data?.chequestatus !== "DRAWN" &&
          res.data?.data?.chequestatus !== "AVAILABLE"
        ) {
          toast.error(DOMPurify.sanitize(res.message) || "An error occurred", {
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
        } else if (res.data?.data?.chequestatus === "DRAWN") {
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
          res.data?.description === "True" &&
          res.data?.data?.chequestatus === "AVAILABLE"
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
      .catch((e: any) => {
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

  const onSubmitSavingsWithdrawal = async () => {
    if (!senderAccount || !currentUser) return;
    setLoading(true);
    let res: any;
    try {
      if (accountType === AccountType.Savings) {
        const data: SavingsWithdrawalData = {
          accountNumber,
          transactionType:
            accountType === AccountType.Savings
              ? "Savings withdrawal"
              : userType,
          currency: senderAccount.currency_code.toString(),
          accountType: accountType,
          amount,
          accountName: senderAccount.acc_name,
          nuban: accountNumber,
          transactionId: generate(12),
          accountStatus: "active",
          isThirdparty: userType === CustomerType.ThirdParty,
          narration: narration,
          bvn: senderAccount.bvn,
          branchCode: currentUser.BRANCH_CODE,
          isWithinLimit:
            resp?.description?.includes("Transaction within limit") || false,
          remainingLimit: resp?.data?.remaining_limit || 0,
          charge: resp?.data?.charge || 0,
          vat: resp?.data?.vat || 0,
        };
        res = await savingsWithdrawal(data);
      } else {
        const data: CurrentWithdrawalData = {
          accountNumber,
          chequeNumber: cheque,
          customerId: senderAccount.cif_sub_no.toString(),
          transactionType: "Cheque withdrawal",
          currency: senderAccount.currency_code.toString(),
          depositorName: senderAccount.acc_name,
          chequeType: chequeType,
          ischequeValid: chequeValidated,
          isCorporate: accountSubType !== "individual_current",
          accountType: accountType,
          amount,
          accountName: senderAccount.acc_name,
          nuban: accountNumber,
          transactionId: generate(12),
          accountStatus: "active",
          isThirdparty: userType === CustomerType.ThirdParty,
          narration: narration,
          bvn: bvn,
          branchCode: currentUser.BRANCH_CODE,
          isWithinLimit:
            resp?.description?.includes("Transaction within limit") || false,
          remainingLimit: resp?.data?.remaining_limit || 0,
          charge: resp?.data?.charge || 0,
          vat: resp?.data?.vat || 0,
        };
        if (userType === CustomerType.ThirdParty) {
          data.beneficiary = beneficiary;
          data.phone = phone;
        }
        res = await chequeWithdrawal(data);
      }

      console.log("withdrawal response: ", res);
      setLoading(false);
      if (res.sucesss === false) {
        toast.error(DOMPurify.sanitize(res.message || "An error occurred"), {
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
        setQueueNumber(res.data?.queuenumber || "");
        setShowSuccessModal(true);
      }
    } catch (e: unknown) {
      setLoading(false);
      const error = e as { response?: { data?: { title?: string } } };
      toast.error(
        DOMPurify.sanitize(error.response?.data?.title || "An error occurred"),
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
    }
    
    
    
    
     
  };
  const isProceedDisabled =
    !accountNumber || !senderAccount || !amount || loading || isProcessing || cfiloader || (chequeType==ChequeType.Cheque && !chequeValidated && accountType==AccountType.Current) || (userType==CustomerType.ThirdParty && !beneficiary && accountType==AccountType.Current);


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
          ) : senderAccount && senderAccount.currency == "NGN" ? (
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

          {(senderAccount && senderAccount?.currency !== "NGN") ? (
            <p className="mt-8 text-red-500 text-start">
              FCY transactions are currently not available
            </p>
          ) : null}

          {senderAccount && accountType == AccountType.Current && (
            <div>
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Cheque Type
                </Label>
                <Select value={chequeType} onValueChange={setChequeType}>
                  <SelectTrigger className="w-full !h-12.5 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="counter">Counter Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>



            </div>

          )}

          {senderAccount && accountType == AccountType.Current && (
            <div>
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
                  labelText={chequeType == ChequeType.Cheque ? `Enter cheque number` : `Enter counter cheque number`}
                  labelFor={""}
                  //placeholder={"Please enter cheque number"}
                  customClass={
                    "bg-white-50 h-[50px] border border-gray-200 text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-full pl-8"
                  }
                />
              </div>

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
            </div>
          )}
          {
            senderAccount && accountType == AccountType.Current && userType==CustomerType.ThirdParty && (
              <div>
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Beneficiary Name
                </Label>
                <input
                  type="text"
                  name="depositor"
                  id="depositor"
                  value={beneficiary || ""}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  placeholder="Please enter beneficiary name"
                  className="bg-white-50 h-[50px] border border-gray-200 text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-full pl-8"
                />
              </div>
  
              {/*** add depositors phone */}
  
               <div className="mb-6">
                
                <div>
                        <PhoneNumberInputs
                          type="number"
                          name="phone"
                          id="phone"
                          handleChange={(e) => setPhone(e.target.value)}
                          handleInput={(e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                          }}
                          value={phone}
                          labelText={"Phone Number"}
                          labelFor={"Phone Number"}
                          placeholder={"080475784..."}
                          customClass={
                            "bg-white-50 border border-gray-200 h-[48px] text-gray-900 sm:text-sm rounded-full focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                          }
                        ></PhoneNumberInputs>
                      </div>
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
                            e.target.value = e.target.value.replace(
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

            )
          }

          {
            senderAccount && senderAccount?.currency === "NGN" && (
              <div>

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
                    onKeyUp={() => {
                      if (Number(amount) > senderAccount.aval_balance) {
                        setCFILoader(false);
                        setResponseMessage("");
                      } else if (amount == 0) {
                        setCFILoader(false);
                        setResponseMessage("");
                      } else {
                        setResponseMessage("");
                        setCFILoader(true);
                        handleKeyUp();
                      }
                    }}
                    onValueChange={(value) =>
                      setAmount(value ? Number(value) : 0)
                    }
                  />


                  <p className="text-black text-sm mt-2">
                    {cfiloader == true && "Checking limit ...."}
                  </p>
                  <p className="text-[#FF0000] text-sm mt-2">
                    {responseMessage &&
                      responseMessage != "Transaction within limit" &&
                      responseMessage?.length > 0 &&
                      amount > 0 &&
                      Number(amount) < senderAccount.aval_balance && (
                        <>
                          <div className="flex gap-2 items-start">
                            <InfoCircle size={20} />
                            <p>{responseMessage}</p>
                          </div>
                        </>
                      )}
                  </p>
                  {excessAmount !== 0 ? (
                    <p className="text-[#FF0000] text-normal mt-[-15px] text-sm">
                      Amount exceeds CBN withdrawal limit for individual
                      accounts. Additional charges will apply if you proceed.
                    </p>
                  ) : null}
                  {/* {transactionType === "thirdParty" &&
                    Number(amount) >= Number(100001) ? (
                      <p className="text-[#FF0000] text-normal mt-[15px] text-sm">
                        Amount is above third party withdrawal limit
                      </p>
                    ) : null} */}
                  {Number(amount) > senderAccount.aval_balance ? (
                    <p className="text-[#FF0000] text-normal mt-[15px] text-sm">
                      Insufficient balance for this transaction
                    </p>
                  ) : null}
                </div>
              </div>
            )
          }


          <div className="flex gap-3 mt-8">
            <Button
              disabled={isProceedDisabled}
              onClick={handleProceed}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-full font-medium"
            >
              Proceed
            </Button>
            <Button
            onClick={() => navigate("/home")}
              variant="outline"
              
              className="flex-1 border-red-300 text-red-600 h-12 rounded-full font-medium bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <SuccessModal
        title="Your withdrawal instruction has been submitted successfully"
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        queueNumber={queueNumber}
      />


      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md mx-auto p-0 gap-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Withdrawal information
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




              {beneficiary && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Beneficiary Name </span>
                  <span className="text-gray-400">
                    {beneficiary}
                  </span>
                </div>
              )}

              {phone && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Beneficiary Phone Number</span>
                  <span className="text-gray-400">
                    {phone}
                  </span>
                </div>
              )}
              {bvn && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Beneficiary Bvn</span>
                  <span className="text-gray-400">
                    {bvn}
                  </span>
                </div>
              )}
            </div>

            {!loading ? (
              <Button
                onClick={onSubmitSavingsWithdrawal}
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
    </>
  );
}