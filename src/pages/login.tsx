import Image from "next/legacy/image";
import bannerImage from "public/images/Euricom Edited Low Res.jpg";
import logo from "public/images/Euricom Logo.png";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";

export default function Login() {
  return (
    <div className="flex w-screen h-screen">
      <div className="flex-1 overflow-hidden relative">
        <Image
          src={bannerImage}
          alt="bannerImage sales dashboard"
          objectFit="cover"
          layout="fill"
          priority={true}
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-white">
        <Image
          src={logo}
          alt="logo sales dashboard"
          priority={true}
          layout="fixed"
          width={160}
          height={30}
        />
        <SignInButton />
      </div>
    </div>
  );
}

const SignInButton = () => {
  return (
    <Button
      variant={"login"}
      size={"login"}
      onClick={() => void signIn("teamleader")}
      className="gap-2"
    >
      <Image
        src="/images/teamleader-logo.svg"
        alt="Teamleader logo"
        width={24}
        height={24}
      />
      SIGN IN WITH TEAMLEADER
    </Button>
  );
};
