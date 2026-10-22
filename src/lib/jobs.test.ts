import { describe, it, expect } from 'vitest';
import {
    sortByNewest,
    formatPostedDate,
    getDepartments,
    getLocations,
    filterJobs,
    parseJobFilters,
} from './jobs';
import type { Job } from '../types/job';

function makeJob(slug: string, postedDate: string): Job {
    return {
        slug,
        title: `Role ${slug}`,
        department: 'Technology',
        location: 'Remote',
        type: 'Full-time',
        remote: true,
        postedDate,
        summary: 'A role.',
    };
}

describe('sortByNewest', () => {
    it('orders jobs by posted date, newest first', () => {
        const jobs = [
            makeJob('a', '2027-01-01'),
            makeJob('b', '2027-03-15'),
            makeJob('c', '2027-02-10'),
        ];
        expect(sortByNewest(jobs).map((j) => j.slug)).toEqual(['b', 'c', 'a']);
    });

    it('does not mutate the input array', () => {
        const jobs = [makeJob('a', '2027-01-01'), makeJob('b', '2027-03-15')];
        const original = jobs.map((j) => j.slug);
        sortByNewest(jobs);
        expect(jobs.map((j) => j.slug)).toEqual(original);
    });
});

describe('formatPostedDate', () => {
    it('formats an ISO date as a readable string', () => {
        expect(formatPostedDate('2027-01-05')).toBe('January 5, 2027');
    });

    it('returns the raw value when the date is unparseable', () => {
        expect(formatPostedDate('not-a-date')).toBe('not-a-date');
    });
});

/**
 * Build a job fixture with a specific department and location.
 *
 * @param slug - The job slug.
 * @param department - The job department.
 * @param location - The job location.
 * @returns A plain `Job` fixture.
 */
function makeJobIn(slug: string, department: string, location: string): Job {
    return { ...makeJob(slug, '2027-01-01'), department, location };
}

describe('role filters', () => {
    const jobs = [
        makeJobIn('a', 'Finance', 'Dallas'),
        makeJobIn('b', 'Finance', 'London'),
        makeJobIn('c', 'Technology', 'London'),
    ];

    it('lists sorted unique departments and locations', () => {
        expect(getDepartments(jobs)).toEqual(['Finance', 'Technology']);
        expect(getLocations(jobs)).toEqual(['Dallas', 'London']);
    });

    it('filters by department', () => {
        expect(filterJobs(jobs, { department: 'Finance' }).map((j) => j.slug)).toEqual(['a', 'b']);
    });

    it('filters by location', () => {
        expect(filterJobs(jobs, { location: 'London' }).map((j) => j.slug)).toEqual(['b', 'c']);
    });

    it('combines department and location', () => {
        expect(
            filterJobs(jobs, { department: 'Finance', location: 'London' }).map((j) => j.slug),
        ).toEqual(['b']);
    });

    it('returns all jobs when filters are reset', () => {
        expect(filterJobs(jobs, {})).toHaveLength(3);
        expect(filterJobs(jobs, { department: '', location: '' })).toHaveLength(3);
    });

    it('returns an empty array when nothing matches', () => {
        expect(filterJobs(jobs, { department: 'Technology', location: 'Dallas' })).toEqual([]);
    });

    it('parses URL params and ignores unknown values', () => {
        const params = new URLSearchParams('department=Finance&location=Nowhere');
        expect(parseJobFilters(params, jobs)).toEqual({ department: 'Finance', location: '' });
    });
});
