import p1 from "@assets/images/p1.png";
import p2 from "@assets/images/p2.png";
import p3 from "@assets/images/p3.png";

export default function Product() {
  return (
    <>
      <section className="inner_page_head">
        <div className="container_fuild">
          <div className="row">
            <div className="col-md-12">
              <div className="full">
                <h3>Product Grid</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="product_section layout_padding">
        <div className="container">
          <div className="heading_container heading_center">
            <h2>
              Our <span>products</span>
            </h2>
          </div>
          <div className="row">
            <div className="col-sm-6 col-md-4 col-lg-3">
              <div className="box">
                <div className="img-box">
                  <img src={p1} alt="product" />
                </div>
                <div className="detail-box">
                  <h5>Men&apos;s Shirt</h5>
                  <h6>$75</h6>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 col-lg-3">
              <div className="box">
                <div className="img-box">
                  <img src={p2} alt="product" />
                </div>
                <div className="detail-box">
                  <h5>Men&apos;s Shirt</h5>
                  <h6>$80</h6>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-4 col-lg-3">
              <div className="box">
                <div className="img-box">
                  <img src={p3} alt="product" />
                </div>
                <div className="detail-box">
                  <h5>Women&apos;s Dress</h5>
                  <h6>$68</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
