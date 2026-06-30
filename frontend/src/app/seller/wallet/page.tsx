"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Wallet, Landmark, ArrowDownCircle, History, AlertCircle } from "lucide-react";

interface Withdrawal {
  _id: string;
  amount: number;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface WalletData {
  balance: number;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Đã duyệt", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Từ chối", className: "bg-red-50 text-red-700 border-red-200" },
};

export default function SellerWalletPage() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Form states
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, withdrawalsRes] = await Promise.all([
        api.get("/wallets/my") as Promise<{ data: WalletData }>,
        api.get("/withdrawals/my") as Promise<{ data: Withdrawal[] }>,
      ]);
      setBalance(walletRes.data.balance || 0);
      setWithdrawals(withdrawalsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu ví");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Pre-fill bank details from user profile
    if (user?.sellerProfile) {
      setBankName(user.sellerProfile.bankAccount?.bankName || "");
      setAccountNumber(user.sellerProfile.bankAccount?.accountNumber || "");
      setAccountHolder(user.sellerProfile.bankAccount?.accountHolder || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError("Số tiền rút không hợp lệ");
      return;
    }

    if (withdrawAmount < 50000) {
      setError("Số tiền rút tối thiểu là 50,000đ");
      return;
    }

    if (withdrawAmount > balance) {
      setError("Số dư ví không đủ");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const res = await api.post("/withdrawals", {
        amount: withdrawAmount,
        bankName,
        accountNumber,
        accountHolder,
      }) as any;

      setMessage(res.message || "Gửi yêu cầu rút tiền thành công!");
      setAmount("");
      
      // Reload balance and withdrawal requests
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể gửi yêu cầu rút tiền");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && withdrawals.length === 0) {
    return <div className="p-8 text-muted-foreground">Đang tải thông tin ví...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ví & Rút tiền</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi số dư thu nhập của shop và gửi yêu cầu rút tiền về tài khoản ngân hàng.
        </p>
      </div>

      {/* Messages */}
      {(message || error) && (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary to-primary-foreground text-white p-6 rounded-3xl shadow-lg border border-primary/20 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/80 font-medium">Số dư khả dụng</p>
              <h2 className="text-3xl font-extrabold mt-1">{formatPrice(balance)}</h2>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <Wallet size={24} />
            </div>
          </div>
          <div className="text-xs text-white/70 flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl w-fit">
            <AlertCircle size={14} />
            Tiền được cộng khi đơn hàng chuyển sang trạng thái "Đã giao"
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
            <Landmark className="text-primary" size={20} />
            <h3 className="text-lg font-bold text-foreground">Yêu cầu rút tiền</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Số tiền rút (đ)
                </label>
                <Input
                  type="number"
                  placeholder="Ví dụ: 100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={50000}
                  required
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">Tối thiểu 50,000đ</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tên ngân hàng
                </label>
                <Input
                  type="text"
                  placeholder="Ví dụ: Vietcombank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Số tài khoản nhận
                </label>
                <Input
                  type="text"
                  placeholder="Nhập số tài khoản"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tên chủ tài khoản (không dấu)
                </label>
                <Input
                  type="text"
                  placeholder="NGUYEN VAN A"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={submitting || balance < 50000}>
                <ArrowDownCircle size={16} className="mr-2" />
                {submitting ? "Đang xử lý..." : "Gửi yêu cầu rút tiền"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <History className="text-primary" size={20} />
          <h3 className="text-lg font-bold text-foreground">Lịch sử rút tiền</h3>
        </div>

        <div className="overflow-x-auto">
          {withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có yêu cầu rút tiền nào.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Ngân hàng</th>
                  <th className="py-3 px-4">Số tài khoản</th>
                  <th className="py-3 px-4">Người nhận</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {withdrawals.map((w) => {
                  const status = statusLabels[w.status] || { label: w.status, className: "bg-gray-50 text-gray-700" };
                  return (
                    <tr key={w._id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(w.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {formatPrice(w.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-medium">{w.bankInfo.bankName}</td>
                      <td className="py-3.5 px-4 font-mono">{w.bankInfo.accountNumber}</td>
                      <td className="py-3.5 px-4">{w.bankInfo.accountHolder}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
