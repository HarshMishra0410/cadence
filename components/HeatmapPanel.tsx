"use client";

import { useMemo, useState } from "react";
import CalendarMonth, { localDateKey } from "./CalendarMonth";
import WeekStrip from "./WeekStrip";
import DayPostsModal from "./DayPostsModal";
import ScheduledPicksModal from "./ScheduledPicksModal";

export type PostSummary = {
  id: string;
  postedAt: string; // ISO — dates don't cross the server/client boundary as Date objects.
  topic: string;
  content: string;
  link: string | null;
  ownerName: string;
  impressions: number | null;
};

export type ScheduledPickSummary = {
  id: string;
  scheduledFor: string; // ISO
  name: string;
  author: string;
  positioning: string;
};

const SCALES = [
  { value: "1W", label: "1 Week" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "6M", label: "6 Months" },
  { value: "1Y", label: "1 Year" },
] as const;

type Scale = (typeof SCALES)[number]["value"];

// How many extra months to show *before* the current one — 0 for 1W/1M,
// since those aren't month-stack views at all.
const MONTHS_BACK: Record<Scale, number> = { "1W": 0, "1M": 0, "3M": 2, "6M": 5, "1Y": 11 };

type Props = {
  posts: PostSummary[];
  /** Picks scheduled but not yet posted — marked yellow on the calendar. */
  scheduledPicks?: ScheduledPickSummary[];
  defaultScale?: Scale;
};

export default function HeatmapPanel({ posts, scheduledPicks = [], defaultScale = "1M" }: Props) {
  const [scale, setScale] = useState<Scale>(defaultScale);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const postsByDay = useMemo(() => {
    const m = new Map<string, PostSummary[]>();
    for (const post of posts) {
      const key = localDateKey(new Date(post.postedAt));
      const list = m.get(key);
      if (list) list.push(post);
      else m.set(key, [post]);
    }
    return m;
  }, [posts]);

  const scheduledByDay = useMemo(() => {
    const m = new Map<string, ScheduledPickSummary[]>();
    for (const pick of scheduledPicks) {
      const key = localDateKey(new Date(pick.scheduledFor));
      const list = m.get(key);
      if (list) list.push(pick);
      else m.set(key, [pick]);
    }
    return m;
  }, [scheduledPicks]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    postsByDay.forEach((list, key) => m.set(key, list.length));
    return m;
  }, [postsByDay]);

  const scheduledKeys = useMemo(() => new Set(scheduledByDay.keys()), [scheduledByDay]);

  const today = new Date();
  const todayKey = localDateKey(today);

  const handleDayClick = (key: string) => {
    if ((postsByDay.get(key)?.length ?? 0) > 0 || (scheduledByDay.get(key)?.length ?? 0) > 0) {
      setSelectedKey(key);
    }
  };

  const selectedPosts = selectedKey ? postsByDay.get(selectedKey) ?? [] : [];
  const selectedScheduled = selectedKey ? scheduledByDay.get(selectedKey) ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      <select
        value={scale}
        onChange={(e) => setScale(e.target.value as Scale)}
        className="clay-input cal-select text-sm"
        aria-label="Calendar range"
      >
        {SCALES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {scale === "1W" && (
        <WeekStrip counts={counts} todayKey={todayKey} onDayClick={handleDayClick} scheduledKeys={scheduledKeys} />
      )}

      {scale === "1M" && (
        <CalendarMonth
          year={today.getFullYear()}
          month={today.getMonth()}
          counts={counts}
          todayKey={todayKey}
          muteFuture
          onDayClick={handleDayClick}
          scheduledKeys={scheduledKeys}
        />
      )}

      {(scale === "3M" || scale === "6M" || scale === "1Y") && (
        <div className="cal-stack">
          {Array.from({ length: MONTHS_BACK[scale] + 1 }, (_, i) => {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            return (
              <CalendarMonth
                key={`${d.getFullYear()}-${d.getMonth()}`}
                year={d.getFullYear()}
                month={d.getMonth()}
                counts={counts}
                todayKey={todayKey}
                muteFuture={i === 0}
                compact
                titleClassName="cal-month-title-sm"
                onDayClick={handleDayClick}
                scheduledKeys={scheduledKeys}
              />
            );
          })}
        </div>
      )}

      {selectedKey && selectedPosts.length > 0 && (
        <DayPostsModal dateKey={selectedKey} posts={selectedPosts} onClose={() => setSelectedKey(null)} />
      )}
      {selectedKey && selectedPosts.length === 0 && selectedScheduled.length > 0 && (
        <ScheduledPicksModal dateKey={selectedKey} picks={selectedScheduled} onClose={() => setSelectedKey(null)} />
      )}
    </div>
  );
}
