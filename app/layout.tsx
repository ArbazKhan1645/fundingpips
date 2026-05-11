// Root layout passes through to [locale]/layout.tsx which owns html+body
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
