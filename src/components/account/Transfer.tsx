"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer, Bounce } from "react-toastify";
import AccountNumberInput from "../common/accountNumberInput";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DOMPurify from "dompurify";
import {

  useTransaction,
  transferTransaction,
} from "../../hooks/account/useTransaction";
import { sanitizeInput } from "@/utils/sanitizer";
import { AccountType, Currencies, CustomerType } from "@/utils/base.enum";
import CurrencyInput from "react-currency-input-field";
import InlineTextLoader from "../common/inlineTextLoader";
import { formatCurrency } from "@/utils/helper";
import ButtonLoaderTransactions from "../common/buttonLoader";
import generate from "@/utils/randomGenerator";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../common/SuccessModal";

// import BVNNumberInputs from "../common/bvninput";
import AccountCard from "../accountName";



interface TransferData {
    fromAccount:string;
    toAccount:string;
    senderName:string;

  recipientName:string;
  transactionType: string;
  currency: string;
  accountType: string;
  amount: number;

  transactionId: string;
  accountStatus: string;
 
  narration: string;
 
  branchCode: string;
 
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

export default function Transfer({
  userType,
  corporateGLCodes,
  individualCurrentGLCodes,
  savingsIndividualGLCodes,
}: WithdrawalProps) {
  const [senderAccount, setSenderAccount] = useState< any>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("");
  const [, setAccountSubType] = useState<string>("");
  const [currency, setCurrency] = useState<string>("No currency");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { validate } = useTransaction();
 

  const { transfer } = transferTransaction();
 
  const [amount, setAmount] = useState<number>(0);
  const [narration, setNarration] = useState<string>("");


  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [queueNumber, setQueueNumber] = useState("");

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);



  const navigate = useNavigate();
  const [benefiaryAccountNumber, setBenefiaryAccountNumber] = useState<any>();
  const [beneficiaryLoading, setBeneficiaryLoading] = useState<boolean>(false);
  const [benefiaryAccount, setBenefiaryAccount] = useState<any>();



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
              setCurrency(res.data.getaccounts.currency);

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

 

  


  const handleProceed = () => {

    //set narration based on user type
    // if (userType === CustomerType.Self) {
    //   setNarration(`Funds transfer by ${senderAccount?.acc_name}`);
    // } else {
    //   // setNarration(
    //   //   `Cash withdrawal by ${location.state.transaction?.beneficiary}`
    //   // );
    // }
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



  const onSubmitSavingsWithdrawal = async () => {
    if (!senderAccount || !currentUser) return;
    setLoading(true);
    let res: any;
    try {
    //   if (accountType === AccountType.Savings) {
        const data: TransferData = {
            fromAccount: accountNumber,
            toAccount: benefiaryAccountNumber,
            senderName: senderAccount?.acc_name,
      recipientName: benefiaryAccount?.acc_name,
          transactionType:
            "transfer",
          currency: senderAccount.currency_code.toString(),
          accountType: accountType,
          amount,
         
          transactionId: generate(12),
          accountStatus: "active",
        
          narration: narration,
       
          //bvn: senderAccount.bvn,
          branchCode: currentUser.BRANCH_CODE,
         
        };
        res = await transfer(data);
      

      console.log("transfer response: ", res);
      setLoading(false);
      if (res?.sucesss === false || res.success==="false") {
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
    !accountNumber || !senderAccount || !amount || loading || isProcessing || !benefiaryAccount ||!currency ;


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
                e.target.value = sanitizeInput(e.target.value.replace(
                  /[^0-9]/g,
                  ""
                ));
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
          ) : senderAccount  ? (
            <AccountCard account={senderAccount} userType={userType} />
           
          ) : null}

          {/* {(senderAccount && senderAccount?.currency !== "NGN") ? (
            <p className="mt-8 text-red-500 text-start">
              FCY transactions are currently not available
            </p>
          ) : null} */}

{(senderAccount && accountType == AccountType.Current ) && <div>
            <div className="mb-6">
              <AccountNumberInput
                type="number"
                name="accountNumber"
                id="beneficiaryAccountNumber"
                value={benefiaryAccountNumber}
                handleChange={(e) => setBenefiaryAccountNumber(e.target.value)}
                handleInput={(e) => {
                  e.target.value = sanitizeInput(e.target.value);
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


          {
            (senderAccount && benefiaryAccount)  && (
              <div className="mb-5">

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
            )
          }

{(senderAccount && benefiaryAccount && amount )  && (
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
                  </div>
                  </div>
            )}


{(senderAccount && benefiaryAccount && amount ) ? (
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
                Transfer information
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
                <span className="text-gray-600">Transfer Type</span>
                <span className="text-gray-400">
                  Transfer
                </span>
              </div>



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