import { useNavigate } from "react-router";
import { useState } from "react";
import { toast, Bounce } from "react-toastify";
import DOMPurify from "dompurify";
import { LoaderCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/auth/useLogin";
import { decodeData } from "@/utils/jwtToken";

interface DecodedDataResponse {
  data?: {
    Data?: Record<string, unknown>;
    data?: Record<string, unknown>;
  };
}

// TODO: Add to component library.
function InputWithLabel({
  name,
  label,
  type,
  placeholder,
  handleChange,
}: {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="w-full py-4">
      <Label htmlFor={name} className="pb-2">
        {label}
      </Label>
      <Input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        className="rounded-full h-12 focus-visible:border-[#304DAF]"
        onChange={handleChange}
      />
    </div>
  );
}

function LoginForm() {
  const { login } = useLogin();
  const navigate = useNavigate();

  const [token, setToken] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!token || !userName || !password) return;

    try {
      setIsLoading(true);
      const res = await login(password, userName, token);
      console.log("loginres", res.data.data)
      if (res) {
        const decodedRes = (await decodeData(
          res?.data.data
        )) as DecodedDataResponse;

        console.log("decodedRes", decodedRes?.data)
        localStorage.setItem(
          "branchToken",
          JSON.stringify((decodedRes?.data?.Data || decodedRes?.data) as Record<string, unknown>)
        );
        navigate("/select-branch");
      }
    } catch (e) {
      toast.error(
        DOMPurify.sanitize(
          (e as any)?.response?.data?.message || "Authentication failed"
        ),
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form>
      <InputWithLabel
        name="username"
        label="Username"
        type="text"
        placeholder="Username"
        handleChange={(e) => setUserName(e.target.value)}
      />
      <InputWithLabel
        name="password"
        label="Password"
        type="password"
        placeholder="Password"
        handleChange={(e) => setPassword(e.target.value)}
      />
      <InputWithLabel
        name="token"
        label="Token"
        type="text"
        placeholder="Token"
        handleChange={(e) => setToken(e.target.value)}
      />
      <Button
        className="w-full bg-[#304DAF] py-8 text-white rounded-full text-lg mt-4 cursor-pointer hover:opacity-50"
        type="button"
        disabled={!token.trim() || !userName.trim() || !password.trim()}
        onClick={() => handleLogin()}
      >
        {isLoading ? <LoaderCircle className="animate-spin" /> : "Login"}
      </Button>
      <p className="text-center text-sm mt-5 font-bold">V1.0</p>
    </form>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto rounded-xl bg-white p-10">
        <h3 className="font-bold text-lg">Welcome</h3>
        <p className="mb-12">Log in with your Alternative ID</p>
        <LoginForm />
      </div>
    </div>
  );
}
