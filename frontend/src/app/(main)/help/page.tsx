import Link from "next/link";
import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function HelpPage() {
  return (
    <StaticInfoPage title="Trung tâm trợ giúp">
      <p>Liên hệ hỗ trợ qua email hotro@sachcu.vn hoặc xem các hướng dẫn:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <Link href="/guide/buyer" className="text-primary hover:underline">
            Hướng dẫn mua hàng
          </Link>
        </li>
        <li>
          <Link href="/guide/seller" className="text-primary hover:underline">
            Hướng dẫn bán hàng
          </Link>
        </li>
      </ul>
    </StaticInfoPage>
  );
}
