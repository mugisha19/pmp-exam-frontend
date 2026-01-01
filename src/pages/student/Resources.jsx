/**
 * Resources Page
 * Study materials and downloads
 */

import {
  FileText,
  Download,
  Video,
  FileQuestion,
  Book,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const Resources = () => {
  const resources = [
    {
      category: "Study Guides",
      icon: Book,
      items: [
        {
          title: "PMP Exam Content Outline",
          type: "PDF",
          size: "2.5 MB",
          downloads: 1250,
        },
        {
          title: "PMBOK Guide Summary",
          type: "PDF",
          size: "5.8 MB",
          downloads: 890,
        },
        {
          title: "Agile Practice Guide",
          type: "PDF",
          size: "3.2 MB",
          downloads: 720,
        },
      ],
    },
    {
      category: "Cheat Sheets",
      icon: FileText,
      items: [
        {
          title: "ITTOs Quick Reference",
          type: "PDF",
          size: "1.2 MB",
          downloads: 2100,
        },
        {
          title: "Formulas Cheat Sheet",
          type: "PDF",
          size: "800 KB",
          downloads: 1850,
        },
        {
          title: "Process Groups Chart",
          type: "PDF",
          size: "1.5 MB",
          downloads: 1420,
        },
      ],
    },
    {
      category: "Video Tutorials",
      icon: Video,
      items: [
        {
          title: "PMP Exam Preparation Course",
          type: "Video",
          duration: "12 hours",
          views: 5420,
        },
        {
          title: "Earned Value Management",
          type: "Video",
          duration: "45 min",
          views: 3200,
        },
        {
          title: "Critical Path Method",
          type: "Video",
          duration: "30 min",
          views: 2890,
        },
      ],
    },
    {
      category: "Practice Tools",
      icon: FileQuestion,
      items: [
        {
          title: "Formula Calculator",
          type: "Tool",
          link: "/tools/calculator",
        },
        {
          title: "Flashcard Deck",
          type: "Interactive",
          link: "/tools/flashcards",
        },
        { title: "Mind Maps", type: "PDF", size: "4.2 MB", downloads: 980 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="bg-gradient-to-br from-accent-teal to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Study Resources</h1>
          </div>
          <p className="text-xl text-white/90">
            Access guides, videos, and tools for PMP exam prep
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {resources.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.category}
                className="bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b border-border-light">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-primary-600" />
                    <h2 className="text-xl font-bold text-text-primary">
                      {category.category}
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {category.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-bg-secondary hover:bg-primary-50 rounded-lg transition-colors group cursor-pointer"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary group-hover:text-primary-600 mb-1">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-text-muted">
                            <span>{item.type}</span>
                            {item.size && (
                              <>
                                <span>•</span>
                                <span>{item.size}</span>
                              </>
                            )}
                            {item.duration && (
                              <>
                                <span>•</span>
                                <span>{item.duration}</span>
                              </>
                            )}
                            {item.downloads && (
                              <>
                                <span>•</span>
                                <span>{item.downloads} downloads</span>
                              </>
                            )}
                            {item.views && (
                              <>
                                <span>•</span>
                                <span>{item.views} views</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button className="flex items-center justify-center w-10 h-10 bg-primary-100 group-hover:bg-primary-600 text-primary-600 group-hover:text-white rounded-lg transition-colors">
                          {item.link ? (
                            <ExternalLink className="w-5 h-5" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Resources;
