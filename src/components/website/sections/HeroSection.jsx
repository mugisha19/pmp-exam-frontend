/**
 * HeroSection Component
 * Main hero section for landing pages
 */

import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

export const HeroSection = ({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  stats,
  children,
  variant = "gradient", // gradient, solid, image
  className,
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        variant === "gradient" &&
          "bg-gradient-to-br from-primary-50 via-white to-secondary-50",
        variant === "solid" && "bg-primary-600",
        className
      )}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge/Subtitle */}
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-primary-200 mb-6">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {subtitle}
              </span>
            </div>
          )}

          {/* Title */}
          <h1
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6",
              variant === "solid" ? "text-white" : "text-text-primary"
            )}
          >
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p
              className={cn(
                "text-lg sm:text-xl mb-8 max-w-2xl mx-auto",
                variant === "solid" ? "text-white/90" : "text-text-secondary"
              )}
            >
              {description}
            </p>
          )}

          {/* CTAs */}
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {primaryCTA && (
                <Link
                  to={primaryCTA.path || "#"}
                  onClick={primaryCTA.onClick}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-emerald text-white font-semibold rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105"
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
                    variant === "solid"
                      ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                      : "bg-white text-text-primary border-2 border-border-light hover:border-primary-300 shadow-sm hover:shadow-md"
                  )}
                >
                  {secondaryCTA.icon && (
                    <secondaryCTA.icon className="w-5 h-5" />
                  )}
                  {secondaryCTA.label}
                </Link>
              )}
            </div>
          )}

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className={cn(
                      "text-3xl lg:text-4xl font-bold mb-1",
                      variant === "solid" ? "text-white" : "text-primary-600"
                    )}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      variant === "solid"
                        ? "text-white/80"
                        : "text-text-tertiary"
                    )}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Children */}
          {children}
        </div>
      </div>
    </div>
  );
};
