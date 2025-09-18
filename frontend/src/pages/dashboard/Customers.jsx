export default function Customers({ loggedInOwner, selectedShop, customers, setCustomers }) {
  if (!loggedInOwner || !selectedShop) return <p>Please select a shop.</p>;

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const phone = e.target.phone.value.trim();
    const address = e.target.address.value.trim();

    if (name && email && phone) {
      const newCustomer = { id: Date.now(), name, email, phone, address };
      setCustomers([...customers, newCustomer]);
      e.target.reset();
    }
  };

  return (
    <div>
      <h1>Customers</h1>
      <form onSubmit={handleAddCustomer}>
        <input name="name" placeholder="Name" required />
        <input name="email" placeholder="Email" required />
        <input name="phone" placeholder="Phone" required />
        <input name="address" placeholder="Address" />
        <button>Add</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, idx) => (
            <tr key={c.id}>
              <td>{idx + 1}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.address || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
