import { useState, useEffect } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomerType } from "@/utils/base.enum";

type TransactionType = "deposit" | "withdrawal" | "transfer";

const transactions = [
  {
    id: "deposit",
    title: "Deposit",
    description: "Add money into your account.",
  },
  {
    id: "withdrawal",
    title: "Withdrawal",
    description: "Take money out of your account.",
  },
  {
    id: "transfer",
    title: "Fund Transfer",
    description: "Move funds to another Alt Till account.",
  },
];

export default function TransactionSelector() {
  const [selected, setSelected] = useState<TransactionType>("deposit");
  const [availableTransactions, setAvailableTransactions] = useState<Array<any>>(transactions);
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType;

  useEffect(() => {
    if (!userType) {
      navigate("/home");
    }
  }, [userType, navigate]);

  useEffect(() => {
 
    if (userType && userType ==CustomerType.ThirdParty) {
      const availableTransactions =
  transactions.filter(t => t.id !== "transfer");
  setAvailableTransactions(availableTransactions);
  
    }
  }, [userType, navigate]);

  const handleProceed = () => {
    navigate(`/${selected}`, { state: { userType } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors mb-12"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transaction Type
          </h1>
          <p className="text-gray-600 text-base">Select transaction type</p>
        </div>

        {/* Transaction Options */}
        <div className="space-y-4 mb-8">
          {availableTransactions.map((transaction) => (
            <button
              key={transaction.id}
              onClick={() => setSelected(transaction.id as TransactionType)}
              className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                selected === transaction.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5 ${
                    selected === transaction.id
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {selected === transaction.id && (
                    <Check size={16} className="text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {transaction.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {transaction.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
