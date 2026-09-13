/** Groups the 3 sections of the Pharmacy Staff Registration form (Page 4). */
export function FormSectionHeader({ title }: { title: string }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <h2 className="text-sm font-medium tracking-[0.7px] text-[var(--color-text-primary)] uppercase">{title}</h2>
      <div className="h-px w-full bg-[var(--color-border)]" aria-hidden="true" />
    </div>
  );
}
