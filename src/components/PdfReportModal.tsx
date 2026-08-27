"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Printer, X } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { generatePdfReportData } from "@/lib/pdf-report";
import { useEffectiveGoals } from "@/lib/selectors";
import { useFarfurieStore } from "@/lib/store";

type Props = {
  onClose: () => void;
};

export function PdfReportModal({ onClose }: Props) {
  const locale = useFarfurieStore((s) => s.locale);
  const profile = useFarfurieStore((s) => s.profile);
  const entries = useFarfurieStore((s) => s.entries);
  const weightLogs = useFarfurieStore((s) => s.weightLogs);
  const waterByDate = useFarfurieStore((s) => s.waterByDate);
  const goals = useEffectiveGoals();

  const [days, setDays] = useState<7 | 30>(7);

  const report = useMemo(
    () =>
      generatePdfReportData({
        days,
        entries,
        weightLogs,
        waterByDate,
        profile,
        goalKcal: goals.kcal,
        goalProtein: goals.protein,
      }),
    [days, entries, weightLogs, waterByDate, profile, goals.kcal, goals.protein],
  );

  const handlePrint = () => {
    triggerHaptic("medium");
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 md:p-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        {/* Modal Controls - Hidden during print */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="text-[var(--brand)]" size={24} />
            <h2 className="display text-2xl">
              {locale === "ro" ? "Raport Nutrițional PDF" : "PDF Nutrition Report"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-gray-100 p-1 text-xs font-semibold">
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  days === 7 ? "bg-[var(--brand)] text-white" : "text-gray-600 hover:text-black"
                }`}
                onClick={() => setDays(7)}
              >
                7 {locale === "ro" ? "Zile" : "Days"}
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  days === 30 ? "bg-[var(--brand)] text-white" : "text-gray-600 hover:text-black"
                }`}
                onClick={() => setDays(30)}
              >
                30 {locale === "ro" ? "Zile" : "Days"}
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              className="btn btn-primary text-sm shadow-sm"
              onClick={handlePrint}
            >
              <Printer size={16} />
              {locale === "ro" ? "Descarcă PDF / Printează" : "Download PDF / Print"}
            </motion.button>

            <button
              type="button"
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Document (A4 Styled) */}
        <div id="pdf-report-document" className="space-y-6 text-gray-900">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-brand pb-4">
            <div>
              <h1 className="display text-3xl text-brand font-bold">Farfurie · Raport Nutrițional</h1>
              <p className="mt-1 text-xs text-gray-500">
                {locale === "ro" ? "Generat la" : "Generated on"} {report.generatedAt} · Perioadă: {report.days} zile
              </p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p className="font-semibold text-gray-900">Pacient / Utilizator</p>
              <p>Sex: {report.profile.sex === "female" ? "Femeie" : "Bărbat"} · {report.profile.age} ani</p>
              <p>Înălțime: {report.profile.heightCm} cm</p>
            </div>
          </div>

          {/* Key Metrics Executive Summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-emerald-50/80 p-3.5 border border-emerald-100">
              <p className="text-xs font-semibold uppercase text-emerald-800">Calorii Medie/Zi</p>
              <p className="display mt-1 text-2xl font-bold text-emerald-900">{report.avgKcal} kcal</p>
              <p className="text-xs text-emerald-700">Țintă: {report.goalKcal} kcal</p>
            </div>

            <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-100">
              <p className="text-xs font-semibold uppercase text-amber-800">Proteine Medie/Zi</p>
              <p className="display mt-1 text-2xl font-bold text-amber-900">{report.avgProtein}g</p>
              <p className="text-xs text-amber-700">Țintă: {report.goalProtein}g</p>
            </div>

            <div className="rounded-2xl bg-blue-50/80 p-3.5 border border-blue-100">
              <p className="text-xs font-semibold uppercase text-blue-800">Greutate Actuală</p>
              <p className="display mt-1 text-2xl font-bold text-blue-900">{report.endWeight} kg</p>
              <p className="text-xs text-blue-700">Evoluție: {report.weightDelta > 0 ? `+${report.weightDelta}` : report.weightDelta} kg</p>
            </div>

            <div className="rounded-2xl bg-purple-50/80 p-3.5 border border-purple-100">
              <p className="text-xs font-semibold uppercase text-purple-800">IMC (BMI)</p>
              <p className="display mt-1 text-2xl font-bold text-purple-900">{report.bmi}</p>
              <p className="text-xs text-purple-700">Obiectiv: {report.profile.goal}</p>
            </div>
          </div>

          {/* Detailed Daily Breakdown Table */}
          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">
              Istoric Zilnic ({report.days} Zile)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2.5">Data</th>
                    <th className="px-3 py-2.5">Calorii</th>
                    <th className="px-3 py-2.5">Proteine</th>
                    <th className="px-3 py-2.5">Carbohidrați</th>
                    <th className="px-3 py-2.5">Grăsimi</th>
                    <th className="px-3 py-2.5">Apă (ml)</th>
                    <th className="px-3 py-2.5">Greutate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.rows.map((row) => (
                    <tr key={row.date} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 font-medium">{row.date}</td>
                      <td className="px-3 py-2 font-semibold text-emerald-800">
                        {row.kcal > 0 ? `${row.kcal} kcal` : "—"}
                      </td>
                      <td className="px-3 py-2">{row.protein > 0 ? `${row.protein}g` : "—"}</td>
                      <td className="px-3 py-2">{row.carbs > 0 ? `${row.carbs}g` : "—"}</td>
                      <td className="px-3 py-2">{row.fat > 0 ? `${row.fat}g` : "—"}</td>
                      <td className="px-3 py-2">{row.waterMl > 0 ? `${row.waterMl} ml` : "—"}</td>
                      <td className="px-3 py-2 font-medium text-blue-900">
                        {row.weightKg ? `${row.weightKg} kg` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Notes for Doctor/Nutritionist */}
          <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-xs text-gray-600">
            <p className="font-semibold text-gray-800">Observații & Note Nutriționale:</p>
            <p className="mt-1 italic">
              Raport generat din aplicația Farfurie pe baza jurnalizării zilnice a pacientului. Toate caloriile sunt calculate pe porții reale și produse din magazinele din România.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
