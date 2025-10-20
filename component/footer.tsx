import { FaRegCopyright } from "react-icons/fa6";
export default function Foot(){
    const currentYear = new Date().getFullYear();
    return <footer className="flex justify-center items-center bg-violet-500 py-2">
        <p className="flex gap-2 text-lg">All rights are reverved. <span className="flex justify-center items-center"><FaRegCopyright /> {currentYear}</span></p>
    </footer>
}