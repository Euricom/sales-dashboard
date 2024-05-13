import * as Dialog from "@radix-ui/react-dialog";
import { Bug, X } from "lucide-react";
import { useState } from "react";
import { api } from "~/utils/api";

export function BugReport() {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const mailMutator = api.mailer.sendMail.useMutation();

  const handleBugReport = () => {
    mailMutator.mutate(description, {
      onSuccess: () => setDescription(""),
    });
  };

  return (
    <>
      <Dialog.Root>
        <div className="flex justify-center items-center absolute bottom-6 right-[5.5rem] z-20 p-1.5 border-primary border-2 bg-white cursor-pointer rounded-14 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
          <Dialog.Trigger asChild>
            <Bug size={32} />
          </Dialog.Trigger>
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-20" />
          <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[28.125rem] translate-x-[-50%] translate-y-[-50%] rounded-[0.375rem] bg-white p-[1.563rem] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-20">
            <Dialog.Title className="m-0 text-lg font-medium">
              Bug report
            </Dialog.Title>
            <Dialog.Description className="mt-[0.625rem] mb-5 text-sm] leading-normal">
              Beschrijf hier de bug die je hebt gevonden
            </Dialog.Description>
            <fieldset className="mb-[0.938rem] flex flex-col items-center gap-2 h-32">
              <label className="w-full text-[0.938rem]">Beschrijving</label>
              <textarea
                className="inline-flex w-full flex-1 rounded-[0.25rem] p-2 px-[0.625rem] text-[0.938rem] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                id="username"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </fieldset>
            <div className="mt-[25px] flex justify-end">
              <Dialog.Close asChild>
                <button
                  className="inline-flex border border-1 bg-primary h-[2.188rem] text-white items-center justify-center rounded-[0.25rem] px-[0.938rem] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none"
                  onClick={handleBugReport}
                >
                  Verstuur
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Close asChild>
              <button
                className="absolute top-[0.625rem] right-[0.625rem] inline-flex h-[1.563rem] w-[1.563rem] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
