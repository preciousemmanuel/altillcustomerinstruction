import { Routes, Route } from "react-router";
import Landing from "./landing/landing";
import Login from "./login/login";
import SelectBranch from "./login/selectBranch";
import AccountForm from "./account-form/AccountForm";
import TransactionSelector from "./transaction-type/TransactionType";
import DepositPage from "./deposit/DepositPage";
import WithdrawalPage from "./withdrawal/WithdrawalPage";
import TransferPage from "./transfer/TransferPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" index element={<Login />} />
      <Route path="/login" index element={<Login />} />
      <Route path="/home" element={<Landing />} />
      <Route path="/select-branch" element={<SelectBranch />} />
      <Route path="/account-form" element={<AccountForm />} />
      <Route path="/transaction-type" element={<TransactionSelector />} />
      <Route path="/deposit" element={<DepositPage />} />
      <Route path="/withdrawal" element={<WithdrawalPage />} />
      <Route path="/transfer" element={<TransferPage />} />
    </Routes>
  );
}
