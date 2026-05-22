import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-primary mb-4">SachCu</h3>
          <p className="text-sm text-muted-foreground">
            Nền tảng mua bán sách cũ an toàn, tiện lợi vì một trái đất xanh hơn.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Về SachCu</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">Giới thiệu</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Điều khoản sử dụng</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">Chính sách bảo mật</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/help" className="hover:text-primary">Trung tâm trợ giúp</Link></li>
            <li><Link href="/guide/buyer" className="hover:text-primary">Hướng dẫn mua hàng</Link></li>
            <li><Link href="/guide/seller" className="hover:text-primary">Hướng dẫn bán hàng</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Liên hệ</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Email: hotro@sachcu.vn</li>
            <li>Hotline: 1900 xxxx</li>
            <li>Địa chỉ: TP.HCM, Việt Nam</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} SachCu. All rights reserved.
      </div>
    </footer>
  );
}
