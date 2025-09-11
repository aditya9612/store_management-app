export default function Contact() {
  return (
    <>
      {/* Page Header */}
      <section className="inner_page_head">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="full">
                <h3>Contact Us</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="why_section layout_padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <div className="full">
                <form onSubmit={(e) => e.preventDefault()}>
                  <fieldset>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="Enter your full name" 
                      aria-label="Full Name" 
                      required 
                    />
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Enter your email address" 
                      aria-label="Email Address" 
                      required 
                    />
                    <input 
                      type="text" 
                      name="subject" 
                      placeholder="Enter subject" 
                      aria-label="Subject" 
                      required 
                    />
                    <textarea 
                      name="message" 
                      placeholder="Enter your message" 
                      aria-label="Message" 
                      required
                    ></textarea>
                    <input type="submit" value="Submit" />
                  </fieldset>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
