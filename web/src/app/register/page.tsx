"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User,
  MapPin,
  BarChart3,
  CheckCircle2,
  Timer,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { limitPhoneDigits, phoneError, phonePattern } from "@/lib/phone";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phone: z.string().regex(phonePattern, phoneError).optional(),
    address: z.string().min(1, "Address is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const features = [
  { icon: CheckCircle2, label: "Free account for all residents" },
  { icon: MapPin, label: "Report waste from anywhere, anytime" },
  { icon: BarChart3, label: "Track your environmental impact" },
];

const OTP_EXPIRY_SECONDS = 10 * 60;
const OTP_RESEND_SECONDS = 60;

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export default function RegisterPage() {
  const { register: registerUser, verifyEmail, resendVerification } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationDigits, setVerificationDigits] = useState<string[]>(Array(6).fill(""));
  const [verificationError, setVerificationError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(OTP_EXPIRY_SECONDS);
  const [resendIn, setResendIn] = useState(OTP_RESEND_SECONDS);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const phoneField = register("phone");
  const verificationCode = verificationDigits.join("");

  useEffect(() => {
    if (!verificationEmail) return;

    const focusFrame = window.requestAnimationFrame(() => otpInputRefs.current[0]?.focus());
    const timer = window.setInterval(() => {
      setOtpExpiresIn((seconds) => Math.max(0, seconds - 1));
      setResendIn((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.clearInterval(timer);
    };
  }, [verificationEmail]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      setError("");
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
      });
      setVerificationDigits(Array(6).fill(""));
      setVerificationError("");
      setVerificationMessage("");
      setOtpExpiresIn(OTP_EXPIRY_SECONDS);
      setResendIn(OTP_RESEND_SECONDS);
      setVerificationEmail(data.email.trim().toLowerCase());
    } catch (err: any) {
      const apiError = err.response?.data?.error;
      setError(
        (typeof apiError === "string" ? apiError : apiError?.message) ||
          err.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerificationLoading(true);
    setVerificationError("");
    setVerificationMessage("");
    try {
      await verifyEmail(verificationEmail, verificationCode);
      router.push("/citizen/report");
    } catch (err: any) {
      setVerificationError(err.response?.data?.message || err.response?.data?.error?.message || "That code could not be verified.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendIn > 0 || verificationLoading) return;
    setVerificationLoading(true);
    setVerificationError("");
    setVerificationMessage("");
    try {
      await resendVerification(verificationEmail);
      setVerificationMessage("If this account still needs verification, a new code has been sent.");
      setVerificationDigits(Array(6).fill(""));
      setOtpExpiresIn(OTP_EXPIRY_SECONDS);
      setResendIn(OTP_RESEND_SECONDS);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      const retryAfter = Number(err.response?.headers?.["retry-after"]);
      if (Number.isFinite(retryAfter) && retryAfter > 0) setResendIn(retryAfter);
      setVerificationError(err.response?.data?.message || err.response?.data?.error?.message || "Could not resend the code. Please try again shortly.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const setOtpDigit = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setVerificationDigits((current) => current.map((digit, position) => position === index ? "" : digit));
      setVerificationError("");
      return;
    }

    const nextCode = [...verificationDigits];
    digits.slice(0, 6 - index).split("").forEach((digit, offset) => {
      nextCode[index + offset] = digit;
    });
    setVerificationDigits(nextCode);
    setVerificationError("");
    otpInputRefs.current[Math.min(index + digits.length, 5)]?.focus();
  };

  const pasteOtp = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedCode) return;
    setVerificationDigits(Array.from({ length: 6 }, (_, index) => pastedCode[index] || ""));
    setVerificationError("");
    otpInputRefs.current[Math.min(pastedCode.length, 5)]?.focus();
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !verificationDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-gray-900">
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_80px_-36px_rgba(2,132,199,0.55)] lg:min-h-[760px] lg:grid-cols-[1.02fr_1fr]">
          <section className="relative flex flex-col justify-between bg-white px-7 py-8 sm:px-10 sm:py-10 lg:border-r lg:border-slate-200 lg:px-12 lg:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />
            <div className="relative space-y-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-bluewaste.png"
                  alt="BlueWaste logo"
                  width={46}
                  height={46}
                  quality={100}
                  sizes="46px"
                  className="h-11 w-11 rounded-xl object-contain ring-1 ring-primary/20"
                  priority
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-700/90">
                    BlueWaste System
                  </p>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Panabo City
                  </h1>
                </div>
              </div>

              <div>
                <p className="mb-3 inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur-sm">
                  Community Registration
                </p>
                <h2 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                  Join the
                  <br />
                  <span className="text-primary">Clean City Mission.</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
                  Create your account and help transform waste reports into real
                  cleanup action for your neighborhood.
                </p>
              </div>

              <ul
                className="space-y-3"
                aria-label="Benefits of creating a BlueWaste account"
              >
                {features.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-blue-100/80 bg-white/80 px-3 py-3 backdrop-blur-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative mt-8 text-xs text-slate-600">
              © {new Date().getFullYear()} BlueWaste. Building cleaner
              communities together.
            </p>
          </section>

          <section className="flex items-center bg-white px-6 py-8 sm:px-10 sm:py-10 lg:border-l lg:border-slate-200 lg:px-12 lg:py-12">
            <div className="mx-auto w-full max-w-lg">
              <div className="mb-6 sm:mb-7">
                <h2 className="text-3xl font-bold text-slate-900">
                  Create your account
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Join BlueWaste to report, monitor, and support cleaner public
                  spaces.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                {error && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-slate-700"
                    >
                      First name
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="firstName"
                        autoComplete="given-name"
                        placeholder="Juan"
                        aria-invalid={Boolean(errors.firstName)}
                        aria-describedby={
                          errors.firstName ? "firstName-error" : undefined
                        }
                        className="h-11 rounded-xl border-slate-200 pl-10 focus-visible:border-primary focus-visible:ring-primary/30"
                        {...register("firstName")}
                      />
                    </div>
                    {errors.firstName && (
                      <p id="firstName-error" className="text-xs text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-slate-700"
                    >
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      autoComplete="family-name"
                      placeholder="Dela Cruz"
                      aria-invalid={Boolean(errors.lastName)}
                      aria-describedby={
                        errors.lastName ? "lastName-error" : undefined
                      }
                      className="h-11 rounded-xl border-slate-200 focus-visible:border-primary focus-visible:ring-primary/30"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p id="lastName-error" className="text-xs text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                      className="h-11 rounded-xl border-slate-200 pl-10 focus-visible:border-primary focus-visible:ring-primary/30"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-slate-700"
                  >
                    Phone{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      placeholder="09123456789"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      className="h-11 rounded-xl border-slate-200 pl-10 focus-visible:border-primary focus-visible:ring-primary/30"
                      {...phoneField}
                      onChange={(event) => {
                        event.target.value = limitPhoneDigits(event.target.value);
                        void phoneField.onChange(event);
                      }}
                    />
                  </div>
                  {errors.phone && (
                    <p id="phone-error" className="text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium text-slate-700"
                  >
                    Address
                  </Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="address"
                      type="text"
                      autoComplete="street-address"
                      placeholder="Your complete address"
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={
                        errors.address ? "address-error" : undefined
                      }
                      className="h-11 rounded-xl border-slate-200 pl-10 focus-visible:border-primary focus-visible:ring-primary/30"
                      {...register("address")}
                    />
                  </div>
                  {errors.address && (
                    <p id="address-error" className="text-xs text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimum 6 characters"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "password-error" : "password-help"
                      }
                      className="h-11 rounded-xl border-slate-200 pl-10 pr-11 focus-visible:border-primary focus-visible:ring-primary/30"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-blue-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p id="password-help" className="text-xs text-slate-500">
                    Use at least 6 characters for account security.
                  </p>
                  {errors.password && (
                    <p id="password-error" className="text-xs text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-slate-700"
                  >
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword
                          ? "confirmPassword-error"
                          : undefined
                      }
                      className="h-11 rounded-xl border-slate-200 pl-10 pr-11 focus-visible:border-primary focus-visible:ring-primary/30"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-blue-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      id="confirmPassword-error"
                      className="text-xs text-red-600"
                    >
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="mt-1 h-11 w-full rounded-xl bg-primary font-medium text-white transition hover:bg-blue-700"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <p className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary underline-offset-2 transition hover:text-blue-700 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Dialog
        open={Boolean(verificationEmail)}
        onOpenChange={(open) => {
          if (!open) {
            setVerificationEmail("");
            setVerificationDigits(Array(6).fill(""));
            setVerificationError("");
            setVerificationMessage("");
          }
        }}
      >
        <DialogContent
          overlayClassName="bg-slate-950/45 backdrop-blur-[5px] data-[state=open]:duration-300"
          className="max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[480px] gap-0 overflow-y-auto rounded-[28px] border border-white/70 bg-white p-0 text-slate-900 shadow-[0_32px_100px_-28px_rgba(2,32,71,0.55)] duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-3 sm:max-h-[calc(100dvh-3rem)] sm:rounded-[32px]"
        >
          <div className="relative overflow-hidden px-5 pb-6 pt-8 sm:px-9 sm:pb-8 sm:pt-9">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.15),transparent_72%)]" />
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-100 to-blue-50 text-primary shadow-inner ring-1 ring-sky-200/70">
                <Mail className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                BlueWaste account security
              </p>
              <DialogTitle className="mt-2 text-[26px] font-bold tracking-tight text-slate-950 sm:text-[30px]">
                Verify your email
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                Enter the six-digit code we sent to
                <span className="mt-0.5 block break-all font-semibold text-slate-800">{verificationEmail}</span>
              </DialogDescription>
            </div>

            <form className="relative mt-7 space-y-5 sm:mt-8" onSubmit={submitVerification}>
              <div>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <Label className="text-sm font-semibold text-slate-700" htmlFor="verification-digit-0">
                    Verification code
                  </Label>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${otpExpiresIn === 0 ? "text-rose-600" : "text-slate-500"}`} aria-live="polite">
                    <Timer className="h-3.5 w-3.5" />
                    {otpExpiresIn === 0 ? "Code expired" : `Expires in ${formatCountdown(otpExpiresIn)}`}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2 sm:gap-3" role="group" aria-label="Six-digit email verification code">
                  {verificationDigits.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(element) => { otpInputRefs.current[index] = element; }}
                      id={index === 0 ? "verification-digit-0" : undefined}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={index === 0 ? 6 : 1}
                      aria-label={`Digit ${index + 1} of 6`}
                      aria-invalid={Boolean(verificationError)}
                      value={digit}
                      onChange={(event) => setOtpDigit(index, event.target.value)}
                      onPaste={pasteOtp}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      className="h-12 min-w-0 rounded-xl border-slate-200 bg-slate-50/80 p-0 text-center text-xl font-bold text-slate-900 shadow-sm transition duration-150 focus-visible:border-sky-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-sky-100 sm:h-14 sm:rounded-2xl sm:text-2xl"
                    />
                  ))}
                </div>
                <p className="mt-2.5 text-center text-xs text-slate-500">The code is valid for 10 minutes.</p>
              </div>

              {verificationError && (
                <p role="alert" aria-live="assertive" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-700">
                  {verificationError}
                </p>
              )}
              {verificationMessage && (
                <p role="status" aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-700">
                  {verificationMessage}
                </p>
              )}

              <Button
                type="submit"
                disabled={verificationLoading || verificationCode.length !== 6 || otpExpiresIn === 0}
                className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(2,132,199,0.85)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_14px_26px_-10px_rgba(2,132,199,0.8)] disabled:translate-y-0 disabled:shadow-none"
              >
                {verificationLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying your email…
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verify email and continue</span>
                )}
              </Button>
            </form>

            <div className="relative mt-5 flex min-h-10 flex-col items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm sm:flex-row">
              <button
                type="button"
                onClick={resendCode}
                disabled={verificationLoading || resendIn > 0}
                className="rounded-md px-2 py-1 font-semibold text-primary transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {resendIn > 0 ? `Resend code in ${formatCountdown(resendIn)}` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setVerificationEmail("");
                  setVerificationDigits(Array(6).fill(""));
                  setVerificationError("");
                  setVerificationMessage("");
                }}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to registration
              </button>
            </div>

            <div className="relative mt-5 flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500 ring-1 ring-slate-100">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <p>Check your inbox and spam folder. For your security, never share this code with anyone.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
