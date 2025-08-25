import { Routes, Route } from "react-router";
import Landing from "./landing/landing";
import Login from "./login/login";
import SelectBranch from "./login/selectBranch";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" index element={<Login />} />
      <Route path="/login" index element={<Login />} />
      <Route path="/home" element={<Landing />} />
      <Route path="/select-branch" element={<SelectBranch />} />
    </Routes>
  );
}
