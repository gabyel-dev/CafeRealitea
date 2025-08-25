import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"

export default function UserDetails() {
    const { id } = useParams()
    const [userDetails, setUserDetails] = useState({})

    useEffect(() => {
        axios.get(`https://caferealitea.onrender.com/api/users/${id}`)
        .then((res) => {
            setUserDetails(res.data)
        })
    }, [id])

    return (
        <>
        <div>
            USER ID: {id}
            {userDetails.first_name}
        </div>
        </>
    )
}