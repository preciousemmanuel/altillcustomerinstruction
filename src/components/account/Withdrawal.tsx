"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer, Bounce } from "react-toastify";
import AccountNumberInput from "../common/accountNumberInput";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InfoCircle } from "iconsax-react";
import DOMPurify from "dompurify";
import {
  limitCBNAction,
  useTransaction,
  savingsWithdrawalTransaction
} from "../../hooks/account/useTransaction";
import { sanitizeInput } from "@/utils/sanitizer";
import { AccountType, CustomerType, DepositType } from "@/utils/base.enum";
import CurrencyInput from "react-currency-input-field";
import InlineTextLoader from "../common/inlineTextLoader";
import { formatCurrency } from "@/utils/helper";
import ButtonLoaderTransactions from "../common/buttonLoader";
import generate from "@/utils/randomGenerator";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../common/SuccessModal";

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
  const [senderAccount, setSenderAccount] = useState<any>();
  const [accountNumber, setAccountNumber] = useState<any>();
  const [accountType, setAccountType] = useState<string>("");
  const [accountSubType, setAccountSubType] = useState<any>("");
  const [currency, setCurrency] = useState<string>("No currency");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { validate } = useTransaction();
  const { limitCBN } = limitCBNAction();
  const { savingsWithdrawal } = savingsWithdrawalTransaction();
  const [amount, setAmount] = useState<number>(0);
  const [narration, setNarration] = useState<any>("");
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [limitAmount, setLimitAmount] = useState<number>(0);
  const [accountLimit, setAccountLimit] = useState<number>(0);
  const [excessAmount, setExcessAmount] = useState<number>(0);
  const [cfiloader, setCFILoader] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [queueNumber, setQueueNumber] = useState("");
  const [resp, setResp] = useState<any>();
  const [currentUser, setCurrentUser] = useState<any>({});
  const navigate = useNavigate();
  let timeout: NodeJS.Timeout; // Store timeout reference

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
    if (amount > 0) {
      setResponseMessage("");
      if (Number(amount) > senderAccount.aval_balance) {
        setResponseMessage("");
        setCFILoader(false);
      } else {
        getCBNLimit(senderAccount.cif_sub_no.toString())
          .then((res: any) => {
            const totalAmount: number =
              amount + Number(res.data?.data?.TOTAL_WITHDRAWN);
            console.log(res, "Response MSG");
            setResp(res);
            localStorage.setItem("CFI", JSON.stringify(res));
            setResponseMessage(res?.description);
            setLimitAmount(res?.data?.total_withdrawn);
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


  const onSubmitSavingsWithdrawal = async () => {
    setLoading(true);
    const data: any = {
      accountNumber,
      transactionType: accountType===AccountType.Savings? "Savings withdrawal":userType,
      currency: senderAccount?.currency,
      accountType: accountType,
      amount,
     accountName: senderAccount?.acc_name,
      nuban:accountNumber,
      transactionId: generate(12),
      accountStatus: "active",
      isThirdparty:userType === CustomerType.ThirdParty ? true : false,
      
      narration: narration,
      //mobileNumber:userType===CustomerType.Self? senderAccount.mobile: depositorPhone,
      bvn: senderAccount?.bvn,
      branchCode: currentUser.BRANCH_CODE,

      isWithinLimit: resp?.description == "Transaction within limit" ||
      resp?.description.includes("Transaction within limit")
      ? true
      : false || false,
      remainingLimit: resp?.data?.remaining_limit || 0,
      charge: resp?.data?.charge || 0,
      vat: resp?.data?.vat || 0,
    };
    savingsWithdrawal(data)
      .then((res: any) => {
        console.log("withdrawal response: ", res);
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
  const isProceedDisabled =
    !accountNumber || !senderAccount || !amount || loading || isProcessing|| cfiloader;


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
              variant="outline"
              disabled
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


              

              {/* {benefiaryAccount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Beneficiary account number</span>
                  <span className="text-gray-400">
                    {benefiaryAccountNumber}
                  </span>
                </div>
              )} */}

              {/* {benefiaryAccount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Beneficiary Name</span>
                  <span className="text-gray-400">
                    {benefiaryAccount?.acc_name}
                  </span>
                </div>
              )} */}
            </div>

            {!loading ? (
              <Button
                onClick={ onSubmitSavingsWithdrawal}
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