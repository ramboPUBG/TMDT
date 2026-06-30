"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Landmark, Check, X, ShieldCheck, History } from "lucide-react";

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
  sellerId?: {
    fullName?: string;
    email?: string;
  };
}

const statusLabels: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Đã duyệt", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Từ chối", className: "bg-red-50 text-red-700 border-red-200" },
};

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/withdrawals/admin") as { data: Withdrawal[] };
      setRequests(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải danh sách rút tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    const actionLabel = status === "APPROVED" ? "phê duyệt" : "từ chối";
    if (!confirm(`Bạn có chắc chắn muốn ${actionLabel} yêu cầu rút tiền này?`)) {
      return;
    }

    try {
      setActioningId(id);
      setError("");
      setMessage("");

      const res = await api.patch(`/withdrawals/admin/${id}`, { status }) as any;
      setMessage(res.message || "Cập nhật trạng thái thành công!");
      
      // Refresh requests list
      await fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setActioningId(null);
    }
  };

  if (loading && requests.length === 0) {
    return <div className="p-8 text-muted-foreground">Đang tải danh sách rút tiền...</div>;
  }

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const historyRequests = requests.filter(r => r.status !== "PENDING");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Phê duyệt rút tiền</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem xét và duyệt các yêu cầu rút tiền từ tài khoản người bán trên sàn SachCu.
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

      {/* Pending Requests */}
      <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <ShieldCheck className="text-primary" size={20} />
          <h3 className="text-lg font-bold text-foreground">Yêu cầu đang chờ duyệt ({pendingRequests.length})</h3>
        </div>

        <div className="overflow-x-auto">
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Không có yêu cầu nào đang chờ xử lý.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                  <th className="py-3 px-4">Người bán (Shop)</th>
                  <th className="py-3 px-4">Số tiền rút</th>
                  <th className="py-3 px-4">Thông tin ngân hàng</th>
                  <th className="py-3 px-4">Thời gian tạo</th>
                  <th className="py-3 px-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingRequests.map((r) => (
                  <tr key={r._id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-foreground">{r.sellerId?.fullName || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{r.sellerId?.email || ""}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-primary">
                      {formatPrice(r.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-sm flex items-center gap-1.5">
                        <Landmark size={14} className="text-muted-foreground" />
                        {r.bankInfo.bankName}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        STK: {r.bankInfo.accountNumber} — Tên: {r.bankInfo.accountHolder}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-xs">
                      {new Date(r.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          disabled={actioningId === r._id}
                          onClick={() => handleUpdateStatus(r._id, "APPROVED")}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs h-8"
                        >
                          <Check size={14} className="mr-1" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actioningId === r._id}
                          onClick={() => handleUpdateStatus(r._id, "REJECTED")}
                          className="border-red-200 text-red-600 hover:bg-red-50 font-medium text-xs h-8"
                        >
                          <X size={14} className="mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* History Requests */}
      <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <History className="text-primary" size={20} />
          <h3 className="text-lg font-bold text-foreground">Lịch sử xử lý</h3>
        </div>

        <div className="overflow-x-auto">
          {historyRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có lịch sử xử lý rút tiền.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                  <th className="py-3 px-4">Người bán (Shop)</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Ngân hàng nhận</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {historyRequests.map((r) => {
                  const status = statusLabels[r.status] || { label: r.status, className: "bg-gray-50 text-gray-700" };
                  return (
                    <tr key={r._id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{r.sellerId?.fullName || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">{r.sellerId?.email || ""}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {formatPrice(r.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-sm">{r.bankInfo.bankName}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          STK: {r.bankInfo.accountNumber} — {r.bankInfo.accountHolder}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground text-xs">
                        {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </td>
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
