import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Target, AlertCircle } from 'lucide-react';
import { useTask } from '@context/TaskContext';
import { useAuth } from '@context/AuthContext';

const CreateProjectModal = ({ isOpen, onClose, project = null }) => {
  const { createProject, updateProject, teamMembers } = useTask();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    teamMembers: [],
    budget: '',
    client: '',
    tags: [],
    goals: ['']
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'not_started',
        priority: project.priority || 'medium',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
        teamMembers: project.teamMembers || [],
        budget: project.budget || '',
        client: project.client || '',
        tags: project.tags || [],
        goals: project.goals || ['']
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'not_started',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        teamMembers: [],
        budget: '',
        client: '',
        tags: [],
        goals: ['']
      });
    }
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTeamMemberChange = (memberId) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter(id => id !== memberId)
        : [...prev.teamMembers, memberId]
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleGoalChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, '']
    }));
  };

  const removeGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (formData.startDate && formData.dueDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);
      if (startDate >= dueDate) {
        newErrors.dueDate = 'Due date must be after start date';
      }
    }

    if (formData.budget && (isNaN(formData.budget) || formData.budget < 0)) {
      newErrors.budget = 'Budget must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        goals: formData.goals.filter(goal => goal.trim() !== ''),
        createdBy: user?.id
      };

      if (project) {
        await updateProject(project.id, projectData);
      } else {
        await createProject(projectData);
      }

      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      case 'low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {project ? 'Edit Project' : 'Create New Project'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {errors.submit && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                  
                  <div className="space-y-4">
                    {/* Project Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`input-field ${errors.name ? 'input-field-error' : ''}`}
                        placeholder="Enter project name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className={`input-field ${errors.description ? 'input-field-error' : ''}`}
                        placeholder="Describe the project goals and objectives"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>

                    {/* Status and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="input-field"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="on_hold">On Hold</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className={`input-field border-2 ${getPriorityColor(formData.priority)}`}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Due Date
                        </label>
                        <input
                          type="date"
                          id="dueDate"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          className={`input-field ${errors.dueDate ? 'input-field-error' : ''}`}
                        />
                        {errors.dueDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                        )}
                      </div>
                    </div>

                    {/* Budget and Client */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                          Budget ($)
                        </label>
                        <input
                          type="number"
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className={`input-field ${errors.budget ? 'input-field-error' : ''}`}
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                        {errors.budget && (
                          <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                          Client
                        </label>
                        <input
                          type="text"
                          id="client"
                          name="client"
                          value={formData.client}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Client name"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Team Members */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    <Users className="inline w-4 h-4 mr-1" />
                    Team Members
                  </h4>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {teamMembers.map((member) => (
                      <label key={member.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.teamMembers.includes(member.id)}
                          onChange={() => handleTeamMemberChange(member.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {member.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{member.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Project Goals */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    <Target className="inline w-4 h-4 mr-1" />
                    Project Goals
                  </h4>
                  
                  <div className="space-y-2">
                    {formData.goals.map((goal, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => handleGoalChange(index, e.target.value)}
                          className="flex-1 input-field"
                          placeholder={`Goal ${index + 1}`}
                        />
                        {formData.goals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGoal(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addGoal}
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      + Add another goal
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Tags</h4>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                      className="flex-1 input-field"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="btn-secondary"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-2" />
                    {project ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  project ? 'Update Project' : 'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;