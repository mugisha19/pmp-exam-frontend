/**
 * TimelineSection Component
 * Vertical timeline for events and progress
 */

import { Calendar, CheckCircle2, Clock, Play } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDistanceToNow } from "date-fns";

export const TimelineSection = ({ title, events, className }) => {
  const getStatusIcon = (status) => {
    if (status === "completed")
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    if (status === "in-progress")
      return <Play className="w-5 h-5 text-primary-600" />;
    return <Clock className="w-5 h-5 text-text-muted" />;
  };

  const getStatusColor = (status) => {
    if (status === "completed") return "bg-success";
    if (status === "in-progress") return "bg-primary-600";
    return "bg-text-muted";
  };

  if (!events || events.length === 0) return null;

  return (
    <div className={cn("", className)}>
      {title && (
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6">
          {title}
        </h2>
      )}

      <div className="space-y-4">
        {events.map((event, idx) => (
          <div key={idx} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  event.status === "completed" && "bg-green-100",
                  event.status === "in-progress" && "bg-primary-100",
                  event.status === "upcoming" && "bg-bg-tertiary"
                )}
              >
                {getStatusIcon(event.status)}
              </div>
              {idx < events.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-full min-h-[60px] mt-2",
                    getStatusColor(event.status)
                  )}
                />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 pb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border-light hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-lg text-text-primary">
                    {event.title}
                  </h3>
                  {event.date && (
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {formatDistanceToNow(new Date(event.date), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-text-tertiary text-sm mb-3">
                    {event.description}
                  </p>
                )}
                {event.metadata && (
                  <div className="flex flex-wrap gap-2">
                    {event.metadata.score && (
                      <span className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg">
                        Score: {event.metadata.score}%
                      </span>
                    )}
                    {event.metadata.duration && (
                      <span className="inline-flex items-center px-2 py-1 bg-bg-secondary text-text-secondary text-xs font-medium rounded-lg">
                        {event.metadata.duration}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
