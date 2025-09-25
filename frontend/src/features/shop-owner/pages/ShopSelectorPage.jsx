import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/utils/api";
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import "@/features/shop-owner/styles/shop-owner-selector.css";

function ShopSelectorPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [activePage, setActivePage] = useState("shops");
  const [editingShop, setEditingShop] = useState(null);
  const [shopFormData, setShopFormData] = useState({ name: '', location: '' });
  
  // Get owner_id from localStorage
  const owner_id = localStorage.getItem("owner_id");
  const ownerName = localStorage.getItem("owner_name"); // We should save this during login

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!owner_id) {
      navigate("/owner-login");
      return;
    }
    fetchShops();
  }, [owner_id, navigate]);

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getShops(owner_id);
      // The api interceptor returns response.data directly, so we use the response
      setShops(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.message); // Show user-friendly error message
      console.error("Failed to fetch shops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectShop = (shop) => {
    // Store only the store id for downstream usage
    localStorage.setItem("selectedStoreId", String(shop.id));
    navigate("/dashboard");
  };

  const handleAddShop = async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      location: e.target.address.value,
      owner_id: parseInt(owner_id)
    };

    try {
      const response = await authService.createShop(formData);
      toast.success(response.message);
      fetchShops();
      setActivePage("shops");
      e.target.reset();
    } catch (error) {
      toast.error(error.message);
      console.error("Failed to create shop:", error);
    }
  };

  const handleEditShop = (shop) => {
    setEditingShop(shop.id);
    setShopFormData({
      name: shop.name,
      location: shop.location || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingShop(null);
    setShopFormData({ name: '', location: '' });
  };

  const handleUpdateShop = async (e, shopId) => {
    e.preventDefault();
    try {
      const response = await authService.updateShop(shopId, {
        ...shopFormData,
        owner_id: parseInt(owner_id)
      });
      toast.success(response.message);
      setEditingShop(null);
      fetchShops();
    } catch (error) {
      toast.error(error.message);
      console.error("Failed to update shop:", error);
    }
  };

  const handleDeleteShop = async (shopId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this shop? This action cannot be undone.")) {
      try {
        const response = await authService.deleteShop(shopId);
        toast.success(response.message);
        fetchShops();
      } catch (error) {
        toast.error(error.message);
        console.error("Failed to delete shop:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShopFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/owner-login");
  };

  const handleNavClick = (page) => {
    if (activePage === page && isMobile) {
      setIsSidebarOpen(false);
    } else {
      setActivePage(page);
      if (isMobile) {
        setIsSidebarOpen(true);
      }
    }
  };

  return (
    <div className="shop-selector-page">
      {/* Header */}
      <header className="top-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
          </button>
          <h1>StoreHub</h1>
        </div>
        <div className="header-right">
          <span className="user-info">
            <i className="fas fa-user-circle"></i>
            <span className="user-name">{ownerName}</span>
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span className="btn-text">Logout</span>
          </button>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <aside className={`sidebar ${!isSidebarOpen ? 'hidden' : ''}`}>
          <nav className="sidebar-nav">
            <button 
              className={activePage === "shops" ? "active" : ""}
              onClick={() => handleNavClick("shops")}
            >
              <i className="fas fa-store"></i>
              My Shops
            </button>
            <button 
              className={activePage === "add-shop" ? "active" : ""}
              onClick={() => handleNavClick("add-shop")}
            >
              <i className="fas fa-plus-circle"></i>
              Add Shop
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activePage === "shops" && (
            <div className="shops-grid">
              <h2>
                <i className="fas fa-store"></i>
                My Shops
              </h2>
              
              {isLoading ? (
                <div className="loading-spinner">Loading...</div>
              ) : shops.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-store-alt-slash"></i>
                  <h3>No Shops Found</h3>
                  <p>Start by adding your first shop!</p>
                  <button onClick={() => handleNavClick("add-shop")}>
                    <i className="fas fa-plus"></i>
                    Add New Shop
                  </button>
                </div>
              ) : (
                <div className="shop-cards">
                  {shops.map((shop) => (
                    <div key={shop.id} className="shop-card">
                      {editingShop === shop.id ? (
                        <div className="shop-edit-form">
                          <input
                            type="text"
                            name="name"
                            value={shopFormData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Shop Name"
                          />
                          <input
                            type="text"
                            name="location"
                            value={shopFormData.location}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Location"
                          />
                          <div className="form-actions">
                            <button 
                              type="button" 
                              className="btn-save"
                              onClick={(e) => handleUpdateShop(e, shop.id)}
                            >
                              <FaSave /> Save
                            </button>
                            <button 
                              type="button" 
                              className="btn-cancel"
                              onClick={handleCancelEdit}
                            >
                              <FaTimes /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="shop-card-header">
                            <div className="shop-icon">
                              <i className="fas fa-store"></i>
                            </div>
                            <div className="shop-actions">
                              <button 
                                className="btn-edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditShop(shop);
                                }}
                                title="Edit shop"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="btn-delete"
                                onClick={(e) => handleDeleteShop(shop.id, e)}
                                title="Delete shop"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          <h3>{shop.name}</h3>
                          <p>{shop.location}</p>
                          <button 
                            className="view-dashboard"
                            onClick={() => handleSelectShop(shop)}
                          >
                            View Dashboard
                            <i className="fas fa-arrow-right"></i>
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activePage === "add-shop" && (
            <div className="add-shop-form">
              <h2>
                <i className="fas fa-plus-circle"></i>
                Add New Shop
              </h2>
              <form onSubmit={handleAddShop}>
                <div className="form-group">
                  <label>
                    <i className="fas fa-store"></i>
                    Shop Name
                  </label>
                  <input 
                    name="name" 
                    type="text" 
                    placeholder="Enter shop name"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-map-marker-alt"></i>
                    Location
                  </label>
                  <input 
                    name="address" 
                    type="text" 
                    placeholder="Enter shop location"
                    required 
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    <i className="fas fa-check"></i>
                    Create Shop
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => handleNavClick("shops")}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {isMobile && isSidebarOpen && (
        <div 
          className="overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default ShopSelectorPage;