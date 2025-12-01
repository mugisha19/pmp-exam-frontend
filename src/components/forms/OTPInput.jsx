/**
 * OTPInput Component
 * 6-digit OTP input with auto-focus and paste support
 */

import { useRef, useState, useEffect } from "react";
import { cn } from "@/utils/cn";

export const OTPInput = ({ value = "", onChange, length = 6, error }) => {
  // Initialize state from value prop
  const getInitialOtp = () => {
    if (value) {
      const otpArray = value.split("").slice(0, length);
      while (otpArray.length < length) {
        otpArray.push("");
      }
      return otpArray;
    }
    return Array(length).fill("");
  };

  const [otp, setOtp] = useState(getInitialOtp);
  const inputRefs = useRef([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (index, digit) => {
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Call onChange with complete OTP
    onChange(newOtp.join(""));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle right arrow
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Only handle if it's all digits
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.split("").slice(0, length);
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      if (index < length) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div>
      <div className="flex gap-3 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              "w-12 h-14 text-center text-2xl font-semibold",
              "rounded-xl border-2 bg-surface-primary text-text-primary",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
              error
                ? "border-error"
                : "border-border-primary hover:border-border-secondary"
            )}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-sm text-error text-center animate-shake">
          {error}
        </p>
      )}
    </div>
  );
};

export default OTPInput;
