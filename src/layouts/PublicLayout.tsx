import { Outlet } from "react-router-dom"
import Header from "../components/home/Header"
import Footer from "../components/home/Footer"

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
