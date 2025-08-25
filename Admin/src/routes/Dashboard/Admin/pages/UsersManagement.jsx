import AdminSidePanel from "../../../../components/AdminSidePanel";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function UsersManagement({ activeTab, setActiveTab }) {
    const [users, setUsers] = useState([])

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/users_account')
        .then((res) => {
            setUsers(res.data)
        })
    }, [])
    return (
        <>
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="h-screen ml-65">
                {users.map((user) => (
                    <div key={user.id}>
                        <p>{user.first_name} {user.last_name} {user.email} {user.role}</p>
                        <Link to={`/Admin/UserManagement/${user.id}`}>Detailed View</Link>
                    </div>
                ))}
            </div>
        </>
    )
}