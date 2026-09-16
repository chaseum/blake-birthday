import type { PropsWithChildren, ReactNode } from "react";

type SceneProps = PropsWithChildren<{
  eyebrow?: ReactNode;
  className?: string;
}>;

export function Scene({ eyebrow, className = "", children }: SceneProps) {
  return (
    <main className={`scene ${className}`}>
      <div className="scene__noise" aria-hidden="true" />
      <section className="scene__content">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        {children}
      </section>
    </main>
  );
}
