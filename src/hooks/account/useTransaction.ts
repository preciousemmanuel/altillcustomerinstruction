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


  

  return { validate, glcodesList};
};

export const limitCBNAction = () => {
  const limitCBN = async (data: any) => {
    const user = await accountService.limitCBN(data);
    return user;
  };
  return { limitCBN };
};

  export const depositTransaction = () => {
    const deposit = async (data: any) => {
      const user = await accountService.deposit(data);
      return user;
    };
    return { deposit };
  };

  export const transferTransaction = () => {
    const transfer = async (data: any) => {
      const user = await accountService.transfer(data);
      return user;
    };
    return { transfer };
  };

  export const chequeDepositTransaction = () => {
    const chequeDeposit = async (data: any) => {
      const user = await accountService.chequeDeposit(data);
      return user;
    };
    return { chequeDeposit };
  };

  export const savingsWithdrawalTransaction = () => {
    const savingsWithdrawal = async (data: any) => {
      const user = await accountService.withdraw(data);
      return user;
    };
    return { savingsWithdrawal };
  };

  export const chequeWithdrawalTransaction = () => {
    const chequeWithdrawal = async (data: any) => {
      const user = await accountService.withdrawCheque(data);
      return user;
    };
    return { chequeWithdrawal };
  };

  export const chequeValidation = () => {
    const validateCheque = async (Cheque: any, accountNumber: any) => {
      const response = await accountService.validateCheque(Cheque, accountNumber);
      return response;
    };
    return { validateCheque };
  };

  