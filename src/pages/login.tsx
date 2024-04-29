import Image from "next/legacy/image";
import bannerImage from "public/images/Euricom-banner2.jpeg";
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
          className="absolute"
        />
        <span className="absolute left-1/2 top-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 text-center text-3xl text-white bg- bg-success/40 p-3">
          Sales Dashboard
        </span>
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
