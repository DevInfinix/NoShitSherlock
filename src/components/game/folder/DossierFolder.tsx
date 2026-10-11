"use client";

import type { SessionCaseFile } from "@/server/services/game-session-service";
import { CaseFolder } from "./CaseFolder";

export interface DossierFolderProps {
  initialDossier: SessionCaseFile;
}

/**
 * Backward compatibility wrapper forwarding to CaseFolder.
 */
export function DossierFolder({ initialDossier }: DossierFolderProps) {
  return <CaseFolder initialCaseFile={initialDossier} />;
}
