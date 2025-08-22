import AdminSidePanel from "../../../../components/AdminSidePanel";
import { useEffect, useState } from "react";

export default function UsersManagement({ activeTab, setActiveTab }) {
    return (
        <>
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="h-screen ml-80">

            </div>
        </>
    )
}