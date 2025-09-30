import { Routes, Route } from "react-router";
import Landing from "./landing/landing";
import Login from "./login/login";
import SelectBranch from "./login/selectBranch";
import AccountForm from "./account-form/AccountForm";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" index element={<Login />} />
      <Route path="/login" index element={<Login />} />
      <Route path="/home" element={<Landing />} />
      <Route path="/select-branch" element={<SelectBranch />} />
      <Route path="/account-form" element={<AccountForm />} />
    </Routes>
  );
}
