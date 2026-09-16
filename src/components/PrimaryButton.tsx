import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function PrimaryButton({ children, className = "", ...props }: Props) {
  return (
    <button className={`primary-button ${className}`} {...props}>
      {children}
    </button>
  );
}
