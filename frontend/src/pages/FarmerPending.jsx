import React from "react";

const FarmerPending = ({ user }) => {
  if (!user || user.role !== "farmer") {
    return (
      <div className="dashboard">
        <h1>Access Denied ❌ not a farmer</h1>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {user.status === "pending" ? (
        <h1>
          Hi, {user.name} Your account is pending approval. Please wait for an admin to approve
          your account.
        </h1>
      ):(
        <h1>Sorry {user.name} Your account has been rejected ❌</h1>
      )}
    </div>
  );
};

export default FarmerPending;
