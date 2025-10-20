"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  password: string;
};

export default function UserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("SuperVisor");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch users and role check
  useEffect(() => {
    const isCheck = localStorage.getItem("User");
    if (!isCheck) {
      router.push("/login");
      return;
    } else{
      const parsed = JSON.parse(isCheck);
      const role = parsed.Role;
      if(role !== 'Admin'){
        router.push('/')
        return;
      }
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [router]);

  // Add or Update User
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editingId !== null) {
        // Update user
        const res = await fetch(`/api/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, role,password }),
        });
        const data = await res.json();
        if (data.success) {
          setUsers((prev) =>
            prev.map((u) => (u.id === editingId ? data.user : u))
          );
          setEditingId(null);
        }
      } else {
        // Add new user
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });
        const data = await res.json();
        if (data.success) setUsers((prev) => [...prev, data.user]);
      }

      setName("");
      setEmail("");
      setRole("SuperVisor");
      setPassword("");
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleEdit = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword(user.password);
    setEditingId(user.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">User Management</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:gap-6">
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border px-4 py-2 rounded-lg w-full md:w-1/5 focus:ring-2 focus:ring-blue-400" required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border px-4 py-2 rounded-lg w-full md:w-1/5 focus:ring-2 focus:ring-blue-400" required/>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="border px-4 py-2 rounded-lg w-full md:w-1/5 focus:ring-2 focus:ring-blue-400" required >
            <option value="SuperVisor">SuperVisor</option>
            <option value="Visitor">Visitor</option>
          </select>
          <input type="text" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border px-4 py-2 rounded-lg w-full md:w-1/5 focus:ring-2 focus:ring-blue-400" required />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition w-full md:w-auto"> {editingId !== null ? "Update User" : "Add User"}</button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>{["Sr.No", "Name", "Email", "Role", "Password", "Actions"].map(
                   (h) => (
                    <th key={h} className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"> {h}</th>
                  ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.password}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
                    <button onClick={() => handleEdit(user)} className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500" > Edit </button>
                      <button onClick={() => handleDelete(user.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"> Delete </button>     
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500"> No users found </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
