import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function BuyerGuidePage() {
  return (
    <StaticInfoPage title="Hướng dẫn mua hàng">
      <ol className="list-decimal pl-5 space-y-2">
        <li>Đăng ký hoặc đăng nhập tài khoản SachCu.</li>
        <li>Tìm sách theo danh mục hoặc trang Sách.</li>
        <li>Thêm vào giỏ hàng và tiến hành thanh toán (COD hoặc chuyển khoản).</li>
        <li>Theo dõi đơn hàng tại mục Đơn hàng của tôi.</li>
      </ol>
    </StaticInfoPage>
  );
}
