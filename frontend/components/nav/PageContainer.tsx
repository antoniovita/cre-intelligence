interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Centers page content at the same max width as the floating navbar
 * (`max-w-7xl`), so every screen's content aligns under it.
 */
export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`mx-auto flex w-full max-w-7xl flex-col ${className}`}>
      {children}
    </div>
  );
}
