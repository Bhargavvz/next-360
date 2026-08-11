export default function VerifyProductPage({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-xl border bg-card p-8 text-center">
        <span className="text-5xl mb-4 block">🔍</span>
        <h1 className="text-2xl font-bold mb-2">Product Verification</h1>
        <p className="text-muted-foreground mb-6">
          QR verification page will show product certification status, seller verification, and trust information.
        </p>
        <p className="text-sm text-muted-foreground">
          Coming in Phase 11.
        </p>
      </div>
    </div>
  );
}
