import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import Breadcrumb from 'components/ui/Breadcrumb';
import Icon from 'components/AppIcon';

import DealForm from './components/DealForm';
import ActivityTimeline from './components/ActivityTimeline';
import DocumentsSection from './components/DocumentsSection';
import DealActions from './components/DealActions';

const DealManagement = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Mock deals data
  const mockDeals = [
    {
      id: 1,
      name: "Enterprise Software License - TechCorp",
      value: 125000,
      probability: 75,
      stage: "proposal",
      expectedCloseDate: "2024-02-15",
      assignedTo: "John Smith",
      contactId: 1,
      companyId: 1,
      description: `TechCorp is looking to upgrade their existing software infrastructure with our enterprise solution. They have a team of 500+ employees and need comprehensive licensing with advanced security features.

The deal includes implementation services, training for their IT team, and 24/7 premium support for the first year. They're particularly interested in our API integration capabilities and custom reporting features.`,
      customFields: {
        leadSource: "Website",
        industry: "Technology",
        competitorAnalysis: "Competing against Salesforce and HubSpot",
        decisionMakers: "CTO, IT Director, Procurement Manager"
      },
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-28T14:30:00Z"
    },
    {
      id: 2,
      name: "Marketing Automation Platform - GrowthCo",
      value: 85000,
      probability: 60,
      stage: "negotiation",
      expectedCloseDate: "2024-02-28",
      assignedTo: "Sarah Johnson",
      contactId: 2,
      companyId: 2,
      description: `GrowthCo wants to implement our marketing automation platform to streamline their lead nurturing process. They currently use multiple disconnected tools and are looking for a unified solution.

The implementation will include email marketing, lead scoring, campaign management, and integration with their existing CRM. They have expressed interest in our advanced analytics and A/B testing capabilities.`,
      customFields: {
        leadSource: "Referral",
        industry: "Marketing",
        competitorAnalysis: "Evaluating against Marketo and Pardot",
        decisionMakers: "CMO, Marketing Director, VP Sales"
      },
      createdAt: "2024-01-05T09:15:00Z",
      updatedAt: "2024-01-27T16:45:00Z"
    }
  ];

  // Mock contacts data
  const mockContacts = [
    {
      id: 1,
      name: "Michael Chen",
      email: "michael.chen@techcorp.com",
      phone: "+1 (555) 123-4567",
      title: "Chief Technology Officer",
      company: "TechCorp Solutions"
    },
    {
      id: 2,
      name: "Emily Rodriguez",
      email: "emily.r@growthco.com",
      phone: "+1 (555) 987-6543",
      title: "Chief Marketing Officer",
      company: "GrowthCo Marketing"
    }
  ];

  // Mock activities data
  const mockActivities = [
    {
      id: 1,
      type: "email",
      title: "Sent proposal document",
      description: "Forwarded the comprehensive proposal including pricing breakdown and implementation timeline",
      timestamp: "2024-01-28T14:30:00Z",
      user: "John Smith",
      dealId: 1
    },
    {
      id: 2,
      type: "call",
      title: "Discovery call with CTO",
      description: "45-minute call discussing technical requirements, integration needs, and security compliance",
      timestamp: "2024-01-26T10:00:00Z",
      user: "John Smith",
      dealId: 1
    },
    {
      id: 3,
      type: "meeting",
      title: "Product demo session",
      description: "Live demonstration of key features including API capabilities and custom reporting dashboard",
      timestamp: "2024-01-24T15:00:00Z",
      user: "John Smith",
      dealId: 1
    },
    {
      id: 4,
      type: "note",
      title: "Competitor analysis update",
      description: "Client mentioned they\\\\'re also evaluating Salesforce. Need to emphasize our superior API flexibility and cost-effectiveness",
      timestamp: "2024-01-22T11:30:00Z",
      user: "John Smith",
      dealId: 1
    },
    {
      id: 5,
      type: "email",
      title: "Follow-up on pricing questions",
      description: "Addressed concerns about implementation costs and provided detailed breakdown of services included",
      timestamp: "2024-01-27T16:45:00Z",
      user: "Sarah Johnson",
      dealId: 2
    }
  ];

  // Mock documents data
  const mockDocuments = [
    {
      id: 1,
      name: "Enterprise_Proposal_TechCorp_v2.pdf",
      size: "2.4 MB",
      type: "pdf",
      uploadedAt: "2024-01-28T14:30:00Z",
      uploadedBy: "John Smith",
      dealId: 1
    },
    {
      id: 2,
      name: "Technical_Requirements_Document.docx",
      size: "1.8 MB",
      type: "docx",
      uploadedAt: "2024-01-26T09:15:00Z",
      uploadedBy: "Michael Chen",
      dealId: 1
    },
    {
      id: 3,
      name: "Implementation_Timeline.xlsx",
      size: "856 KB",
      type: "xlsx",
      uploadedAt: "2024-01-24T16:20:00Z",
      uploadedBy: "John Smith",
      dealId: 1
    }
  ];

  const stages = [
    { value: "lead", label: "Lead", color: "bg-gray-100 text-gray-800" },
    { value: "qualified", label: "Qualified", color: "bg-blue-100 text-blue-800" },
    { value: "proposal", label: "Proposal", color: "bg-yellow-100 text-yellow-800" },
    { value: "negotiation", label: "Negotiation", color: "bg-orange-100 text-orange-800" },
    { value: "closed-won", label: "Closed Won", color: "bg-green-100 text-green-800" },
    { value: "closed-lost", label: "Closed Lost", color: "bg-red-100 text-red-800" }
  ];

  const salesReps = [
    { value: "john-smith", label: "John Smith" },
    { value: "sarah-johnson", label: "Sarah Johnson" },
    { value: "mike-davis", label: "Mike Davis" },
    { value: "lisa-chen", label: "Lisa Chen" }
  ];

  useEffect(() => {
    // Simulate loading deal data
    setIsLoading(true);
    setTimeout(() => {
      const deal = mockDeals.find(d => d.id === parseInt(dealId)) || mockDeals[0];
      setSelectedDeal(deal);
      setIsLoading(false);
    }, 500);
  }, [dealId]);

  const handleSaveDeal = async (dealData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSelectedDeal({ ...selectedDeal, ...dealData });
      console.log('Deal saved:', dealData);
    } catch (error) {
      console.error('Error saving deal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDeal = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/sales-dashboard');
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  const handleCloneDeal = () => {
    const clonedDeal = {
      ...selectedDeal,
      id: Date.now(),
      name: `${selectedDeal.name} (Copy)`,
      stage: "lead",
      probability: 10,
      createdAt: new Date().toISOString()
    };
    console.log('Deal cloned:', clonedDeal);
  };

  const handleCreateTask = () => {
    console.log('Creating task for deal:', selectedDeal.id);
  };

  const getActivitiesForDeal = (dealId) => {
    return mockActivities.filter(activity => activity.dealId === dealId);
  };

  const getDocumentsForDeal = (dealId) => {
    return mockDocuments.filter(doc => doc.dealId === dealId);
  };

  const getContactForDeal = (contactId) => {
    return mockContacts.find(contact => contact.id === contactId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-96">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-text-secondary">Loading deal...</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!selectedDeal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb />
              <div className="text-center py-12">
                <Icon name="AlertCircle" size={48} className="text-text-tertiary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-text-primary mb-2">Deal Not Found</h2>
                <p className="text-text-secondary mb-6">The deal you're looking for doesn't exist or has been removed.</p>
                <button
                  onClick={() => navigate('/sales-dashboard')}
                  className="btn-primary"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  {selectedDeal.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  <span>Deal ID: #{selectedDeal.id}</span>
                  <span>•</span>
                  <span>Created: {new Date(selectedDeal.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Last updated: {new Date(selectedDeal.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <DealActions
                onSave={() => handleSaveDeal(selectedDeal)}
                onDelete={() => setShowDeleteModal(true)}
                onClone={handleCloneDeal}
                onCreateTask={handleCreateTask}
                isSaving={isSaving}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left Panel - Deal Form */}
              <div className="xl:col-span-8">
                <DealForm
                  deal={selectedDeal}
                  contacts={mockContacts}
                  stages={stages}
                  salesReps={salesReps}
                  onSave={handleSaveDeal}
                  isSaving={isSaving}
                />
              </div>

              {/* Right Panel - Activity & Documents */}
              <div className="xl:col-span-4 space-y-6">
                <ActivityTimeline
                  activities={getActivitiesForDeal(selectedDeal.id)}
                  contact={getContactForDeal(selectedDeal.contactId)}
                />
                
                <DocumentsSection
                  documents={getDocumentsForDeal(selectedDeal.id)}
                  dealId={selectedDeal.id}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-error-50 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Delete Deal</h3>
            </div>
            
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete "{selectedDeal.name}"? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDeal}
                className="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:bg-error-600 transition-colors duration-150"
              >
                Delete Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealManagement;