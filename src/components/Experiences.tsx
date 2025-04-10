import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExperienceCard from './ExperienceCard';
import { Briefcase } from 'lucide-react';

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  companyLogo?: string;
  achievements: string[];
}

interface ExperiencesProps {
  isDarkMode?: boolean;
}

const Experiences: React.FC<ExperiencesProps> = ({ isDarkMode = false }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/experiences');
        setExperiences(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch experiences');
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className={`text-3xl font-bold mb-4 flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <Briefcase className="w-8 h-8 mr-2 text-blue-600" />
          Professional Experience
        </h2>
        <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          A timeline of my professional journey, highlighting key roles, responsibilities, and achievements throughout my career.
        </p>
      </div>

      <div className="space-y-8">
        {experiences.map((experience) => (
          <ExperienceCard key={experience._id} experience={experience} isDarkMode={isDarkMode} />
        ))}
      </div>

      {experiences.length === 0 && (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No experience entries available at the moment.
        </div>
      )}
    </div>
  );
};

export default Experiences; 