import type React from "react";

// Plain <a> stub for next/link used inside web component builds.
// The real next/link is only needed in the Next.js app context.
type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: React.ReactNode;
};

export default function Link({ href, children, ...props }: LinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
