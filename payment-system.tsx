import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Clock, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const PaymentSystem = () => {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: "TechCorp Inc",
      amount: 5000,
      frequency: "monthly",
      billingDay: 15,
      projectKickoff: "2024-01-15",
      status: "active",
      lastPayment: "2025-04-15",
      nextPayment: "2025-05-15"
    },
    {
      id: 2,
      name: "StartupXYZ",
      amount: 12000,
      frequency: "quarterly",
      billingDay: 1,
      projectKickoff: "2024-03-01",
      status: "active",
      lastPayment: "2025-03-01",
      nextPayment: "2025-06-01"
    },
    {
      id: 3,
      name: "Enterprise Solutions",
      amount: 8000,
      frequency: "monthly",
      billingDay: 28,
      projectKickoff: "2024-02-28",
      status: "active",
      lastPayment: "2025-04-28",
      nextPayment: "2025-05-28"
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    billingDay: '',
    projectKickoff: '',
    status: 'active'
  });

  const [currentView, setCurrentView] = useState('dashboard');

  // Calculate next payment date based on frequency and billing day
  const calculateNextPayment = (lastPayment, frequency, billingDay) => {
    const last = new Date(lastPayment);
    let next = new Date(last);
    
    if (frequency === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else if (frequency === 'quarterly') {
      next.setMonth(next.getMonth() + 3);
    }
    
    next.setDate(billingDay);
    return next.toISOString().split('T')[0];
  };

  // Get payments due in the next 7 days
  const getUpcomingPayments = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return clients.filter(client => {
      const nextPayment = new Date(client.nextPayment);
      return nextPayment >= today && nextPayment <= nextWeek && client.status === 'active';
    });
  };

  // Get overdue payments
  const getOverduePayments = () => {
    const today = new Date();
    return clients.filter(client => {
      const nextPayment = new Date(client.nextPayment);
      return nextPayment < today && client.status === 'active';
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newClient = {
      ...formData,
      id: editingClient ? editingClient.id : Date.now(),
      amount: parseFloat(formData.amount),
      billingDay: parseInt(formData.billingDay),
      lastPayment: formData.projectKickoff,
      nextPayment: calculateNextPayment(formData.projectKickoff, formData.frequency, parseInt(formData.billingDay))
    };

    if (editingClient) {
      setClients(clients.map(client => 
        client.id === editingClient.id ? newClient : client
      ));
    } else {
      setClients([...clients, newClient]);
    }

    setFormData({
      name: '',
      amount: '',
      frequency: 'monthly',
      billingDay: '',
      projectKickoff: '',
      status: 'active'
    });
    setShowForm(false);
    setEditingClient(null);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      amount: client.amount.toString(),
      frequency: client.frequency,
      billingDay: client.billingDay.toString(),
      projectKickoff: client.projectKickoff,
      status: client.status
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== id));
    }
  };

  const markAsPaid = (clientId) => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        const today = new Date().toISOString().split('T')[0];
        return {
          ...client,
          lastPayment: today,
          nextPayment: calculateNextPayment(today, client.frequency, client.billingDay)
        };
      }
      return client;
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilPayment = (nextPayment) => {
    const today = new Date();
    const payment = new Date(nextPayment);
    const diffTime = payment - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingPayments = getUpcomingPayments();
  const overduePayments = getOverduePayments();
  const totalMonthlyRevenue = clients
    .filter(c => c.status === 'active')
    .reduce((sum, client) => {
      return sum + (client.frequency === 'monthly' ? client.amount : client.amount / 3);
    }, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Management System</h1>
              <p className="text-gray-600 mt-1">Manage client billing cycles and payment tracking</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('clients')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentView === 'clients' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Clients
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Client
              </button>
            </div>
          </div>
        </div>

        {currentView === 'dashboard' && (
          <div className="p-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="text-blue-600" size={24} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalMonthlyRevenue)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600" size={24} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Active Clients</p>
                    <p className="text-2xl font-bold text-green-600">{clients.filter(c => c.status === 'active').length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="text-yellow-600" size={24} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-900">Upcoming (7 days)</p>
                    <p className="text-2xl font-bold text-yellow-600">{upcomingPayments.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="text-red-600" size={24} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-900">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{overduePayments.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overdue Payments */}
            {overduePayments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Overdue Payments
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-red-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-red-900 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-red-900 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-red-900 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-red-900 uppercase tracking-wider">Days Overdue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-red-900 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-red-200">
                        {overduePayments.map((client) => (
                          <tr key={client.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(client.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(client.nextPayment)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              {Math.abs(getDaysUntilPayment(client.nextPayment))} days
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => markAsPaid(client.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                              >
                                Mark Paid
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Payments */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Upcoming Payments (Next 7 Days)
              </h2>
              {upcomingPayments.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">No payments due in the next 7 days</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Until</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {upcomingPayments.map((client) => (
                          <tr key={client.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(client.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(client.nextPayment)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getDaysUntilPayment(client.nextPayment)} days
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                client.frequency === 'monthly' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {client.frequency}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => markAsPaid(client.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                              >
                                Mark Paid
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'clients' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Clients</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(client.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            client.frequency === 'monthly' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {client.frequency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Day {client.billingDay}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(client.lastPayment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(client.nextPayment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Client Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Day of Month (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.billingDay}
                    onChange={(e) => setFormData({...formData, billingDay: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Kickoff Date
                  </label>
                  <input
                    type="date"
                    value={formData.projectKickoff}
                    onChange={(e) => setFormData({...formData, projectKickoff: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClient(null);
                    setFormData({
                      name: '',
                      amount: '',
                      frequency: 'monthly',
                      billingDay: '',
                      projectKickoff: '',
                      status: 'active'
                    });
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSystem;