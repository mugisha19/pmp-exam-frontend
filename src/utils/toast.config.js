/**
 * Toast Configuration
 * Shared constants for toast styling
 */

import {
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";

export const toastConfig = {
  success: {
    icon: CheckCircle,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-gradient-to-r from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-900",
    messageColor: "text-emerald-700",
    progressColor: "bg-emerald-500",
    buttonColor: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100",
  },
  error: {
    icon: XCircle,
    gradient: "from-red-500 to-rose-500",
    bg: "bg-gradient-to-r from-red-50 to-rose-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    titleColor: "text-red-900",
    messageColor: "text-red-700",
    progressColor: "bg-red-500",
    buttonColor: "text-red-600 hover:text-red-700 hover:bg-red-100",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-gradient-to-r from-amber-50 to-orange-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    titleColor: "text-amber-900",
    messageColor: "text-amber-700",
    progressColor: "bg-amber-500",
    buttonColor: "text-amber-600 hover:text-amber-700 hover:bg-amber-100",
  },
  info: {
    icon: Info,
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-900",
    messageColor: "text-blue-700",
    progressColor: "bg-blue-500",
    buttonColor: "text-blue-600 hover:text-blue-700 hover:bg-blue-100",
  },
  loading: {
    icon: Loader2,
    gradient: "from-gray-500 to-slate-500",
    bg: "bg-gradient-to-r from-gray-50 to-slate-50",
    border: "border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    titleColor: "text-gray-900",
    messageColor: "text-gray-600",
    progressColor: "bg-gray-500",
    buttonColor: "text-gray-600 hover:text-gray-700 hover:bg-gray-100",
  },
};
