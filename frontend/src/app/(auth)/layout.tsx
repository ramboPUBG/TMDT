export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">SachCu</h1>
          <p className="text-muted-foreground mt-2">Nền tảng mua bán sách cũ vì một trái đất xanh hơn</p>
        </div>
        {children}
      </div>
    </div>
  );
}
