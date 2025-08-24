import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-full opacity-20 animate-pulse"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 bg-primary-500 dark:bg-primary-600 rounded-full flex items-center justify-center">
                <HelpCircle className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="btn-primary flex items-center justify-center space-x-2 flex-1"
            >
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="btn-outline flex items-center justify-center space-x-2 flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Search Suggestion */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Looking for something specific? Try searching:
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Search tasks, projects, or team members..."
                />
              </div>
              <button className="btn-primary">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Popular Links */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Popular pages:</p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/board"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 p-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              Task Board
            </Link>
            <Link
              to="/projects"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 p-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/team"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 p-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              Team
            </Link>
            <Link
              to="/calendar"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 p-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              Calendar
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Still need help?
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/help"
              className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors"
            >
              Help Center
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link
              to="/contact"
              className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors"
            >
              Contact Support
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link
              to="/feedback"
              className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors"
            >
              Send Feedback
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Elements for Visual Appeal */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-primary-300 dark:bg-primary-600 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-yellow-300 dark:bg-yellow-600 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-20 left-20 w-5 h-5 bg-green-300 dark:bg-green-600 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 right-10 w-3 h-3 bg-purple-300 dark:bg-purple-600 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
    </div>
  );
};

export default NotFound;