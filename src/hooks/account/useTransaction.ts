import { accountService } from "@/services";
import { useCallback } from "react";

export const useTransaction = () => {
  const validate = useCallback(async (accountNumber: string) => {
    const user = await accountService.validate(accountNumber);
    return user;
  }, []);

  const glcodesList = useCallback(async () => {
    const res = await accountService.getAllGlCodes();
    return res;
  }, []);

  return { validate, glcodesList };
};

  export const depositTransaction = () => {
    const deposit = async (data: any) => {
      const user = await accountService.deposit(data);
      return user;
    };
    return { deposit };
  };

  export const chequeDepositTransaction = () => {
    const chequeDeposit = async (data: any) => {
      const user = await accountService.chequeDeposit(data);
      return user;
    };
    return { chequeDeposit };
  };

  export const chequeValidation = () => {
    const validateCheque = async (Cheque: any, accountNumber: any) => {
      const response = await accountService.validateCheque(Cheque, accountNumber);
      return response;
    };
    return { validateCheque };
  };

  