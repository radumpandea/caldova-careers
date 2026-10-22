/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

/** Return jobs sorted by posted date, newest first (does not mutate input). */
export function sortByNewest(jobs: Job[]): Job[] {
    return [...jobs].sort(
        (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
    );
}

/**
 * Format an ISO-8601 date as a human-readable posted date,
 * e.g. "January 5, 2027". Falls back to the raw value if unparseable.
 */
export function formatPostedDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

/**
 * Selected role filters.
 *
 * An empty or missing value means "All" for that filter.
 */
export interface JobFilters {
    department?: string;
    location?: string;
}

/**
 * Get the department names offered by the filter.
 *
 * @param jobs - The jobs to read departments from.
 * @returns Sorted, unique department names.
 */
export function getDepartments(jobs: Job[]): string[] {
    return [...new Set(jobs.map((job) => job.department))].sort((a, b) => a.localeCompare(b));
}

/**
 * Get the locations offered by the filter.
 *
 * @param jobs - The jobs to read locations from.
 * @returns Sorted, unique locations.
 */
export function getLocations(jobs: Job[]): string[] {
    return [...new Set(jobs.map((job) => job.location))].sort((a, b) => a.localeCompare(b));
}

/**
 * Filter jobs by department and location.
 *
 * @param jobs - The jobs to filter.
 * @param filters - Selected filters; a job must match every non-empty filter (AND).
 * @returns The matching jobs, or all jobs when no filter is selected.
 */
export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
    const { department, location } = filters;
    return jobs.filter(
        (job) =>
            (!department || job.department === department) &&
            (!location || job.location === location),
    );
}

/**
 * Read role filters from URL search params.
 *
 * @param params - The URL search params, e.g. `?department=Finance`.
 * @param jobs - The jobs whose departments and locations are valid values.
 * @returns Filters with unknown values replaced by an empty string ("All").
 */
export function parseJobFilters(params: URLSearchParams, jobs: Job[]): JobFilters {
    const department = params.get('department') ?? '';
    const location = params.get('location') ?? '';
    return {
        department: getDepartments(jobs).includes(department) ? department : '',
        location: getLocations(jobs).includes(location) ? location : '',
    };
}
