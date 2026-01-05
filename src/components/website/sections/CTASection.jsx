/**
 * CTASection Component
 * Call-to-action section for conversions
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

export const CTASection = ({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  variant = "gradient", // gradient, solid, outlined
  className,
}) => {
  return (
    <div className={cn("py-16 lg:py-24", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl px-8 py-16 lg:px-16 lg:py-20",
            variant === "gradient" &&
              "bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500",
            variant === "solid" && "bg-primary-600",
            variant === "outlined" && "bg-white border-2 border-primary-200"
          )}
        >
          {/* Background Decoration */}
          {variant !== "outlined" && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            </div>
          )}

          <div className="relative text-center max-w-3xl mx-auto">
            <h2
              className={cn(
                "text-3xl sm:text-4xl lg:text-5xl font-bold mb-6",
                variant === "outlined" ? "text-text-primary" : "text-white"
              )}
            >
              {title}
            </h2>
            {description && (
              <p
                className={cn(
                  "text-lg sm:text-xl mb-8",
                  variant === "outlined"
                    ? "text-text-secondary"
                    : "text-white/90"
                )}
              >
                {description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {primaryCTA && (
                <Link
                  to={primaryCTA.path || "#"}
                  onClick={primaryCTA.onClick}
                  className={cn(
                    "inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105",
                    variant === "outlined"
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl"
                      : "bg-white text-primary-600 shadow-lg hover:shadow-xl"
                  )}
                >
                  {primaryCTA.label}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              {secondaryCTA && (
                <Link
                  to={secondaryCTA.path || "#"}
                  onClick={secondaryCTA.onClick}
                  className={cn(
                    "inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all duration-300",
                    variant === "outlined"
                      ? "bg-white text-text-primary border-2 border-border-light hover:border-primary-300"
                      : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                  )}
                >
                  {secondaryCTA.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
