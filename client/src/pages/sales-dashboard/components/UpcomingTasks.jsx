import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const UpcomingTasks = () => {
  const [tasks, setTasks] = useState([
  {
    id: 1,
    title: 'Follow up with Acme Corp',
    description: 'Send pricing proposal and schedule demo',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    priority: 'high',
    type: 'follow_up',
    contact: 'John Smith',
    company: 'Acme Corporation',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    completed: false
  },
  {
    id: 2,
    title: 'Demo call with FutureTech',
    description: 'Product demonstration and Q&A session',
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    priority: 'high',
    type: 'meeting',
    contact: 'Lisa Thompson',
    company: 'FutureTech Solutions',
    avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
    completed: false
  },
  {
    id: 3,
    title: 'Send contract to MegaCorp',
    description: 'Final contract review and signature',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    priority: 'medium',
    type: 'document',
    contact: 'David Wilson',
    company: 'MegaCorp Industries',
    avatar: 'https://randomuser.me/api/portraits/men/72.jpg',
    completed: false
  },
  {
    id: 4,
    title: 'Quarterly review with Global Systems',
    description: 'Review implementation progress and next steps',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    priority: 'medium',
    type: 'meeting',
    contact: 'Michael Chen',
    company: 'Global Systems Ltd',
    avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    completed: false
  },
  {
    id: 5,
    title: 'Update CRM for TechStart deal',
    description: 'Add meeting notes and next action items',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    priority: 'low',
    type: 'admin',
    contact: 'Sarah Johnson',
    company: 'TechStart Inc',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    completed: false
  }]
  );

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-error-50 text-error border-error-200',
      medium: 'bg-accent-50 text-accent border-accent-200',
      low: 'bg-success-50 text-success border-success-200'
    };
    return colors[priority] || colors.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      follow_up: 'Phone',
      meeting: 'Video',
      document: 'FileText',
      admin: 'Settings'
    };
    return icons[type] || 'Circle';
  };

  const formatDueDate = (date) => {
    const now = new Date();
    const diffInHours = Math.ceil((date - now) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Due now';
    } else if (diffInHours < 24) {
      return `Due in ${diffInHours}h`;
    } else {
      const diffInDays = Math.ceil(diffInHours / 24);
      return `Due in ${diffInDays}d`;
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const isOverdue = (date) => {
    return new Date() > date;
  };

  const sortedTasks = tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed - b.completed;
    }
    return a.dueDate - b.dueDate;
  });

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Upcoming Tasks</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">
            {tasks.filter((t) => !t.completed).length} pending
          </span>
          <button className="text-sm text-primary hover:text-primary-700 transition-colors duration-150">
            View All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTasks.slice(0, 6).map((task) =>
        <div
          key={task.id}
          className={`p-3 rounded-lg border transition-all duration-150 ${
          task.completed ?
          'bg-gray-50 border-gray-200 opacity-60' : 'bg-surface border-border hover:shadow-sm'}`
          }>

            <div className="flex items-start space-x-3">
              {/* Checkbox */}
              <button
              onClick={() => toggleTaskCompletion(task.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
              task.completed ?
              'bg-success border-success text-white' : 'border-border hover:border-primary'}`
              }>

                {task.completed && <Icon name="Check" size={12} />}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name={getTypeIcon(task.type)} size={14} className="text-text-secondary" />
                  <h4 className={`text-sm font-medium ${
                task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`
                }>
                    {task.title}
                  </h4>
                </div>

                <p className={`text-xs mb-2 ${
              task.completed ? 'text-text-tertiary' : 'text-text-secondary'}`
              }>
                  {task.description}
                </p>

                {/* Contact Info */}
                <div className="flex items-center space-x-2 mb-2">
                  <Image
                  src={task.avatar}
                  alt={task.contact}
                  className="w-4 h-4 rounded-full object-cover" />

                  <span className="text-xs text-text-secondary">
                    {task.contact} • {task.company}
                  </span>
                </div>

                {/* Due Date and Priority */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                isOverdue(task.dueDate) && !task.completed ?
                'text-error font-medium' : 'text-text-tertiary'}`
                }>
                    {formatDueDate(task.dueDate)}
                  </span>
                  
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-sm text-text-secondary hover:text-primary transition-colors duration-150 flex items-center justify-center space-x-2">
          <Icon name="Plus" size={16} />
          <span>Add New Task</span>
        </button>
      </div>
    </div>);

};

export default UpcomingTasks;