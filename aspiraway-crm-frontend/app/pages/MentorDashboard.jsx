import React from "react";
import Sidebar from "../components/Sidebar"; // we'll create this next

const MentorDashboard = () => {
  const role = "mentor"; // hardcode for now

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
          <div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Profile
            </button>
          </div>
        </div>

        {/* Content will go here */}
        <div id="dashboard-content">
          {/* We'll add cards and tables next */}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
