"use client";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(()=>{
    const istrue = localStorage.getItem('User');
    if(istrue){
      router.push('/')
    }
  },[])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      const apiData ={
        Username: data.user.name,
        Role: data.user.role
      }
    
      localStorage.setItem('User',JSON.stringify(apiData))
      router.push('/')
      window.location.reload();
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 font-medium text-gray-700"> Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required/>
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1 font-medium text-gray-700"> Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required/>
          </div>

          <button type="submit" className="bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"> Login</button>

        </form>
      </div>
    </div>
  );
}
