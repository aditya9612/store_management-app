export default function About() {
  return (
    <>
      {/* Page Header */}
      <section className="inner_page_head">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="full">
                <h3>About Us</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Shop Section */}
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
                  <p>Enjoy free shipping on all products without hidden charges.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="box">
                <div className="detail-box">
                  <h5>Best Quality</h5>
                  <p>We provide only the best quality products for our customers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
