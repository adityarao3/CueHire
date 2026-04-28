"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface EnrichedFeedback {
  id: string;
  interviewId: string;
  totalScore: number;
  recommendedAction?: string;
  finalAssessment: string;
  categoryScores?: Array<{ name: string; score: number; comment: string }>;
  createdAt: string;
  candidateName: string;
  candidateEmail: string;
  interviewRole?: string;
  interviewType?: string;
}

const AssessmentList = ({
  assessments,
}: {
  assessments: EnrichedFeedback[];
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  const filtered = useMemo(() => {
    let result = [...assessments];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (fb) =>
          fb.candidateName.toLowerCase().includes(q) ||
          fb.candidateEmail.toLowerCase().includes(q)
      );
    }

    if (filterAction !== "all") {
      result = result.filter((fb) => fb.recommendedAction === filterAction);
    }

    if (sortBy === "score") {
      result.sort((a, b) => b.totalScore - a.totalScore);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [assessments, searchQuery, filterAction, sortBy]);

  const getActionColor = (action?: string) => {
    switch (action) {
      case "Strong Hire":
        return "bg-cue-green text-white";
      case "Hire":
        return "bg-cue-green/70 text-white";
      case "Maybe":
        return "bg-cue-yellow text-cue-dark";
      case "No Hire":
        return "bg-cue-pink text-white";
      default:
        return "bg-gray-100 text-cue-text";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-cue-green";
    if (score >= 60) return "text-cue-yellow-hover";
    if (score >= 40) return "text-orange-500";
    return "text-cue-pink";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-cue-green";
    if (score >= 60) return "bg-cue-yellow";
    if (score >= 40) return "bg-orange-400";
    return "bg-cue-pink";
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }) + " IST"
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="flex flex-col gap-6 mt-8">
      <div className="flex flex-row justify-between items-center flex-wrap gap-4">
        <h2>All Candidate Assessments</h2>
        <span className="text-sm text-cue-text-light">
          {filtered.length} of {assessments.length} results
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-cue-text-light"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-white border border-cue-border rounded-full pl-11 pr-4 py-2.5 text-sm text-cue-dark placeholder:text-cue-text-light/60 focus:outline-none focus:border-cue-yellow transition-all shadow-sm"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-white border border-cue-border rounded-full px-4 py-2.5 text-sm text-cue-text focus:outline-none focus:border-cue-yellow transition-all cursor-pointer appearance-none min-w-[140px] shadow-sm"
        >
          <option value="all">All Actions</option>
          <option value="Strong Hire">Strong Hire</option>
          <option value="Hire">Hire</option>
          <option value="Maybe">Maybe</option>
          <option value="No Hire">No Hire</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "score")}
          className="bg-white border border-cue-border rounded-full px-4 py-2.5 text-sm text-cue-text focus:outline-none focus:border-cue-yellow transition-all cursor-pointer appearance-none min-w-[130px] shadow-sm"
        >
          <option value="date">Newest First</option>
          <option value="score">Highest Score</option>
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-cue-text-light">
            {searchQuery || filterAction !== "all"
              ? "No assessments match your search."
              : "No candidate assessments available yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((fb) => (
            <div
              key={fb.id}
              className="bg-white rounded-2xl p-6 border border-cue-border shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header Row */}
              <div className="flex flex-row justify-between items-start gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl text-cue-dark">{fb.candidateName}</h3>
                  <p className="text-sm text-cue-text-light">
                    {fb.candidateEmail}
                  </p>
                  <p className="text-xs text-cue-text-light mt-1">
                    {fb.interviewRole
                      ? `${fb.interviewRole} — ${fb.interviewType}`
                      : "Screening Interview"}
                    {" · "}
                    {formatDate(fb.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold ${getActionColor(
                      fb.recommendedAction
                    )}`}
                  >
                    {fb.recommendedAction || "Pending"}
                  </span>

                  <div className="flex flex-col items-center">
                    <span
                      className={`text-3xl font-bold ${getScoreColor(
                        fb.totalScore
                      )}`}
                    >
                      {fb.totalScore}
                    </span>
                    <span className="text-xs text-cue-text-light">/100</span>
                  </div>
                </div>
              </div>

              {/* Score Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-5">
                {fb.categoryScores?.map((cat, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-cue-text-light truncate">
                        {cat.name}
                      </span>
                      <span
                        className={`text-xs font-bold ${getScoreColor(
                          cat.score
                        )}`}
                      >
                        {cat.score}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${getScoreBarColor(
                          cat.score
                        )}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Assessment */}
              <p className="text-sm text-cue-text-light mt-4 line-clamp-3">
                {fb.finalAssessment}
              </p>

              {/* View Details Button */}
              <div className="flex justify-end mt-4">
                <Link
                  href={`/admin/feedback/${fb.id}`}
                  className="px-5 py-2 rounded-full bg-cue-yellow text-cue-dark text-sm font-bold hover:bg-cue-yellow-hover transition-all shadow-sm"
                >
                  View Full Report
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AssessmentList;
