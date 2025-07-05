import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Edit, 
  Flag, 
  Trash2,
  Star,
  Award,
  Clock,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      name
      email
      age
      department
      position
      salary
      class
      subjects
      attendance
      avatar
      phone
      address
      startDate
      status
      role
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee(
    $id: ID!
    $name: String
    $email: String
    $age: Int
    $department: String
    $position: String
    $salary: Float
    $subjects: [String!]
    $avatar: String
    $phone: String
    $address: String
    $status: String
    $role: Role!
  ) {
    updateEmployee(
      id: $id
      name: $name
      email: $email
      age: $age
      department: $department
      position: $position
      salary: $salary
      subjects: $subjects
      avatar: $avatar
      phone: $phone
      address: $address
      status: $status
      role: $role
    ) {
      id
      name
      email
      role
    }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: Int!) {
    deleteEmployee(id: $id)
  }
`;

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, data } = useQuery(GET_EMPLOYEE, {
    variables: { id },
    skip: !id
  });
  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE, {
    refetchQueries: [
      { query: GET_EMPLOYEE, variables: { id } },
    ],
  });
  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE);

  const employee = data?.employee;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading employee details</p>
          <p className="text-gray-500">{error?.message || 'Employee not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const epoch = Number(dateString);
  
    // If epoch time is in seconds, convert to milliseconds
    const date = new Date(epoch < 1e12 ? epoch * 1000 : epoch);
  
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 95) return 'text-green-600 bg-green-100';
    if (attendance >= 85) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Generate a random date between start and end (in ms)
  const getRandomDateBetween = (start: number, end: number) => {
    return Math.floor(Math.random() * (end - start)) + start;
  };

  const handleEditClick = () => {
    setEditForm({ ...employee });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmployee({
        variables: {
          id: parseInt(employee.id, 10),
          name: editForm.name,
          email: editForm.email,
          age: parseInt(editForm.age, 10),
          department: editForm.department,
          position: editForm.position,
          salary: parseFloat(editForm.salary),
          subjects: editForm.subjects.split(',').map((s: string) => s.trim()).filter(Boolean),
          avatar: editForm.avatar,
          phone: editForm.phone,
          address: editForm.address,
          status: editForm.status,
          role: editForm.role,
        },
      });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update employee:', err);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await deleteEmployee({
          variables: {
            id: parseInt(employee.id, 10),
          },
        });
        navigate('/');
      } catch (err) {
        console.error('Failed to delete employee:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold"
              onClick={() => setShowEditModal(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Edit Employee Details</h2>
            <form className="space-y-4" onSubmit={handleEditSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={editForm?.name || ''} onChange={handleEditChange} required className="input p-2 border border-blue-800 rounded-lg" placeholder="Name" />
                <input name="email" value={editForm?.email || ''} onChange={handleEditChange} required className="input p-2 border border-blue-800 rounded-lg" placeholder="Email" type="email" />
                <input name="age" value={editForm?.age || ''} onChange={handleEditChange} required className="input p-2 border border-blue-800 rounded-lg" placeholder="Age" type="number" />
                <input name="department" value={editForm?.department || ''} onChange={handleEditChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Department" />
                <input name="position" value={editForm?.position || ''} onChange={handleEditChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Position" />
                <input name="salary" value={editForm?.salary || ''} onChange={handleEditChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Salary" type="number" />
                <input
                  name="subjects"
                  value={Array.isArray(editForm?.subjects) ? editForm.subjects.join(', ') : (editForm?.subjects || '')}
                  onChange={handleEditChange}
                  className="input p-2 border border-blue-800 rounded-lg"
                  placeholder="Subjects (comma separated)"
                />
                <input name="avatar" value={editForm?.avatar || ''} onChange={handleEditChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Avatar URL" />
                <input name="phone" value={editForm?.phone || ''} onChange={handleEditChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Phone" />
                <input name="address" value={editForm?.address || ''} onChange={handleEditChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Address" />
                <select name="status" value={editForm?.status || ''} onChange={handleEditChange} className="input p-2 border border-blue-800 rounded-lg">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <select name="role" value={editForm?.role || ''} onChange={handleEditChange} className="input p-2 border border-blue-800 rounded-lg">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all">Save Changes</button>
            </form>
          </motion.div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
            <p className="text-gray-600">View and manage employee information</p>
          </div>
        </div>
        
        {user?.employee?.role === 'ADMIN' && (
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={handleEditClick}>
              <Edit size={16} />
              <span>Edit</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              <Flag size={16} />
              <span>Flag</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" onClick={handleDeleteClick}>
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={employee.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1`}
                  alt={employee.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                />
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
                  employee.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-4">{employee.name}</h2>
              <p className="text-gray-600 mt-1">{employee.position}</p>
              <p className="text-sm text-gray-500 mt-1">{employee.department}</p>
              
              <div className="flex items-center justify-center space-x-4 mt-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Top Performer</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{employee.email}</p>
                  <p className="text-xs text-gray-500">Email</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{employee.phone || 'Not provided'}</p>
                  <p className="text-xs text-gray-500">Phone</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{employee.address || 'Not provided'}</p>
                  <p className="text-xs text-gray-500">Address</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(employee.startDate)}</p>
                  <p className="text-xs text-gray-500">Start Date</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details and Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annual Salary</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${employee.salary?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{employee.attendance}%</p>
                </div>
                <div className={`p-3 rounded-lg ${getAttendanceColor(employee.attendance)}`}>
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${employee.attendance}%` }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Age</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{employee.age}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Employee Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{employee.department}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{employee.position}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(employee.status)}`}>
                  {employee.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                  {Math.floor(Math.random() * 26)} years
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills & Subjects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
            
            <div className="flex flex-wrap gap-2">
              {employee.subjects?.map((subject: string, index: number) => (
                <motion.span
                  key={subject}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                >
                  {subject}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Profile Updated</p>
                  <p className="text-xs text-gray-500">{
                    formatDate(
                      String(
                        getRandomDateBetween(Number(employee.startDate) * 1000, Date.now())
                      )
                    )
                  }</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Joined Company</p>
                  <p className="text-xs text-gray-500">{formatDate(employee.startDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Account Created</p>
                  <p className="text-xs text-gray-500">{formatDate(employee.startDate)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;