import sliderBg from "@assets/images/slider-bg.jpg";
import p1 from "@assets/images/p1.png";
import p2 from "@assets/images/p2.png";
import p3 from "@assets/images/p3.png";
import p4 from "@assets/images/p4.png";
import p5 from "@assets/images/p5.png";
import p6 from "@assets/images/p6.png";
import p7 from "@assets/images/p7.png";
import p8 from "@assets/images/p8.png";
import p9 from "@assets/images/p9.png";
import p10 from "@assets/images/p10.png";
import p11 from "@assets/images/p11.png";
import p12 from "@assets/images/p12.png";

export default function Home() {
  return (
    <>
      {/* Slider Section */}
      <section className="slider_section">
        <div className="slider_bg_box">
          <img src={sliderBg} alt="Shop background" />
        </div>

        <div id="customCarousel1" className="carousel slide" data-ride="carousel">
          <div className="carousel-inner">
            {/* Slide 1 */}
            <div className="carousel-item active">
              <div className="container">
                <div className="row">
                  <div className="col-md-7 col-lg-6">
                    <div className="detail-box">
                      <h1>
                        <span>Sale 20% Off</span>
                        <br />
                        On Everything
                      </h1>
                      <p>
                        Grab the best deals today with exclusive discounts on all products.
                      </p>
                      <div className="btn-box">
                        <a href="#" className="btn1">
                          Shop Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="carousel-item">
              <div className="container">
                <div className="row">
                  <div className="col-md-7 col-lg-6">
                    <div className="detail-box">
                      <h1>
                        <span>Special Offer</span>
                        <br />
                        Limited Time Only
                      </h1>
                      <p>
                        Don’t miss out on exclusive limited-time deals across all categories.
                      </p>
                      <div className="btn-box">
                        <a href="#" className="btn1">
                          Shop Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 3 */}
            <div className="carousel-item">
              <div className="container">
                <div className="row">
                  <div className="col-md-7 col-lg-6">
                    <div className="detail-box">
                      <h1>
                        <span>New Arrivals</span>
                        <br />
                        At Great Prices
                      </h1>
                      <p>
                        Discover the latest fashion trends at affordable prices today.
                      </p>
                      <div className="btn-box">
                        <a href="#" className="btn1">
                          Shop Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel indicators */}
          <div className="container">
            <ol className="carousel-indicators">
              <li data-target="#customCarousel1" data-slide-to="0" className="active"></li>
              <li data-target="#customCarousel1" data-slide-to="1"></li>
              <li data-target="#customCarousel1" data-slide-to="2"></li>
            </ol>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="why_section layout_padding">
        <div className="container">
          <div className="heading_container heading_center">
            <h2>Why Shop With Us</h2>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="box">
                <div className="detail-box">
                  <h5>Fast Delivery</h5>
                  <p>We ensure quick and reliable delivery for all your orders.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="box">
                <div className="detail-box">
                  <h5>Free Shipping</h5>
                  <p>Enjoy free shipping on all products with no hidden charges.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="box">
                <div className="detail-box">
                  <h5>Best Quality</h5>
                  <p>We deliver only the highest quality products for our customers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="product_section layout_padding">
        <div className="container">
          <div className="heading_container heading_center">
            <h2>
              Our <span>Products</span>
            </h2>
          </div>
          <div className="row">
            {[p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12].map((img, idx) => (
              <div key={idx} className="col-sm-6 col-md-4 col-lg-3">
                <div className="box">
                  <div className="img-box">
                    <img src={img} alt={`Product ${idx + 1}`} />
                  </div>
                  <div className="detail-box">
                    <h5>{idx % 2 === 0 ? "Men's Shirt" : "Women's Dress"}</h5>
                    <h6>${60 + idx * 5}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="btn-box">
            <a href="#">View All Products</a>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="subscribe_section">
        <div className="container-fluid">
          <div className="box">
            <div className="row">
              <div className="col-md-6 offset-md-3">
                <div className="subscribe_form">
                  <div className="heading_container heading_center">
                    <h3>Subscribe To Get Discount Offers</h3>
                  </div>
                  <p>
                    Sign up to receive the latest news, exclusive deals, and special offers
                    directly in your inbox.
                  </p>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <input type="email" placeholder="Enter your email" required />
                    <button type="submit">Subscribe</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
