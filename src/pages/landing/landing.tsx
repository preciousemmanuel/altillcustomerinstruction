import { CustomerType } from "@/utils/base.enum";
import { User, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleProceed = () => {
    if (!selected) return;
    navigate("/transaction-type", { state: { userType: selected } });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-lg">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Customer Instruction Portal
          </h1>
          <p className="text-gray-600 text-lg">
            Submit your transaction instructions quickly and securely, to be
            treated by a teller.
          </p>
        </div>

        {/* Options Container */}
        <div className="space-y-4 mb-8">
          {/* Customer Option */}
          <button
            onClick={() => setSelected(CustomerType.Self)}
            className={`w-full p-6 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
              selected === CustomerType.Self
                ? "border-gray-300 bg-gray-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selected === CustomerType.Self
                    ? "bg-blue-100 text-blue-500"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <User className="w-6 h-6" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Customer</h3>
              <p className="text-gray-600 mt-1">
                Submit transaction instructions for your account
              </p>
            </div>
          </button>

          {/* Third Party Option */}
          <button
            onClick={() => setSelected(CustomerType.ThirdParty)}
            className={`w-full p-6 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
              selected === CustomerType.ThirdParty
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selected === CustomerType.ThirdParty
                    ? "bg-blue-200 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <UserPlus className="w-6 h-6" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Third Party</h3>
              <p className="text-gray-600 mt-1">
                Submit transaction instructions on behalf of a customer
              </p>
            </div>
          </button>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={!selected}
          className={`w-full font-semibold py-3 px-6 rounded-xl transition-colors ${
            !selected
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}

export default Landing;
