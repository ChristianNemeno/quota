import Link from "next/link";

type Props = {
  name: string;
  active?: boolean;
  href?: string;
};

export default function TagBadge({ name, active = false, href }: Props) {
  return (
    <Link
      href={href ?? `/tags/${name}`}
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-neutral-800 text-white dark:bg-white dark:text-neutral-900"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      }`}
    >
      {name}
    </Link>
  );
}
