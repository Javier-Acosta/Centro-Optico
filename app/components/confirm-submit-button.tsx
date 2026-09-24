'use client';

import { useFormStatus } from "react-dom";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  confirmMessage?: string;
  pendingText?: string;
  className: string;
};

export function ConfirmSubmitButton({ children, confirmMessage, pendingText, className }: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!confirmMessage) return;
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) event.preventDefault();
      }}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
