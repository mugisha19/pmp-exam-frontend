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
    bg: "bg-white",
    border: "border-emerald-300",
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
    titleColor: "text-emerald-900",
    messageColor: "text-emerald-700",
    progressColor: "bg-emerald-500",
    buttonColor: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
  },
  error: {
    icon: XCircle,
    gradient: "from-red-500 to-rose-500",
    bg: "bg-white",
    border: "border-red-300",
    iconBg: "bg-red-500",
    iconColor: "text-white",
    titleColor: "text-red-900",
    messageColor: "text-red-700",
    progressColor: "bg-red-500",
    buttonColor: "text-red-600 hover:text-red-700 hover:bg-red-50",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-white",
    border: "border-amber-300",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    titleColor: "text-amber-900",
    messageColor: "text-amber-700",
    progressColor: "bg-amber-500",
    buttonColor: "text-amber-600 hover:text-amber-700 hover:bg-amber-50",
  },
  info: {
    icon: Info,
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-white",
    border: "border-blue-300",
    iconBg: "bg-blue-500",
    iconColor: "text-white",
    titleColor: "text-blue-900",
    messageColor: "text-blue-700",
    progressColor: "bg-blue-500",
    buttonColor: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
  },
  loading: {
    icon: Loader2,
    gradient: "from-gray-500 to-slate-500",
    bg: "bg-white",
    border: "border-gray-300",
    iconBg: "bg-gray-500",
    iconColor: "text-white",
    titleColor: "text-gray-900",
    messageColor: "text-gray-700",
    progressColor: "bg-gray-500",
    buttonColor: "text-gray-600 hover:text-gray-700 hover:bg-gray-50",
  },
};
