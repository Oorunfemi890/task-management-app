import React from "react";
import { FolderOpen, TrendingUp } from "lucide-react";

const ProjectProgress = ({ projects, tasks }) => {
  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter((task) => task.projectId === projectId);
    const completedTasks = projectTasks.filter(
      (task) => task.status === "done"
    );
    const totalTasks = projectTasks.length;

    return {
      total: totalTasks,
      completed: completedTasks.length,
      progress:
        totalTasks > 0
          ? Math.round((completedTasks.length / totalTasks) * 100)
          : 0,
    };
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8">
        <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No projects found</p>
        <p className="text-sm text-gray-500">
          Create a project to track progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.slice(0, 5).map((project) => {
        const progress = getProjectProgress(project.id);

        return (
          <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {project.name}
              </h4>
              <span className="text-sm text-gray-600">
                {progress.completed}/{progress.total} tasks
              </span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-medium text-gray-900">
                {progress.progress}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress.progress >= 75
                    ? "bg-green-500"
                    : progress.progress >= 50
                    ? "bg-blue-500"
                    : progress.progress >= 25
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>

            {project.dueDate && (
              <div className="mt-2 text-xs text-gray-500">
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      })}

      {projects.length > 5 && (
        <div className="text-center pt-2">
          <button className="text-sm text-primary-600 hover:text-primary-500">
            View all projects ({projects.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectProgress;
