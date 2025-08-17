import React, { createContext, useContext, useReducer, useEffect } from "react";
import { taskService } from "@services/taskService";
import { socketService } from "@services/socketService";
import toast from "react-hot-toast";

const TaskContext = createContext(null);

const initialState = {
  tasks: [],
  projects: [],
  teamMembers: [],
  currentProject: null,
  isLoading: false,
  filters: {
    status: "all",
    priority: "all",
    assignee: "all",
    project: "all",
  },
  columns: [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inprogress", title: "In Progress", tasks: [] },
    { id: "review", title: "Review", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ],
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload] };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        ),
      };
    case "SET_TEAM_MEMBERS":
      return { ...state, teamMembers: action.payload };
    case "SET_CURRENT_PROJECT":
      return { ...state, currentProject: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "UPDATE_COLUMNS":
      return { ...state, columns: action.payload };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  useEffect(() => {
    // Initialize socket connection
    socketService.connect();

    // Socket event listeners
    socketService.onTaskCreated((task) => {
      dispatch({ type: "ADD_TASK", payload: task });
      toast.success("New task created");
    });

    socketService.onTaskUpdated((task) => {
      dispatch({ type: "UPDATE_TASK", payload: task });
    });

    socketService.onTaskDeleted((taskId) => {
      dispatch({ type: "DELETE_TASK", payload: taskId });
      toast.success("Task deleted");
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Update columns when tasks change
  useEffect(() => {
    const newColumns = state.columns.map((column) => ({
      ...column,
      tasks: state.tasks.filter((task) => task.status === column.id),
    }));
    dispatch({ type: "UPDATE_COLUMNS", payload: newColumns });
  }, [state.tasks]);

  // Fetch initial data
  const fetchTasks = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const tasks = await taskService.getTasks();
      dispatch({ type: "SET_TASKS", payload: tasks });
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const fetchProjects = async () => {
    try {
      const projects = await taskService.getProjects();
      dispatch({ type: "SET_PROJECTS", payload: projects });
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const members = await taskService.getTeamMembers();
      dispatch({ type: "SET_TEAM_MEMBERS", payload: members });
    } catch (error) {
      toast.error("Failed to fetch team members");
    }
  };

  // Task operations
  const createTask = async (taskData) => {
    try {
      const task = await taskService.createTask(taskData);
      dispatch({ type: "ADD_TASK", payload: task });
      toast.success("Task created successfully");
      return task;
    } catch (error) {
      toast.error("Failed to create task");
      throw error;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const task = await taskService.updateTask(taskId, taskData);
      dispatch({ type: "UPDATE_TASK", payload: task });
      toast.success("Task updated successfully");
      return task;
    } catch (error) {
      toast.error("Failed to update task");
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      dispatch({ type: "DELETE_TASK", payload: taskId });
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
      throw error;
    }
  };

  // Project operations
  const createProject = async (projectData) => {
    try {
      const project = await taskService.createProject(projectData);
      dispatch({ type: "ADD_PROJECT", payload: project });
      toast.success("Project created successfully");
      return project;
    } catch (error) {
      toast.error("Failed to create project");
      throw error;
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const project = await taskService.updateProject(projectId, projectData);
      dispatch({ type: "UPDATE_PROJECT", payload: project });
      toast.success("Project updated successfully");
      return project;
    } catch (error) {
      toast.error("Failed to update project");
      throw error;
    }
  };

  // Filters
  const setFilters = (newFilters) => {
    dispatch({ type: "SET_FILTERS", payload: newFilters });
  };

  const setCurrentProject = (project) => {
    dispatch({ type: "SET_CURRENT_PROJECT", payload: project });
  };

  // Filtered tasks based on current filters
  const getFilteredTasks = () => {
    return state.tasks.filter((task) => {
      if (
        state.filters.status !== "all" &&
        task.status !== state.filters.status
      )
        return false;
      if (
        state.filters.priority !== "all" &&
        task.priority !== state.filters.priority
      )
        return false;
      if (
        state.filters.assignee !== "all" &&
        task.assignee !== parseInt(state.filters.assignee)
      )
        return false;
      if (
        state.filters.project !== "all" &&
        task.projectId !== parseInt(state.filters.project)
      )
        return false;
      return true;
    });
  };

  const value = {
    ...state,
    fetchTasks,
    fetchProjects,
    fetchTeamMembers,
    createTask,
    updateTask,
    deleteTask,
    createProject,
    updateProject,
    setFilters,
    setCurrentProject,
    getFilteredTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
