import React, { useEffect, useState } from "react";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de cet utilisateur ?"))
      return;
    try {
      await fetch(`http://localhost:5000/users/${id}`, {
        method: "DELETE",
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers =
    roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="user-mgmt-wrapper">
      <div className="user-mgmt-container">
        <h2 className="user-mgmt-title">👥 Gestion des utilisateurs</h2>

        <div className="user-mgmt-filter">
          <label htmlFor="role-filter">Filtrer par rôle: </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="client">Client</option>
            <option value="prestataire">Prestataire</option>
            <option value="vendeur">Vendeur</option>
            <option value="livreur">Livreur</option>
          </select>
        </div>

        {loading ? (
          <p className="user-mgmt-loading">Chargement...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="user-mgmt-empty">Aucun utilisateur trouvé.</p>
        ) : (
          <table className="user-mgmt-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName || u.nom}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="user-mgmt-delete-btn"
                      onClick={() => handleDelete(u.id)}
                    >
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="user-mgmt-pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`pagination-btn ${
                  currentPage === i + 1 ? "active" : ""
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
