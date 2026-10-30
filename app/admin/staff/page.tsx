"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  Check,
  X,
  Loader2,
  Lock,
  UserCheck,
  UserX,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";

interface StaffUser {
  id: string;
  name: string;
  phone: string;
  role: "ADMIN" | "OWNER" | "CASHIER" | "KITCHEN";
  pin: string;
  password?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPins, setShowPins] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Add Staff Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "OWNER" | "CASHIER" | "KITCHEN">("CASHIER");
  const [newPin, setNewPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  // Change PIN Modal
  const [pinModalUser, setPinModalUser] = useState<StaffUser | null>(null);
  const [targetPin, setTargetPin] = useState("");
  const [updatingPin, setUpdatingPin] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.success && data.staff) {
        setStaffList(data.staff);
      }
    } catch (err) {
      console.error("Failed to fetch staff", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Toggle Staff Active Status
  const handleToggleStatus = async (user: StaffUser) => {
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleStatus",
          id: user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === user.id ? { ...s, isActive: !s.isActive } : s))
        );
        showToast(
          user.isActive
            ? `Account for ${user.name} deactivated.`
            : `Account for ${user.name} activated!`
        );
      } else {
        alert(data.message || "Failed to update staff status");
      }
    } catch {
      alert("Network error updating staff");
    }
  };

  // Delete Staff
  const handleDeleteStaff = async (user: StaffUser) => {
    if (user.role === "ADMIN" && staffList.filter((s) => s.role === "ADMIN").length <= 1) {
      alert("Cannot delete the only Administrator account.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete staff account for ${user.name}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          id: user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== user.id));
        showToast(`Staff member ${user.name} removed.`);
      } else {
        alert(data.message || "Failed to delete staff");
      }
    } catch {
      alert("Network error deleting staff");
    }
  };

  // Change PIN Submit
  const handleUpdatePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalUser || targetPin.length < 4) return;
    setUpdatingPin(true);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updatePin",
          id: pinModalUser.id,
          pin: targetPin,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === pinModalUser.id ? { ...s, pin: targetPin } : s))
        );
        showToast(`4-digit PIN for ${pinModalUser.name} updated to [${targetPin}].`);
        setPinModalUser(null);
        setTargetPin("");
      } else {
        alert(data.message || "Failed to update PIN");
      }
    } catch {
      alert("Network error saving PIN");
    } finally {
      setUpdatingPin(false);
    }
  };

  // Create Staff Submit
  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || newPin.length < 4) {
      alert("Please provide staff name, phone, and a 4-digit PIN.");
      return;
    }
    setCreating(true);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newName,
          phone: newPhone,
          role: newRole,
          pin: newPin,
          password: newPassword || "staff123",
        }),
      });

      const data = await res.json();
      if (data.success && data.staff) {
        setStaffList((prev) => [...prev, data.staff]);
        showToast(`New staff profile for ${newName} created!`);
        setShowAddModal(false);
        setNewName("");
        setNewPhone("");
        setNewPin("");
        setNewPassword("");
      } else {
        alert(data.message || "Failed to create staff account");
      }
    } catch {
      alert("Network error creating staff member");
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role: StaffUser["role"]) => {
    switch (role) {
      case "ADMIN":
        return "bg-rimjhimRed/20 text-rimjhimRed border-rimjhimRed/30";
      case "OWNER":
        return "bg-amber/20 text-amber border-amber/30";
      case "CASHIER":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "KITCHEN":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-stone-800 text-stone-300 border-stone-700";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white">
              Staff & PIN Security
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber/20 text-amber border border-amber/30">
              {staffList.length} Accounts
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Manage store employee accounts, 4-digit quick touch PINs, access permissions, and revoke privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPins(!showPins)}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPins ? "Hide PINs" : "Show PINs"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber hover:bg-amber/90 text-charcoal font-heading uppercase text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Staff Account</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Security Info Banner */}
      <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800 text-xs text-stone-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber shrink-0 mt-0.5" />
        <div className="space-y-1 text-[11px] leading-relaxed">
          <p>
            <strong>How PIN Sign-in works:</strong> Staff can log in instantly on POS tablets, counter registers, and kitchen screens using their assigned <strong>4-digit PIN</strong> on the touch numpad without typing passwords.
          </p>
          <p className="text-stone-400">
            <strong>Security policy:</strong> PINs must be confidential and unique to each staff member. You can create or modify credentials anytime below.
          </p>
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-charcoal rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber animate-spin mx-auto" />
            <p className="text-xs text-stone-400">Loading staff records...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="py-16 text-center text-stone-500 text-xs">
            No staff accounts found. Click "+ Add Staff Account" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-900 border-b border-stone-800 font-heading uppercase text-stone-400 text-[11px] tracking-wider">
                <tr>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">4-Digit Quick PIN</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {staffList.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-stone-800/40 transition-colors ${
                      !user.isActive ? "bg-stone-900/50 opacity-60" : ""
                    }`}
                  >
                    {/* Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center font-heading font-bold text-sm text-stone-200">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{user.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            Added: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase border ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="p-4 font-mono text-stone-300">{user.phone}</td>

                    {/* PIN */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm tracking-widest bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800 text-amber font-bold">
                          {showPins ? user.pin : "••••"}
                        </span>
                        <button
                          onClick={() => {
                            setPinModalUser(user);
                            setTargetPin(user.pin);
                          }}
                          className="text-[11px] text-stone-400 hover:text-amber underline decoration-dotted flex items-center gap-1 transition-colors"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Change</span>
                        </button>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-colors ${
                          user.isActive
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900"
                            : "bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700"
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" />
                            <span>DISABLED</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setPinModalUser(user);
                            setTargetPin(user.pin);
                          }}
                          title="Change PIN"
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteStaff(user)}
                          title="Delete staff account"
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-rimjhimRed text-stone-400 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change PIN Modal */}
      {pinModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal border border-stone-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber" />
                <h3 className="font-heading text-lg text-white uppercase">Update 4-Digit PIN</h3>
              </div>
              <button
                onClick={() => setPinModalUser(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Setting new quick-access PIN for <strong className="text-white">{pinModalUser.name}</strong>.
            </p>

            <form onSubmit={handleUpdatePinSubmit} className="space-y-4">
              <div>
                <label className="text-stone-300 text-xs font-semibold block mb-1.5">
                  Enter New 4-Digit PIN:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={targetPin}
                  onChange={(e) => setTargetPin(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 5678"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-center text-2xl font-mono tracking-widest text-white focus:outline-hidden focus:border-amber"
                  autoFocus
                />
              </div>

              {/* Quick Numpad Helper */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      if (targetPin.length < 4) setTargetPin((prev) => prev + n);
                    }}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-mono font-bold text-sm"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTargetPin("")}
                  className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 font-mono text-xs uppercase"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (targetPin.length < 4) setTargetPin((prev) => prev + "0");
                  }}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-mono font-bold text-sm"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPin((prev) => prev.slice(0, -1))}
                  className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 font-mono text-xs"
                >
                  ⌫
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPin || targetPin.length < 4}
                  className="px-4 py-2 rounded-xl bg-amber hover:bg-amber/90 text-charcoal font-heading uppercase text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {updatingPin ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save PIN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal border border-stone-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber" />
                <h3 className="font-heading text-lg text-white uppercase">Add New Staff Account</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Full Name:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ali Raza"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Phone Number:</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 03001234567"
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono focus:outline-hidden focus:border-amber"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Role & Permissions:</label>
                  <select
                    value={newRole}
                    onChange={(e) =>
                      setNewRole(e.target.value as "ADMIN" | "OWNER" | "CASHIER" | "KITCHEN")
                    }
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
                  >
                    <option value="CASHIER">Cashier (POS & Counter)</option>
                    <option value="KITCHEN">Kitchen (Kitchen Screen only)</option>
                    <option value="OWNER">Owner / Manager (POS, Shifts & Reports)</option>
                    <option value="ADMIN">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">
                    4-Digit Touch PIN (Required):
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 7890"
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono tracking-widest text-center text-base focus:outline-hidden focus:border-amber"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">
                    Backup Password:
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Default: staff123"
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName || !newPhone || newPin.length < 4}
                  className="px-4 py-2 rounded-xl bg-amber hover:bg-amber/90 text-charcoal font-heading uppercase text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

