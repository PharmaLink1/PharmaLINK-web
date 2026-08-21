// Temporary placeholder home. The real Upwork-style welcome page is built in T6.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="rounded-full bg-primary-subtle px-3 py-1 text-sm font-medium text-primary-hover">
        PharmaLink
      </span>
      <h1 className="text-3xl font-semibold tracking-tight">
        Frontend foundation ready
      </h1>
      <p className="text-muted-foreground">
        Design tokens, layout, and tooling are in place. Auth and the welcome
        page are built in the following tasks.
      </p>
    </main>
  );
}
