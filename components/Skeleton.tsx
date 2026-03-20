export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`from-blush-100 via-blush-200 to-blush-100 animate-pulse rounded-md bg-gradient-to-r bg-[length:200%_100%] ${className}`}
      {...props}
    />
  )
}
