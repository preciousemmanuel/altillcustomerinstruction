import { accountService } from "@/services";



export const useTransaction = () => {
    const validate = async (accountNumber: string) => {
      const user = await accountService.validate(accountNumber);
      return user;
    };
    return { validate };
  };