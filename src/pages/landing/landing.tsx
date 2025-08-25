import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus } from "lucide-react";
import { useCallback, useState } from "react";

function CustomerSelectCard({
  title,
  icon,
  iconBgColor,
  text,
  onClick,
  selected,
}: {
  title: string;
  icon: React.ReactNode;
  iconBgColor: string;
  buttonText: string;
  text: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <Card
      className={`w-full text-left ${
        selected ? "border-blue-600 border-2" : "border-neutral-200"
      }  rounded-4xl shadow-none`}
      onClick={onClick}
    >
      <CardHeader>
        <div className={`${iconBgColor} rounded-full w-12 h-12`}>{icon}</div>
        <CardTitle className="text-3xl font-bold max-w-[80%] pb-2 pt-8">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{text}</p>
      </CardContent>
    </Card>
  );
}

function Landing() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = useCallback(
    (type: string) => {
      return setSelectedOption(selectedOption === type ? "" : type);
    },
    [selectedOption]
  );

  return (
    <div className="flex flex-col items-center h-screen py-10">
      <div className="bg-white w-[80%] p-6 rounded-xl text-center min-h-[50vh]">
        <p className="text-2xl font-bold py-2">Customer Instruction Portal</p>
        <p className="text-base text-[#9CA3AF] pb-12">
          Submit your transaction instructions quickly and securely,
          <br /> to be treated by a teller.
        </p>
        <div className="flex gap-6 w-full">
          <CustomerSelectCard
            buttonText="Continue as Customer"
            title="Customer"
            iconBgColor="bg-[#D0E2FB]"
            icon={<User className={`text-[#0066FF] w-6 h-6 m-3`} />}
            text="Submit transaction instructions for your account"
            selected={selectedOption === "customer"}
            onClick={() => handleSelect("customer")}
          />
          <CustomerSelectCard
            buttonText="Continue as Guest"
            title="Third Party"
            iconBgColor="bg-[#FFF1FF]"
            icon={<UserPlus className={`text-[#8F33A8] w-6 h-6 m-3`} />}
            text="Submit transaction instructions on behalf of a customer"
            onClick={() => handleSelect("guest")}
            selected={selectedOption === "guest"}
          />
        </div>

        <Button
          className="rounded-full y-[22px] mt-4 p-8 bg-[#304DAF] text-white w-[50%] my-12"
          disabled={!selectedOption}
        >
          Proceed
        </Button>
      </div>
    </div>
  );
}

export default Landing;
