export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
        <p>
          Sigmar &mdash; Cross-platform prediction market analytics.
          Data from Polymarket, Kalshi, Manifold, and Opinion.
        </p>
        <p className="mt-1">
          Not financial advice. Markets may have different rules and settlement criteria.
        </p>
      </div>
    </footer>
  );
}
