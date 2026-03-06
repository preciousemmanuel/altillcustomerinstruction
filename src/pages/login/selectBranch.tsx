import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const SelectBranch = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>("");

  useEffect(() => {
    let branchList = localStorage.getItem("branchToken");

    if (!branchList) {
      navigate("/login");
      return;
    }

    console.log("branchList", branchList);

    branchList = typeof branchList === "string" ? branchList : "";
    if (Object.keys(branchList).length !== 0) {
      const branchData = JSON.parse(branchList);
      setBranches(branchData);
    }
  }, []);

  const handleBranchSelect = useCallback(
    (branchCode: string) => {
      return setSelectedBranchCode(
        selectedBranchCode === branchCode ? "" : branchCode
      );
    },
    [selectedBranchCode]
  );

  const handleContinue = useCallback(async () => {
    if (selectedBranchCode) {
      const selectedBranchData = branches.find(
        (branch) => branch.BRANCH_CODE === selectedBranchCode
      );
      localStorage.setItem("token", JSON.stringify(selectedBranchData));
      localStorage.removeItem("branchToken");
      navigate("/home");
    }
  }, [branches, selectedBranchCode]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md mx-auto rounded-lg p-10">
        <h1 className="text-xl font-bold">Please select Branch</h1>
        {branches.length > 0 ? (
          branches.map((branch, i) => (
            <div
              className={`flex items-center gap-2 rounded-xl p-2 my-8 ${selectedBranchCode === branch.BRANCH_CODE
                  ? "border border-[#304DAF]"
                  : "hover:border hover:border-gray-300"
                }`}
              key={i}
              onClick={() => handleBranchSelect(branch.BRANCH_CODE)}
            >
              <img
                src="/images/logoSmall.svg"
                className="bg-black rounded-[50%] w-12 h-12 p-2"
                alt="Alternative Till Logo"
              />
              <div className="text">
                <div className="font-bold text-base">{branch.BRANCH_NAME}</div>
                <div className="text-xs">
                  {branch.BRANCH_CODE} | Branch Code
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 my-8">
            No branches available. Please contact your administrator.
          </div>
        )}

        <Button
          className="w-full bg-[#304DAF] py-8 text-white rounded-xl text-lg"
          disabled={!selectedBranchCode}
          onClick={() => handleContinue()}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SelectBranch;
