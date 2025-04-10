import React from 'react';
import { Building2, Calendar, MapPin, Trophy, Code } from 'lucide-react';

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

interface ExperienceCardProps {
  experience: Experience;
  isDarkMode?: boolean;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, isDarkMode = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 ${
      isDarkMode ? 'bg-gray-700' : 'bg-white'
    }`}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          {experience.companyLogo && (
            <img
              src={experience.companyLogo}
              alt={experience.company}
              className="w-12 h-12 object-contain mr-4"
            />
          )}
          <div>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{experience.title}</h3>
            <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <Building2 className="w-4 h-4 mr-2" />
              <span>{experience.company}</span>
            </div>
          </div>
        </div>

        <div className={`flex items-center mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <MapPin className="w-4 h-4 mr-2" />
          <span>{experience.location}</span>
        </div>

        <div className={`flex items-center mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {formatDate(experience.startDate)} - {experience.current ? 'Present' : formatDate(experience.endDate!)}
          </span>
        </div>

        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{experience.description}</p>

        {experience.responsibilities.length > 0 && (
          <div className="mb-4">
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Key Responsibilities:</h4>
            <ul className={`list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {experience.responsibilities.map((responsibility, index) => (
                <li key={index}>{responsibility}</li>
              ))}
            </ul>
          </div>
        )}

        {experience.achievements.length > 0 && (
          <div className="mb-4">
            <h4 className={`font-semibold mb-2 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
              Achievements:
            </h4>
            <ul className={`list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {experience.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}

        {experience.technologies.length > 0 && (
          <div>
            <h4 className={`font-semibold mb-2 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <Code className="w-4 h-4 mr-2 text-blue-500" />
              Technologies:
            </h4>
            <div className="flex flex-wrap gap-2">
              {experience.technologies.map((tech, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isDarkMode
                      ? 'bg-gray-600 text-gray-200'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceCard; 