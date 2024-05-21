import { Ban, Check } from "lucide-react";
import { Toast, ToastProvider, ToastViewport } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        if (description) {
          return (
            <Toast key={id} {...props}>
              <div className="gap-2 flex">
                {title === "success" ? <Check /> : <Ban />}
                {description}
              </div>
            </Toast>
          );
        }
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title === "success" ? <Check /> : <Ban />}
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
