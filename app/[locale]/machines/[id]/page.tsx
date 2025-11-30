"use client";

import { use } from "react";
import { MachineDetail } from "@/components/machines/machine-detail";

export default function MachineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <MachineDetail machineId={resolvedParams.id} />;
}

