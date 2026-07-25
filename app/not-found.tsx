import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <p className="text-white/60">页面未找到</p>
      <Link href="/" className="text-sm text-[var(--cloud)] hover:underline">
        返回世界地图
      </Link>
    </div>
  );
}
