import React, { useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import { Search, Filter } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  description: string;
}

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('newest');
  const { token } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, [search, type, location, sort]);

  const fetchJobs = async () => {
    try {
      const query = new URLSearchParams({ search, type, location, sort }).toString();
      const response = await fetch(`/api/jobs?${query}`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleApply = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        alert('Application submitted successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to apply');
      }
    } catch (error) {
      alert('Error applying for job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Find Your Next Opportunity</h1>
        
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title or company"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px] relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Filter by location"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <select
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <select
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">Title (A-Z)</option>
              <option value="z-a">Title (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Job List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onApply={handleApply} />
          ))}
          {jobs.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">No jobs found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
