import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidePanel from "../../../../components/AdminSidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export default function UserDetails() {
    const { id } = useParams()
    const [userDetails, setUserDetails] = useState({})

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/user')
            .then((res) => {
                if (!res.data.logged_in || res.data.role === "") {
                    navigate('/');
                    return;
                } 
            })
    }, []);

    useEffect(() => {
        axios.get(`https://caferealitea.onrender.com/api/users/${id}`)
        .then((res) => {
            setUserDetails(res.data)
        })
    }, [id])

    {/*
        API RESULTS 
        - id
        - first_name
        - last_name
        - username
        - email
        - role
    */}

    return (
        <>
        <div>
            <Link to={'/UserManagement'}>Back</Link>
            USER ID: {id}
            {userDetails.first_name} - {userDetails.last_name}
             
        </div>
        </>
    )
}