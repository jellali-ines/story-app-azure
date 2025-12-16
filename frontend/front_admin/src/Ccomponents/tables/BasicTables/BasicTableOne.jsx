// BasicTableOne.jsx
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge.jsx";
import { useNavigate } from "react-router-dom";
// Pagination Component (inchangé)
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage,
  onItemsPerPageChange 
}) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
      {/* Items per page selector */}
      <div className="flex items-center mb-4 sm:mb-0 space-x-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Show
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          entries
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-9 h-9 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* First page */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg transition-colors ${currentPage === 1
                ? "bg-brand-500 text-white"
                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
            >
              1
            </button>
            {startPage > 2 && (
              <span className="flex items-center justify-center w-9 h-9 text-gray-500 dark:text-gray-400">
                ...
              </span>
            )}
          </>
        )}

        {/* Page numbers */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg transition-colors ${currentPage === page
                ? "bg-brand-500 text-white"
                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
          >
            {page}
          </button>
        ))}

        {/* Last page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="flex items-center justify-center w-9 h-9 text-gray-500 dark:text-gray-400">
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg transition-colors ${currentPage === totalPages
                  ? "bg-brand-500 text-white"
                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-9 h-9 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Page info */}
      <div className="mt-4 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">
        Page <span className="font-medium text-gray-800 dark:text-white">{currentPage}</span> of{" "}
        <span className="font-medium text-gray-800 dark:text-white">{totalPages}</span>
      </div>
    </div>
  );
};

export default function BasicTableOne() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // État pour les données de l'API
  const [usersData, setUsersData] = useState({
    users: [],
    totalUsers: 0,
    totalPages: 1,
    page: 1,
    limit: 5
  });

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fonction pour formater le téléphone
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    const phoneStr = phone.toString();
    return `+216 ${phoneStr.slice(0, 2)} ${phoneStr.slice(2, 5)} ${phoneStr.slice(5)}`;
  };

  // Fetch users from API
  const fetchUsers = async (page, limit, search = "") => {
   const token=localStorage.getItem('token');
    
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit,
        ...(search && { search })
      };
      
      const response = await fetch(
        `${import.meta.env.VITE_GATEWAY_URL}/user/users?${new URLSearchParams(params)}`,
        { 
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
          }
        }
      );
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
      setUsersData({
        users: data.users,
        totalUsers: data.totalUsers,
        totalPages: data.totalPages,
        page: data.page,
        limit: data.limit
      });
      
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
      setUsersData({
        users: [],
        totalUsers: 0,
        totalPages: 1,
        page: 1,
        limit: itemsPerPage
      });
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount and when dependencies change
  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Calculate displayed range
  const startItem = (usersData.page - 1) * usersData.limit + 1;
  const endItem = Math.min(usersData.page * usersData.limit, usersData.totalUsers);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-800/50">
        <div className="relative w-full sm:w-auto mb-4 sm:mb-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by email, phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-3">
          {loading && (
            <div className="flex items-center text-sm text-brand-500">
              <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium text-gray-800 dark:text-white">{startItem}</span>-
            <span className="font-medium text-gray-800 dark:text-white">{endItem}</span> of <span className="font-medium text-gray-800 dark:text-white">{usersData.totalUsers}</span> users
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && usersData.users.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-500">Loading users...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-500 font-medium mb-2">{error}</p>
            <button 
              onClick={() => fetchUsers(currentPage, itemsPerPage, searchTerm)}
              className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  kids
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  isActive
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {usersData.users.length > 0 ? (
                usersData.users.map((user) => (
                  <TableRow key={user.user_name}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {user.user_name}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {user.phone}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.email}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex -space-x-2">
                    {/* {user.kids.images.map((kidimage, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                      >
                        <img
                          width={24}
                          height={24}
                          src={kidimage}
                          alt={`Team member ${index + 1}`}
                          className="w-full size-6"
                        />
                      </div>
                    ))} */}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      user.payment_expires_date<Date.now()
                        ? "success"
                        : "error"
                    }
                  >
                    {user.payment_expires_date>Date.now()?"expired":"active"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View"
                          onClick={() => navigate(`/admin/user/${user._id}`)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
              </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm">Try adjusting your search or filter</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Component */}
      {!loading && !error && usersData.users.length > 0 && (
        <Pagination
          currentPage={usersData.page}
          totalPages={usersData.totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={usersData.limit}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
}