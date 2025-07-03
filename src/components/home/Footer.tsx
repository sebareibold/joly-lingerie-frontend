import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#F8F5ED] text-[#5C4033] py-8 md:py-12 border-t border-[#D4C7B0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Brand and Purpose */}
          <div className="md:col-span-1 text-center md:text-left">
            <h3 className="font-serif text-2xl font-medium tracking-wide mb-2 text-[#5C4033]">
              Joly{" "}
              <span className="font-light italic text-[#8B735C]">Lingerie</span>
            </h3>
            <p className="text-[#5C4033] font-light mb-4 max-w-md mx-auto md:mx-0 leading-relaxed text-sm">
              Descubre una cuidada selección de lencería que complementa tu
              estilo único. Calidad, elegancia y diseño en cada pieza para
              celebrar tu feminidad.
            </p>
            <div className="flex space-x-3 justify-center md:justify-start">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="bg-[#EDE8DD] p-2 rounded-full hover:bg-[#D4C7B0] transition-all duration-300 hover:scale-110"
                >
                  <Icon className="h-4 w-4 text-[#5C4033]" />
                </a>
              ))}
            </div>
          </div>

          {/* Designer Info */}
          <div className="md:col-span-1 text-center md:text-right mt-4 md:mt-0">
            <div className="font-light text-sm text-[#5C4033] space-y-1">
              <p className="text-xs text-[#8B735C] uppercase tracking-wide">Desarrollado por</p>
              <p className="font-medium">Sebastián Alejandro Reibold</p>
              <p className="text-xs text-[#8B735C]">Obbware Technology</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
