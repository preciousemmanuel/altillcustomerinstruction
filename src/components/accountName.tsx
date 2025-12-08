import { CustomerType } from "@/utils/base.enum";
import { formatCurrency } from "@/utils/helper";


interface Props {
    account: any;
    userType: string|null;
    
  }

export default function AccountCard({account,userType}:Props) {
    return (

        <div className="bg-blue-100 mb-5 rounded-lg p-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-medium text-gray-700">Account Name:</p>
            <p className="text-sm font-semibold text-gray-600 mt-2">{account?.acc_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Account Type:</p>
            <p className="text-sm font-semibold text-gray-600 mt-2">{account?.acc_type || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Currency:</p>
            <p className="text-sm font-semibold text-gray-600 mt-2">{account.currency}</p>
          </div>
          {userType === CustomerType.Self && (
          <div>
            <p className="text-sm font-medium text-gray-700">Current Balance</p>
            <p className="text-sm font-semibold text-gray-600 mt-2">{formatCurrency(account?.aval_balance, account?.currency)}</p>
          </div>
          )}
        </div>
      </div>

   
    );
  }
  