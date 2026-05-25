"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  KeyRound,
  MapPin,
  Package,
  Save,
  Store,
  Trash2,
  UserRound,
} from "lucide-react";
import api from "@/services/api";
import { useAuthStore, User } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

type AddressForm = Omit<Address, "_id">;

const emptyAddress: AddressForm = {
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  streetAddress: "",
  isDefault: false,
};

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated, user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    avatar: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [sellerForm, setSellerForm] = useState({
    shopName: "",
    description: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const isSeller = user?.role === "seller" || user?.role === "admin";

  const accountStatus = useMemo(() => {
    if (!user) return "";
    if (user.status === "active") return "Đang hoạt động";
    if (user.status === "pending") return "Chờ duyệt";
    if (user.status === "locked") return "Đã khóa";
    return user.status;
  }, [user]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?redirect=/profile");
      return;
    }

    const fetchAccount = async () => {
      try {
        setLoading(true);
        const [meRes, addressRes] = await Promise.all([
          api.get("/users/me") as Promise<ApiResponse<User>>,
          api.get("/users/me/addresses") as Promise<ApiResponse<Address[]>>,
        ]);
        const nextUser = meRes.data;
        updateUser(nextUser);
        setProfileForm({
          fullName: nextUser.fullName || "",
          phone: nextUser.phone || "",
          avatar: nextUser.avatar || "",
        });
        setSellerForm({
          shopName: nextUser.sellerProfile?.shopName || "",
          description: nextUser.sellerProfile?.description || "",
          bankName: nextUser.sellerProfile?.bankAccount?.bankName || "",
          accountNumber: nextUser.sellerProfile?.bankAccount?.accountNumber || "",
          accountHolder: nextUser.sellerProfile?.bankAccount?.accountHolder || "",
        });
        setAddresses(addressRes.data || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Không tải được thông tin tài khoản"));
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [hasHydrated, isAuthenticated, router, updateUser]);

  const notify = (text: string) => {
    setMessage(text);
    setError("");
  };

  const fail = (err: unknown, fallback: string) => {
    setError(getErrorMessage(err, fallback));
    setMessage("");
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving("profile");
      const res = (await api.patch("/users/me", profileForm)) as ApiResponse<User>;
      updateUser(res.data);
      notify(res.message || "Đã cập nhật thông tin cá nhân");
    } catch (err: unknown) {
      fail(err, "Không cập nhật được thông tin cá nhân");
    } finally {
      setSaving("");
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setMessage("");
      return;
    }

    try {
      setSaving("password");
      const res = (await api.patch("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })) as ApiResponse<null>;
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      notify(res.message || "Đã đổi mật khẩu");
    } catch (err: unknown) {
      fail(err, "Không đổi được mật khẩu");
    } finally {
      setSaving("");
    }
  };

  const saveSeller = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      shopName: sellerForm.shopName,
      description: sellerForm.description,
      bankAccount: {
        bankName: sellerForm.bankName,
        accountNumber: sellerForm.accountNumber,
        accountHolder: sellerForm.accountHolder,
      },
    };

    try {
      setSaving("seller");
      const res = isSeller
        ? ((await api.patch("/users/me/seller-profile", payload)) as ApiResponse<User>)
        : ((await api.post("/users/upgrade-to-seller", {
            shopName: sellerForm.shopName,
            description: sellerForm.description,
          })) as ApiResponse<User>);
      updateUser(res.data);
      notify(res.message || "Đã cập nhật hồ sơ bán hàng");
    } catch (err: unknown) {
      fail(err, "Không cập nhật được hồ sơ bán hàng");
    } finally {
      setSaving("");
    }
  };

  const saveAddress = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving("address");
      const res = editingAddressId
        ? ((await api.patch(
            `/users/me/addresses/${editingAddressId}`,
            addressForm
          )) as ApiResponse<Address>)
        : ((await api.post("/users/me/addresses", addressForm)) as ApiResponse<Address>);

      setAddresses((current) => {
        const updated = editingAddressId
          ? current.map((item) => (item._id === editingAddressId ? res.data : item))
          : [res.data, ...current];
        return res.data.isDefault
          ? updated.map((item) => ({ ...item, isDefault: item._id === res.data._id }))
          : updated;
      });
      setAddressForm(emptyAddress);
      setEditingAddressId(null);
      notify(res.message || "Đã lưu địa chỉ");
    } catch (err: unknown) {
      fail(err, "Không lưu được địa chỉ");
    } finally {
      setSaving("");
    }
  };

  const editAddress = (address: Address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      streetAddress: address.streetAddress,
      isDefault: address.isDefault,
    });
  };

  const deleteAddress = async (addressId: string) => {
    try {
      setSaving(addressId);
      const res = (await api.delete(`/users/me/addresses/${addressId}`)) as ApiResponse<null>;
      setAddresses((current) => current.filter((item) => item._id !== addressId));
      if (editingAddressId === addressId) {
        setEditingAddressId(null);
        setAddressForm(emptyAddress);
      }
      notify(res.message || "Đã xóa địa chỉ");
    } catch (err: unknown) {
      fail(err, "Không xóa được địa chỉ");
    } finally {
      setSaving("");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <p className="text-muted-foreground">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lí tài khoản</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cập nhật hồ sơ khách hàng, địa chỉ nhận hàng và thông tin bán sách.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/profile/orders">
            <Button variant="outline">
              <Package size={16} className="mr-2" />
              Đơn mua
            </Button>
          </Link>
          {isSeller && (
            <Link href="/product/upload">
              <Button>
                <Store size={16} className="mr-2" />
                Đăng bán sách
              </Button>
            </Link>
          )}
        </div>
      </div>

      {(message || error) && (
        <div
          className={`mb-6 rounded-md border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-md border border-border bg-white p-6">
            <SectionTitle
              icon={<UserRound size={18} />}
              title="Thông tin cá nhân"
              description="Thông tin dùng cho đặt hàng, liên hệ và hiển thị trên hệ thống."
            />
            <form onSubmit={saveProfile} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Họ tên</label>
                <Input
                  value={profileForm.fullName}
                  onChange={(e) =>
                    setProfileForm((current) => ({ ...current, fullName: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((current) => ({ ...current, phone: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Ảnh đại diện URL</label>
                <Input
                  value={profileForm.avatar}
                  onChange={(e) =>
                    setProfileForm((current) => ({ ...current, avatar: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving === "profile"}>
                  <Save size={16} className="mr-2" />
                  {saving === "profile" ? "Đang lưu..." : "Lưu thông tin"}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-md border border-border bg-white p-6">
            <SectionTitle
              icon={<MapPin size={18} />}
              title="Địa chỉ nhận hàng"
              description="Khách hàng dùng để đặt hàng, seller cũng dùng làm địa chỉ liên hệ."
            />

            <form onSubmit={saveAddress} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Người nhận</label>
                <Input
                  value={addressForm.fullName}
                  onChange={(e) =>
                    setAddressForm((current) => ({ ...current, fullName: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
                <Input
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm((current) => ({ ...current, phone: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tỉnh/Thành</label>
                <Input
                  value={addressForm.province}
                  onChange={(e) =>
                    setAddressForm((current) => ({ ...current, province: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Quận/Huyện</label>
                <Input
                  value={addressForm.district}
                  onChange={(e) =>
                    setAddressForm((current) => ({ ...current, district: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phường/Xã</label>
                <Input
                  value={addressForm.ward}
                  onChange={(e) =>
                    setAddressForm((current) => ({ ...current, ward: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Địa chỉ cụ thể</label>
                <Input
                  value={addressForm.streetAddress}
                  onChange={(e) =>
                    setAddressForm((current) => ({
                      ...current,
                      streetAddress: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm((current) => ({
                      ...current,
                      isDefault: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-primary"
                />
                Đặt làm địa chỉ mặc định
              </label>
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button type="submit" disabled={saving === "address"}>
                  <Save size={16} className="mr-2" />
                  {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
                </Button>
                {editingAddressId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddressForm(emptyAddress);
                    }}
                  >
                    Hủy sửa
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 grid gap-3">
              {addresses.length === 0 && (
                <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Chưa có địa chỉ nào.
                </p>
              )}
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="flex flex-col justify-between gap-3 rounded-md border border-border p-4 md:flex-row md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{address.fullName}</p>
                      <span className="text-sm text-muted-foreground">{address.phone}</span>
                      {address.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {address.streetAddress}, {address.ward}, {address.district},{" "}
                      {address.province}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => editAddress(address)}>
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAddress(address._id)}
                      disabled={saving === address._id}
                      aria-label="Xóa địa chỉ"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-border bg-white p-6">
            <SectionTitle
              icon={<Store size={18} />}
              title={isSeller ? "Hồ sơ người bán" : "Mở tài khoản người bán"}
              description="Thông tin shop hiển thị với người mua và phục vụ đối soát thanh toán."
            />
            <form onSubmit={saveSeller} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Tên shop</label>
                <Input
                  value={sellerForm.shopName}
                  onChange={(e) =>
                    setSellerForm((current) => ({ ...current, shopName: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Chủ tài khoản</label>
                <Input
                  value={sellerForm.accountHolder}
                  onChange={(e) =>
                    setSellerForm((current) => ({
                      ...current,
                      accountHolder: e.target.value,
                    }))
                  }
                  disabled={!isSeller}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Mô tả shop</label>
                <textarea
                  value={sellerForm.description}
                  onChange={(e) =>
                    setSellerForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-24 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Ngân hàng</label>
                <Input
                  value={sellerForm.bankName}
                  onChange={(e) =>
                    setSellerForm((current) => ({ ...current, bankName: e.target.value }))
                  }
                  disabled={!isSeller}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Số tài khoản</label>
                <Input
                  value={sellerForm.accountNumber}
                  onChange={(e) =>
                    setSellerForm((current) => ({
                      ...current,
                      accountNumber: e.target.value,
                    }))
                  }
                  disabled={!isSeller}
                />
              </div>
              {!isSeller && (
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground md:col-span-2">
                  Sau khi mở tài khoản người bán, bạn có thể bổ sung thông tin ngân hàng.
                </p>
              )}
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving === "seller"}>
                  <Store size={16} className="mr-2" />
                  {saving === "seller"
                    ? "Đang lưu..."
                    : isSeller
                      ? "Lưu hồ sơ người bán"
                      : "Mở tài khoản người bán"}
                </Button>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-md border border-border bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{user?.fullName}</p>
                <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vai trò</span>
                <span className="font-medium">{isSeller ? "Người bán" : "Khách hàng"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                <span className="font-medium">{accountStatus}</span>
              </div>
              {isSeller && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Xác minh shop</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <BadgeCheck size={15} className="text-primary" />
                    {user?.sellerProfile?.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-md border border-border bg-white p-6">
            <SectionTitle
              icon={<KeyRound size={18} />}
              title="Mật khẩu"
              description="Đổi mật khẩu đăng nhập hiện tại."
            />
            <form onSubmit={changePassword} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Mật khẩu hiện tại</label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Mật khẩu mới</label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: e.target.value,
                    }))
                  }
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Xác nhận mật khẩu</label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: e.target.value,
                    }))
                  }
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving === "password"}>
                {saving === "password" ? "Đang đổi..." : "Đổi mật khẩu"}
              </Button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
