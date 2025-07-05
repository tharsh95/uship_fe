import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gql, useQuery, useMutation } from '@apollo/client';
import { 
  Grid, 
  List, 
  Search, 

  Edit, 
  Flag, 
  Trash2, 
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GET_EMPLOYEES = gql`
  query GetEmployees(
    $page: Int
    $pageSize: Int
  ) {
    employees(
      page: $page
      pageSize: $pageSize
    ) {
      employees {
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
      totalCount
    }
  }
`;

const ADD_EMPLOYEE = gql`
  mutation AddEmployee(
    $name: String!
    $email: String!
    $age: Int!
    $department: String!
    $position: String!
    $salary: Float!
    $class: String!
    $subjects: [String!]!
    $attendance: Float!
    $avatar: String!
    $phone: String!
    $address: String!
    $startDate: Int!
    $status: String!
    $role: Role!
  ) {
    addEmployee(
      name: $name
      email: $email
      age: $age
      department: $department
      position: $position
      salary: $salary
      class: $class
      subjects: $subjects
      attendance: $attendance
      avatar: $avatar
      phone: $phone
      address: $address
      startDate: $startDate
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

const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'tile'>('grid');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    department: '',
    position: '',
    salary: '',
    class: '',
    subjects: '',
    attendance: '',
    avatar: '',
    phone: '',
    address: '',
    startDate: '',
    status: 'active',
    role: 'employee',
  });

  const { user } = useAuth();
  const role = (user?.employee.role);
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_EMPLOYEES, {
    variables: { page, limit: 12, search, department, sortBy, sortOrder },
    fetchPolicy: 'cache-and-network'
  });

  const [addEmployee] = useMutation(ADD_EMPLOYEE, {
    refetchQueries: [
      { query: GET_EMPLOYEES, variables: { page, limit: 12, search, department, sortBy, sortOrder } },
    ],
  });

  const employees = data?.employees?.employees || [];
  const totalCount = data?.employees?.totalCount || 0;
  const hasNextPage = data?.employees?.hasNextPage || false;
  const hasPreviousPage = data?.employees?.hasPreviousPage || false;
  const currentPage = data?.employees?.currentPage || 1;
  const totalPages = data?.employees?.totalPages || 1;

  // Client-side search filtering
  const filteredEmployees = employees.filter((employee: any) => {
    const searchTerm = search.toLowerCase();
    return (
      employee.name?.toLowerCase().includes(searchTerm) ||
      employee.email?.toLowerCase().includes(searchTerm) ||
      employee.department?.toLowerCase().includes(searchTerm) ||
      employee.position?.toLowerCase().includes(searchTerm)
    );
  });

  // Client-side sorting
  const sortedEmployees = [...filteredEmployees].sort((a: any, b: any) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle special cases
    if (sortBy === 'salary' || sortBy === 'age' || sortBy === 'attendance') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'department', label: 'Department' },
    { value: 'salary', label: 'Salary' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'startDate', label: 'Start Date' }
  ];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleEmployeeClick = (id: string) => {
    navigate(`/employee/${id}`);
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleAction = (action: string, employeeId: string) => {
    console.log(`${action} employee:`, employeeId);
    setActiveDropdown(null);
    // Implement actions here
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEmployee({
        variables: {
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age, 10),
          department: formData.department,
          position: formData.position,
          salary: parseFloat(formData.salary),
          class: formData.class,
          subjects: formData.subjects.split(',').map((s: string) => s.trim()).filter(Boolean),
          attendance: parseFloat("100"),
          avatar: formData.avatar,
          phone: formData.phone,
          address: formData.address,
          startDate: Math.floor(Date.now() / 1000),
          status: formData.status,
          role: formData.role.toUpperCase(),
        },
      });
      setShowAddModal(false);
      setFormData({
        name: '', email: '', age: '', department: '', position: '', salary: '', class: '', subjects: '', attendance: '', avatar: '', phone: '', address: '', startDate: '', status: 'active', role: 'employee',
      });
    } catch (err) {
      // Optionally handle error (e.g., show notification)
      console.error('Failed to add employee:', err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );

  const EmployeeCard = ({ employee, index }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => handleEmployeeClick(employee.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={employee.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`}
            alt={employee.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {employee.name}
            </h3>
            <p className="text-sm text-gray-500">{employee.position}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown(employee.id);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
          </button>
          
          <AnimatePresence>
            {activeDropdown === employee.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
              >
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction('view', employee.id);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                  {role === 'ADMIN' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('edit', employee.id);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('flag', employee.id);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center space-x-2"
                      >
                        <Flag size={16} />
                        <span>Flag</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('delete', employee.id);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Department</span>
          <span className="text-sm font-medium">{employee.department}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Salary</span>
          <span className="text-sm font-medium">${employee.salary?.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Attendance</span>
          <span className="text-sm font-medium">{employee.attendance}%</span>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-1">
        {employee.subjects?.slice(0, 3).map((subject: string) => (
          <span
            key={subject}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {subject}
          </span>
        ))}
        {employee.subjects?.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{employee.subjects.length - 3} more
          </span>
        )}
      </div>
    </motion.div>
  );

  const GridView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Department', 'Position', 'Salary', 'Attendance', 'Status',"Role"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(header.toLowerCase())}
                >
                  <div className="flex items-center space-x-1">
                    <span>{header}</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
              ))}
              {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEmployees.map((employee: any, index: number) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleEmployeeClick(employee.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={employee.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`}
                      alt={employee.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {employee.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${employee.salary?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${employee.attendance}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-900">{employee.attendance}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {employee.status}
                  </span>
                </td>
                <td>
                    {employee.role}
                </td>
           
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading employees</p>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Add Employee Button */}
      {role==="ADMIN"&&(
          
          <div className="flex justify-end mb-6">
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-purple-600 font-semibold transition-all"
          onClick={() => setShowAddModal(true)}
          >
          + Add Employee
        </button>
      </div>
        )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold"
              onClick={() => setShowAddModal(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Add New Employee</h2>
            <form className="space-y-4" onSubmit={handleAddEmployee}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={formData.name} onChange={handleFormChange} required className="input p-2 border border-blue-800 rounded-lg" placeholder="Name" />
                <input name="email" value={formData.email} onChange={handleFormChange} required className="input p-2 border border-blue-800 rounded-lg" placeholder="Email" type="email" />
                <input name="age" value={formData.age} onChange={handleFormChange}  className="input p-2 border border-blue-800 rounded-lg" placeholder="Age" type="number" />
                <input name="department" value={formData.department} onChange={handleFormChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Department" />
                <input name="position" value={formData.position} onChange={handleFormChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Position" />
                <input name="salary" value={formData.salary} onChange={handleFormChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Salary" type="number" />
                <input name="subjects" value={formData.subjects} onChange={handleFormChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Subjects (comma separated)" />
                <input name="avatar" value={formData.avatar} onChange={handleFormChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Avatar URL" />
                <input name="phone" value={formData.phone} onChange={handleFormChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Phone" />
                <input name="address" value={formData.address} onChange={handleFormChange} className="input p-2 border border-blue-800 rounded-lg" placeholder="Address" />
                <select name="status" value={formData.status} onChange={handleFormChange} className="input p-2 border border-blue-800 rounded-lg">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <select name="role" value={formData.role} onChange={handleFormChange} className="input p-2 border border-blue-800 rounded-lg">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all">Add Employee</button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
            <p className="text-gray-600">Manage your team members and their information</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={totalCount}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Average Salary"
            value={`$${employees.length ? (employees.reduce((sum: number, emp: any) => sum + emp.salary, 0) / employees.length).toFixed(0) : '0'}`}
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Avg Attendance"
            value={`${(employees.reduce((sum: number, emp: any) => sum + emp.attendance, 0) / employees.length || 0).toFixed(1)}%`}
            icon={TrendingUp}
            color="bg-purple-500"
          />
          <StatCard
            title="Departments"
            value={new Set(employees.map((emp: any) => emp.department)).size}
            icon={Calendar}
            color="bg-orange-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('tile')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'tile' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={20} />
              </button>
            </div>

            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button> */}
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowUpDown size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GridView />
              </motion.div>
            ) : (
              <motion.div
                key="tile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sortedEmployees.map((employee: any, index: number) => (
                  <EmployeeCard key={employee.id} employee={employee} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {employees.length} of {totalCount} employees
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!hasPreviousPage}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasNextPage}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;