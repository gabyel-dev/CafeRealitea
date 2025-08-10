import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faClipboardList, faClockRotateLeft, faCoffee, faGauge, faMugHot, faUserGear} from '@fortawesome/free-solid-svg-icons';

const Dashboard = <FontAwesomeIcon icon={faGauge} className='text-amber-300 ' />
const History = <FontAwesomeIcon icon={faClockRotateLeft} className='text-amber-300 ' />
const OrderManagement = <FontAwesomeIcon icon={faClipboardList} className='text-amber-300 ' />
const Admin = <FontAwesomeIcon icon={faUserGear} className='text-amber-300 ' />
const logo = <FontAwesomeIcon icon={faMugHot} className='text-amber-300 text-2xl' />


export default function SidePanel({ activeTab, setActiveTab }) {
    return (
        <>
        <div className="__sidePanel__ w-80 h-screen bg-amber-800">
            <div className="__Top__ w-full h-17.5 bg-amber-900 text-center flex justify-center items-center gap-2">
                {logo}
                <p className="__logo__ text-white text-xl font-bold">
                    Café Realitea
                </p>
            </div>

            <div className='__Middle__ flex flex-col gap-1 px-4 py-4'>
                <div className='w-full h-10 flex items-center text-sm gap-2 p-2 hover:bg-amber-700/15 hover:border-0  hover:rounded-md'>
                    {Dashboard}
                    <p className='text-amber-100 font-semibold'>Dashboard</p>
                </div>

                <div className='w-full h-10 flex items-center text-sm  gap-2 p-2 hover:bg-amber-700/15 hover:border-0  hover:rounded-md'>
                    {History}
                    <p className='text-amber-100 font-semibold'>Sales History</p>
                </div>

                <div className='w-full h-10 flex items-center text-sm  gap-2 p-2 hover:bg-amber-700/15 hover:border-0  hover:rounded-md'>
                    {OrderManagement}
                    <p className='text-amber-100 font-semibold'>Order Management</p>
                </div>

                <div className='w-full h-10 flex items-center text-sm  gap-2 p-2 hover:bg-amber-700/15 hover:border-0  hover:rounded-md'>
                    {Admin}
                    <p className='text-amber-100 font-semibold'>Admin Settings</p>
                </div>
            </div>
        </div>
        </>
    )
}