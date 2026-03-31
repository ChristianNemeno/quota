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
      className={`vn-cell inline-block px-3 py-1 text-xs font-medium tracking-wide transition-[filter] duration-150 hover:brightness-125 ${
        active ? "brightness-125 ring-1 ring-[#c9a84c]" : "opacity-90"
      }`}
    >
      {name}
    </Link>
  );
}
