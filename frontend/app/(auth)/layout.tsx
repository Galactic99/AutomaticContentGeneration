export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-slate-950">
      {/* This layout is intentionally minimal. 
          It ensures the login/signup pages don't inherit 
          the sidebar from the (dashboard) group.
      */}
      {children}
    </section>
  );
}