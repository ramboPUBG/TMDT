import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface StaticInfoPageProps {
  title: string;
  children: React.ReactNode;
}

export function StaticInfoPage({ title, children }: StaticInfoPageProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">{title}</h1>
      <div className="prose prose-neutral text-muted-foreground space-y-4 leading-relaxed">
        {children}
      </div>
      <div className="mt-10">
        <Link href="/">
          <Button variant="outline">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
