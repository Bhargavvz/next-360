export default function SellerDashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Manage your products, orders, and earnings.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Sales', value: '₹0', icon: '💰' },
            { label: 'Orders', value: '0', icon: '📦' },
            { label: 'Products', value: '0', icon: '🏷️' },
            { label: 'Pending Payouts', value: '₹0', icon: '🏦' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-xl border bg-card p-8 text-center text-muted-foreground">
          <p>Full seller dashboard coming in Phase 4.</p>
        </div>
      </div>
    </div>
  );
}
