import {
  JOB_SOURCE_REGISTRY,
  type JobSourceMeta,
} from "@/lib/jobs/source-registry";

export type JobSourceDefinition = JobSourceMeta;

export const jobSources = JOB_SOURCE_REGISTRY;

export { DEFAULT_SELECTED_SOURCE_IDS } from "@/lib/jobs/source-registry";
