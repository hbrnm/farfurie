"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Plus, Search } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { type DiaryEntry } from "@/lib/store";

type Props = {
  entries: DiaryEntry[];
};

export function DiaryQuickActions({ entries }: Props) {
  return (
    <div className="flex gap-3">
      {/* Primary Add Food Button */}
      <Link href="/app/market" className="flex-1">
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => triggerHaptic("medium")}
          className="btn btn-primary w-full py-3 text-sm font-semibold shadow-sm"
        >
          <Plus size={18} />
          Adaugă Mâncare
        </motion.button>
      </Link>

      {/* Primary Plate Photo Button */}
      <Link href="/app/plate" className="flex-1">
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => triggerHaptic("medium")}
          className="btn btn-ghost w-full py-3 text-sm font-semibold"
        >
          <Camera size={18} />
          Pozează Farfuria
        </motion.button>
      </Link>
    </div>
  );
}
