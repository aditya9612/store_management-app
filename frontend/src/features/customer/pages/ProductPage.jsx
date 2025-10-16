import React, { useState, useEffect } from 'react';
import { FaStar, FaHeart, FaShoppingCart, FaFilter, FaSort, FaEye, FaThLarge, FaList, FaSearch } from 'react-icons/fa';
import p1 from "@shared/assets/images/p1.png";
import p2 from "@shared/assets/images/p2.png";
import p3 from "@shared/assets/images/p3.png";
import p4 from "@shared/assets/images/p4.png";
import p5 from "@shared/assets/images/p5.png";
import p6 from "@shared/assets/images/p6.png";
import "@/features/customer/styles/customer-global.css";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // Enhanced product data
    const mockProducts = [
      {
        id: 1,
        img: p1,
        name: "Premium Cotton Shirt",
        category: "clothing",
        price: 75,
        originalPrice: 95,
        rating: 4.8,
        reviews: 124,
        description: "High-quality cotton shirt perfect for casual and formal occasions.",
        inStock: true,
        featured: true,
        tags: ["bestseller", "cotton", "casual"]
      },
      {
        id: 2,
        img: p2,
        name: "Elegant Summer Dress",
        category: "clothing",
        price: 80,
        originalPrice: 120,
        rating: 4.9,
        reviews: 89,
        description: "Beautiful summer dress made from breathable fabric.",
        inStock: true,
        featured: false,
        tags: ["summer", "elegant", "women"]
      },
      {
        id: 3,
        img: p3,
        name: "Classic Men's Watch",
        category: "accessories",
        price: 68,
        originalPrice: 85,
        rating: 4.6,
        reviews: 156,
        description: "Timeless design with premium leather strap.",
        inStock: true,
        featured: false,
        tags: ["classic", "leather", "men"]
      },
      {
        id: 4,
        img: p4,
        name: "Designer Handbag",
        category: "accessories",
        price: 95,
        originalPrice: 130,
        rating: 4.7,
        reviews: 78,
        description: "Stylish handbag with multiple compartments.",
        inStock: false,
        featured: true,
        tags: ["designer", "stylish", "women"]
      },
      {
        id: 5,
        img: p5,
        name: "Premium Men's Shoes",
        category: "footwear",
        price: 58,
        originalPrice: 75,
        rating: 4.5,
        reviews: 92,
        description: "Comfortable and stylish shoes for everyday wear.",
        inStock: true,
        featured: false,
        tags: ["comfortable", "stylish", "men"]
      },
      {
        id: 6,
        img: p6,
        name: "Luxury Sneakers",
        category: "footwear",
        price: 88,
        originalPrice: 110,
        rating: 4.4,
        reviews: 134,
        description: "High-performance sneakers with modern design.",
        inStock: true,
        featured: false,
        tags: ["luxury", "performance", "unisex"]
      }
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id - a.id;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, activeCategory, sortBy, searchTerm]);

  const categories = [
    { id: 'all', label: 'All Products', count: products.length },
    { id: 'clothing', label: 'Clothing', count: products.filter(p => p.category === 'clothing').length },
    { id: 'accessories', label: 'Accessories', count: products.filter(p => p.category === 'accessories').length },
    { id: 'footwear', label: 'Footwear', count: products.filter(p => p.category === 'footwear').length },
  ];

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < Math.floor(rating) ? 'star filled' : 'star'}
      />
    ));
  };

  return (
    <div className="products-page">
      {/* Hero Section */}
      <section className="products-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Discover Amazing Products</h1>
            <p className="hero-description">
              Browse our curated collection of high-quality products from trusted brands.
              Find everything you need in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-grid">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <div className="category-info">
                  <h3>{category.label}</h3>
                  <p>{category.count} products</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="products-controls">
        <div className="container">
          <div className="controls-bar">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="controls-group">
              <div className="sort-control">
                <FaSort />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <div className="view-controls">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <FaThLarge />
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-grid-section">
        <div className="container">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">
                <FaSearch />
              </div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className={`products-grid ${viewMode}`}>
              {filteredProducts.map((product) => (
                <div key={product.id} className={`product-card ${product.featured ? 'featured' : ''} ${!product.inStock ? 'out-of-stock' : ''}`}>
                  <div className="product-image">
                    <img src={product.img} alt={product.name} />
                    {!product.inStock && (
                      <div className="out-of-stock-overlay">
                        <span>Out of Stock</span>
                      </div>
                    )}

                    <div className="product-actions">
                      <button
                        className={`action-btn wishlist ${wishlist.includes(product.id) ? 'active' : ''}`}
                        onClick={() => toggleWishlist(product.id)}
                        title="Add to Wishlist"
                      >
                        <FaHeart />
                      </button>
                      <button className="action-btn quick-view" title="Quick View">
                        <FaEye />
                      </button>
                    </div>

                    {product.featured && (
                      <div className="featured-badge">Featured</div>
                    )}

                    {product.originalPrice > product.price && (
                      <div className="discount-badge">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="product-info">
                    <div className="product-meta">
                      <span className="product-category">{product.category}</span>
                      <div className="product-rating">
                        <div className="stars">
                          {renderStars(product.rating)}
                        </div>
                        <span className="rating-text">({product.reviews})</span>
                      </div>
                    </div>

                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>

                    <div className="product-pricing">
                      <div className="price-info">
                        {product.originalPrice > product.price && (
                          <span className="original-price">${product.originalPrice}</span>
                        )}
                        <span className="current-price">${product.price}</span>
                      </div>
                    </div>

                    <div className="product-actions-bottom">
                      <button
                        className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                        disabled={!product.inStock}
                      >
                        <FaShoppingCart />
                        {!product.inStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="products-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Stay Updated</h2>
              <p>Get notified about new products and exclusive offers</p>
            </div>
            <div className="cta-form">
              <input type="email" placeholder="Enter your email" />
              <button className="cta-btn">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
