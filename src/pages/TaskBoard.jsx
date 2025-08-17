import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useTask } from "@context/TaskContext";
import { Filter, Search, Plus } from "lucide-react";
import TaskCard from "@components/tasks/TaskCard";
import TaskFilters from "@components/tasks/TaskFilters";
import CreateTaskModal from "@components/tasks/CreateTaskModal";
import TaskDetailsModal from "@components/tasks/TaskDetailsModal";

const TaskBoard = () => {
  const {
    columns,
    tasks,
    projects,
    teamMembers,
    filters,
    fetchTasks,
    fetchProjects,
    fetchTeamMembers,
    updateTask,
    setFilters,
    getFilteredTasks,
  } = useTask();

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const taskId = parseInt(draggableId);
    const task = tasks.find((t) => t.id === taskId);

    if (task && task.status !== destination.droppableId) {
      try {
        await updateTask(taskId, {
          ...task,
          status: destination.droppableId,
        });
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = getFilteredTasks().filter((task) => {
    if (!searchQuery) return true;
    return (
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Update columns with filtered tasks
  const updatedColumns = columns.map((column) => ({
    ...column,
    tasks: filteredTasks.filter((task) => task.status === column.id),
  }));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
            <p className="text-gray-600 mt-1">
              Manage your tasks with drag-and-drop simplicity
            </p>
          </div>
          <button
            onClick={() => setShowCreateTask(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex items-center space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors ${
              showFilters
                ? "bg-primary-50 border-primary-200 text-primary-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {Object.values(filters).some((filter) => filter !== "all") && (
              <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <TaskFilters
              filters={filters}
              setFilters={setFilters}
              projects={projects}
              teamMembers={teamMembers}
            />
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
          <span>Total: {filteredTasks.length} tasks</span>
          {Object.values(filters).some((filter) => filter !== "all") && (
            <span>Filtered from {tasks.length} total tasks</span>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 pb-6 min-w-max">
            {updatedColumns.map((column) => (
              <div key={column.id} className="w-80 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                  {/* Column Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900">
                        {column.title}
                      </h2>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {column.tasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Content */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-4 space-y-3 min-h-0 transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-primary-50"
                            : "bg-gray-50"
                        }`}
                      >
                        {column.tasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  isDragging={snapshot.isDragging}
                                  onClick={() => setSelectedTask(task)}
                                  teamMembers={teamMembers}
                                  projects={projects}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Empty state */}
                        {column.tasks.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <div className="text-sm">
                              No tasks in {column.title.toLowerCase()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default TaskBoard;
