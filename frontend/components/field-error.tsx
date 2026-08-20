export function FieldError({
  id,
  children,
}: {
  id?: string;
  children?: string | null;
}) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="text-sm text-danger">
      {children}
    </p>
  );
}
