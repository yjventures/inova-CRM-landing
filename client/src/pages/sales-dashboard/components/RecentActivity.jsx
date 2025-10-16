import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const RecentActivity = () => {
  const activities = [
  {
    id: 1,
    type: 'deal_created',
    title: 'New deal created',
    description: 'Enterprise License for Acme Corp',
    user: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    timestamp: '2 hours ago',
    icon: 'Plus',
    iconColor: 'text-success'
  },
  {
    id: 2,
    type: 'deal_moved',
    title: 'Deal stage updated',
    description: 'MegaCorp moved to Negotiation',
    user: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    timestamp: '4 hours ago',
    icon: 'ArrowRight',
    iconColor: 'text-primary'
  },
  {
    id: 3,
    type: 'meeting_scheduled',
    title: 'Meeting scheduled',
    description: 'Demo call with FutureTech Solutions',
    user: 'Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    timestamp: '6 hours ago',
    icon: 'Calendar',
    iconColor: 'text-accent'
  },
  {
    id: 4,
    type: 'email_sent',
    title: 'Proposal sent',
    description: 'Sent pricing proposal to Global Systems',
    user: 'Emily Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    timestamp: '8 hours ago',
    icon: 'Mail',
    iconColor: 'text-secondary'
  },
  {
    id: 5,
    type: 'deal_won',
    title: 'Deal closed won',
    description: 'StartupXYZ - Growth Package ($35K)',
    user: 'David Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/72.jpg',
    timestamp: '1 day ago',
    icon: 'Trophy',
    iconColor: 'text-success'
  },
  {
    id: 6,
    type: 'contact_added',
    title: 'New contact added',
    description: 'Lisa Thompson from FutureTech',
    user: 'Alex Martinez',
    avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
    timestamp: '1 day ago',
    icon: 'UserPlus',
    iconColor: 'text-primary'
  }];


  return (
    <div className="card p-6 hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
        <button className="text-sm text-primary hover:text-primary-700 transition-colors duration-150">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) =>
        <div key={activity.id} className="flex items-start space-x-3">
            {/* Activity Icon */}
            <div className="flex-shrink-0 w-8 h-8 bg-surface-hover rounded-full flex items-center justify-center">
              <Icon name={activity.icon} size={14} className={activity.iconColor} />
            </div>

            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Image
                src={activity.avatar}
                alt={activity.user}
                className="w-4 h-4 rounded-full object-cover" />

                <span className="text-xs font-medium text-text-primary">
                  {activity.user}
                </span>
                <span className="text-xs text-text-tertiary">•</span>
                <span className="text-xs text-text-tertiary">
                  {activity.timestamp}
                </span>
              </div>
              
              <p className="text-sm font-medium text-text-primary mb-1">
                {activity.title}
              </p>
              
              <p className="text-xs text-text-secondary line-clamp-2">
                {activity.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* View More Button */}
      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-sm text-text-secondary hover:text-primary transition-colors duration-150 flex items-center justify-center space-x-2">
          <Icon name="ChevronDown" size={16} />
          <span>Load More Activities</span>
        </button>
      </div>
    </div>);

};

export default RecentActivity;