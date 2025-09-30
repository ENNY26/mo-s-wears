import AddProduct from "./AddProduct";
import Homepage from "../pages/Homepage";

const AdminPage = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AddProduct />
      <hr />
      <Homepage showAdminTools={true} />
    </div>
  );
};

export default AdminPage;
