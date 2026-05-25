import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function SellerGuidePage() {
  return (
    <StaticInfoPage title="Hướng dẫn bán hàng">
      <ol className="list-decimal pl-5 space-y-2">
        <li>Đăng nhập và chọn Đăng bán sách.</li>
        <li>Điền thông tin sách, giá và tải ảnh minh họa.</li>
        <li>Chờ duyệt tin (nếu có) và phản hồi người mua.</li>
        <li>Đóng gói và giao hàng theo đơn đặt.</li>
      </ol>
    </StaticInfoPage>
  );
}
