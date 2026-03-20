import React from 'react';
import { MapPin, Briefcase, Building, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  description: string;
}

interface JobCardProps {
  job: Job;
  onApply: (id: number) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h3>
          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
            <Building size={16} className="mr-2" />
            <span>{job.company}</span>
          </div>
          <div className="flex flex-wrap items-center text-gray-500 dark:text-gray-400 mb-4 text-sm gap-y-2">
            <div className="flex items-center mr-4">
              <MapPin size={16} className="mr-2" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center mr-4">
              <Briefcase size={16} className="mr-2" />
              <span>{job.type}</span>
            </div>
            {job.salary && (
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <IndianRupee size={16} className="mr-1" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{job.description}</p>
      <button
        onClick={() => onApply(job.id)}
        disabled={!user}
        className={`w-full py-2 px-4 rounded-md transition-colors duration-300 ${
          user
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        {user ? 'Apply Now' : 'Login to Apply'}
      </button>
    </div>
  );
};

export default JobCard;
