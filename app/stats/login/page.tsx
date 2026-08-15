import Link from "next/link";

export default async function StatsLoginPage(props: PageProps<"/stats/login">) {
  const { error } = await props.searchParams;

  return (
    <div className="app-shell stats-page">
      <header className="site-header">
        <Link href="/" className="brand" style={{ textDecoration: "none" }}>
          <span className="brand-title">Tangled Up In Who?</span>
          <span className="brand-sub">Stats</span>
        </Link>
      </header>

      <main className="start-screen">
        <h2 className="poster-heading">This Page Is Private</h2>
        <form action="/api/stats/login" method="POST" className="initials-form">
          <label className="typewriter" htmlFor="password" style={{ fontSize: "0.85rem" }}>
            Enter the password to view stats
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="login-input"
            autoComplete="current-password"
            autoFocus
          />
          {error && (
            <p className="typewriter" style={{ color: "var(--wrong-bright)", fontSize: "0.8rem" }}>
              Wrong password.
            </p>
          )}
          <button type="submit" className="btn btn-primary">
            Enter
          </button>
        </form>
      </main>
    </div>
  );
}
