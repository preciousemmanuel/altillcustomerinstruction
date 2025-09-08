import { accountService } from "@/services";



export const useTransaction = () => {
    const validate = async (accountNumber: string) => {
      const user = await accountService.validate(accountNumber);
      return user;
    };

    
    return { validate };


  };

  export const depositTransaction = () => {
    const deposit = async (data: any) => {
      const user = await accountService.deposit(data);
      return user;
    };
    return { deposit };
  };