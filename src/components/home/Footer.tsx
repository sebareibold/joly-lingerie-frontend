import { Instagram, Facebook, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#F8F5ED] text-[#5C4033] py-16 md:py-20 border-t border-[#D4C7B0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Brand and Purpose */}
          <div className="md:col-span-1 text-center md:text-left">
            <h3 className="font-serif text-4xl font-medium tracking-wide mb-4 text-[#5C4033]">
              Joly <span className="font-light italic text-[#8B735C]">Lingerie</span>
              <sup className="text-sm">™</sup>
            </h3>
            <p className="text-[#5C4033] font-light mb-8 max-w-md mx-auto md:mx-0 leading-relaxed text-lg">
              Descubre una cuidada selección de lencería que complementa tu estilo único. Calidad, elegancia y diseño en
              cada pieza para celebrar tu feminidad.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="bg-[#EDE8DD] p-3 rounded-full hover:bg-[#D4C7B0] transition-all duration-300 hover:scale-110"
                >
                  <Icon className="h-5 w-5 text-[#5C4033]" />
                </a>
              ))}
            </div>
          </div>

          {/* Designer Info */}
          <div className="md:col-span-1 text-center md:text-right mt-8 md:mt-0">
            <p className="font-light text-lg text-[#5C4033]">
              Diseñado y Desarrollado por <br className="md:hidden" />{" "}
              <span className="font-medium">Obbware Tecnology</span>
            </p>
            <p className="text-sm text-[#8B735C] mt-2">
              © {new Date().getFullYear()} Joly Lingerie. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
