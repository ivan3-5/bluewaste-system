"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Camera, Upload, User, Mail, Phone, Shield } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setMessage(null);

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setFormData((prev) => ({ ...prev, avatarUrl: response.data.url }));
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await api.put(`/users/${user.id}`, formData);
      updateUser(response.data);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
              Account Settings
            </h1>
            <p className="text-slate-500 mt-2 text-base md:text-lg">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-medium text-sm shadow-sm">
            <Shield className="w-4 h-4" />
            <span>{user.role === "LGU_ADMIN" ? "Administrator" : user.role === "FIELD_WORKER" ? "Field Worker" : "Citizen"}</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden relative">
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="p-8 md:p-12 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Alert Message */}
              {message && (
                <div
                  className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
                    message.type === "success"
                      ? "bg-green-50/80 backdrop-blur-sm text-green-800 border border-green-200/50 shadow-sm"
                      : "bg-red-50/80 backdrop-blur-sm text-red-800 border border-red-200/50 shadow-sm"
                  }`}
                >
                  <div className={`p-2 rounded-full ${message.type === "success" ? "bg-green-100" : "bg-red-100"}`}>
                    {message.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm font-semibold">{message.text}</p>
                </div>
              )}

              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="relative group cursor-pointer" onClick={() => !isUploadingImage && fileInputRef.current?.click()}>
                  <div className={`w-32 h-32 rounded-full overflow-hidden bg-white flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-slate-100 transition-all duration-300 ${isUploadingImage ? 'opacity-50' : 'group-hover:ring-blue-100 group-hover:shadow-2xl group-hover:scale-105'}`}>
                    {formData.avatarUrl ? (
                      <Image
                        src={formData.avatarUrl}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-black text-slate-300 tracking-tighter">
                        {formData.firstName?.[0]}
                        {formData.lastName?.[0]}
                      </span>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                      <Camera className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                  </div>
                  
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 p-2 rounded-full shadow-lg">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left pt-2">
                  <h3 className="text-lg font-bold text-slate-800">Profile Photo</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    Upload a new photo to personalize your account. Max size: 5MB (JPG, PNG).
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="mt-4 rounded-xl border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold shadow-sm transition-all"
                  >
                    <Upload className="w-4 h-4 mr-2 text-slate-500" />
                    Choose Image
                  </Button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" /> First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base shadow-sm"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" /> Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base shadow-sm"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base shadow-sm"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base shadow-sm"
                  />
                </div>
              </div>
              
              {/* Action Area */}
              <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full md:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving Changes...</>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
}
