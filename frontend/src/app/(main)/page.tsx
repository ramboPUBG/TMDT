import Link from "next/link";
import { BookCard } from "@/components/ui/BookCard";

// Mock data for UI layout
const mockCategories = [
  { id: 1, name: "Văn học", icon: "📚", count: 1250 },
  { id: 2, name: "Kinh tế", icon: "📈", count: 840 },
  { id: 3, name: "Tâm lý - Kỹ năng", icon: "🧠", count: 920 },
  { id: 4, name: "Nuôi dạy con", icon: "👶", count: 450 },
  { id: 5, name: "Sách thiếu nhi", icon: "🎨", count: 1560 },
  { id: 6, name: "Lịch sử", icon: "🏛️", count: 320 },
  { id: 7, name: "Ngoại ngữ", icon: "🌐", count: 780 },
  { id: 8, name: "Truyện tranh", icon: "🦸", count: 2100 },
];

const mockBooks = [
  {
    id: "1",
    title: "Nhà Lãnh Đạo Không Chức Danh",
    author: "Robin Sharma",
    price: 45000,
    originalPrice: 90000,
    condition: "good",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80",
    sellerName: "Tiệm sách cũ Cô Ba",
  },
  {
    id: "2",
    title: "Sapiens: Lược sử loài người",
    author: "Yuval Noah Harari",
    price: 120000,
    originalPrice: 195000,
    condition: "like_new",
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80",
    sellerName: "Mọt Sách SG",
  },
  {
    id: "3",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    price: 35000,
    originalPrice: 86000,
    condition: "fair",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
    sellerName: "Sách Cũ Giá Rẻ",
  },
  {
    id: "4",
    title: "Harry Potter và Hòn Đá Phù Thủy",
    author: "J.K. Rowling",
    price: 60000,
    originalPrice: 130000,
    condition: "good",
    imageUrl: "https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=500&q=80",
    sellerName: "Hogwarts Library",
  },
  {
    id: "5",
    title: "Tâm Lý Học Tội Phạm",
    author: "T Stanton Samenow",
    price: 85000,
    originalPrice: 145000,
    condition: "like_new",
    imageUrl: "https://images.unsplash.com/photo-1587876878363-22879586146c?w=500&q=80",
    sellerName: "Read And Share",
  },
  {
    id: "6",
    title: "Muôn Kiếp Nhân Sinh",
    author: "Nguyên Phong",
    price: 95000,
    originalPrice: 168000,
    condition: "good",
    imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80",
    sellerName: "An Yên Books",
  },
];

export default function HomePage() {
  return (
    <div className="bg-background pb-16">
      {/* Hero Banner Area */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Cộng đồng yêu sách cũ
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Trao đổi tri thức, <br />
              <span className="text-primary">Gìn giữ tương lai</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Nền tảng mua bán sách cũ an toàn, tiện lợi với hàng ngàn đầu sách. Cùng nhau chia sẻ tri thức, bảo vệ môi trường!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/books" className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5">
                Mua sách ngay
              </Link>
              <Link href="/product/upload" className="bg-white text-foreground border border-border px-8 py-3 rounded-full font-medium hover:bg-muted transition-all">
                Đăng bán sách
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">🌱</div>
                <span>Giảm rác thải</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">🛡️</div>
                <span>100% An toàn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">💰</div>
                <span>Tiết kiệm 50%</span>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center lg:justify-end relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10"></div>
            <div className="relative w-full max-w-md aspect-square bg-white rounded-3xl p-6 shadow-2xl shadow-black/5 rotate-3 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80" 
                alt="Sách cũ" 
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4">
                <div className="text-4xl">📘</div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Sách mới đăng</p>
                  <p className="font-bold text-foreground">+120 cuốn hôm nay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16">
        {/* Categories Section */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Khám phá theo danh mục</h2>
              <p className="text-muted-foreground">Tìm cuốn sách yêu thích của bạn theo thể loại</p>
            </div>
            <Link href="/categories" className="text-primary font-medium hover:underline hidden sm:block">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {mockCategories.map((cat) => (
              <Link href={`/books?category=${cat.id}`} key={cat.id} className="group bg-white p-6 rounded-2xl border border-border text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14 bg-muted group-hover:bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl transition-colors">
                  {cat.icon}
                </div>
                <h3 className="font-medium text-sm text-foreground mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">{cat.count} sách</p>
              </Link>
            ))}
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Sách vừa đăng bán</h2>
              <p className="text-muted-foreground">Những cuốn sách mới nhất vừa được cộng đồng chia sẻ</p>
            </div>
            <Link href="/books?sort=newest" className="text-primary font-medium hover:underline hidden sm:block">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
            {mockBooks.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/books?sort=newest" className="inline-block px-6 py-2 border border-primary text-primary rounded-full font-medium">
              Xem tất cả sách mới
            </Link>
          </div>
        </section>

        {/* Bestsellers/Featured Section */}
        <section className="mb-16 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-3xl p-8 border border-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Sách Kinh Tế - Kỹ Năng Đáng Đọc</h2>
              <p className="text-muted-foreground">Top những tựa sách phát triển bản thân bán chạy nhất</p>
            </div>
            <Link href="/books?category=2" className="text-primary font-medium hover:underline hidden sm:block">
              Khám phá thêm
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
            {mockBooks.slice(0, 5).map((book) => (
              <BookCard key={`featured-${book.id}`} {...book} />
            ))}
            
            {/* View More Card */}
            <Link href="/books?category=2" className="group bg-white rounded-xl border border-border hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center p-6 h-full min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                →
              </div>
              <h3 className="font-semibold text-foreground text-center">Xem thêm <br/> 100+ tựa sách khác</h3>
            </Link>
          </div>
        </section>

        {/* Why choose us */}
        <section className="py-12 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🌳
              </div>
              <h3 className="text-xl font-bold mb-3">Bảo vệ môi trường</h3>
              <p className="text-muted-foreground">Mỗi cuốn sách cũ được mua lại là một đóng góp thiết thực cho việc giảm phát thải CO2.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🛡️
              </div>
              <h3 className="text-xl font-bold mb-3">Thanh toán an toàn</h3>
              <p className="text-muted-foreground">Tiền của bạn được giữ an toàn bởi hệ thống, chỉ thanh toán cho người bán khi bạn đã nhận và hài lòng với sách.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🤝
              </div>
              <h3 className="text-xl font-bold mb-3">Cộng đồng uy tín</h3>
              <p className="text-muted-foreground">Hàng ngàn người bán đã được xác thực, hệ thống đánh giá minh bạch giúp bạn hoàn toàn an tâm.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
