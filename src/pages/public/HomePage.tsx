"use client"

import HeroSection from "../../components/home/HeroSection"
import ProductCatalog from "../../components/home/ProductCatalog"
import ContactSection from "../../components/home/ContactSection"
import {
  Truck,
  Award,
  Users,
  Heart,
  Star,
  ShieldCheck,
  Leaf,
  Gem,
  Sparkles,
  Gift,
  MessageSquare,
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Package,
  RefreshCw,
  Zap,
  Lightbulb,
  Handshake,
  Smile,
  Palette,
  Ruler,
  Tag,
  ShoppingCart,
  CreditCard,
  Lock,
  Globe,
  Camera,
  Book,
  Briefcase,
  Calendar,
  CheckCircle,
  CircleDollarSign,
  Cloud,
  Code,
  Coffee,
  Compass,
  Cpu,
  Crosshair,
  Database,
  Diamond,
  Dices,
  Disc,
  Droplet,
  Feather,
  Fingerprint,
  Flame,
  Folder,
  Gamepad,
  Gauge,
  Gavel,
  Ghost,
  GraduationCap,
  Grid,
  Hammer,
  Headphones,
  HelpCircle,
  Home,
  Image,
  Inbox,
  Key,
  Laptop,
  LifeBuoy,
  Link,
  List,
  Map,
  Megaphone,
  MicIcon as Microphone,
  Monitor,
  Moon,
  Mouse,
  Music,
  Navigation,
  Newspaper,
  Package2,
  Paperclip,
  PenToolIcon as Tool,
  Percent,
  PieChart,
  PiggyBank,
  Pin,
  Plane,
  Plug,
  Pocket,
  Power,
  Printer,
  Puzzle,
  QrCode,
  Quote,
  Radio,
  Receipt,
  Rocket,
  Rss,
  Scale,
  Scissors,
  Search,
  Send,
  Server,
  Settings,
  Share,
  Shield,
  Ship,
  Signal,
  Sliders,
  Speaker,
  Square,
  Sun,
  Tablet,
  Target,
  Tent,
  Terminal,
  ThumbsUp,
  Ticket,
  Timer,
  ToggleLeft,
  Train,
  TrendingUp,
  Trophy,
  Umbrella,
  Unlock,
  Upload,
  User,
  Utensils,
  Vegan,
  Verified,
  Video,
  Voicemail,
  Volume,
  Wallet,
  Wand,
  Watch,
  Waves,
  Webcam,
  Wifi,
  Wind,
  Wine,
  Wrench,
  X,
  Youtube,
  ZoomIn,
  ZoomOut,
  Info,
  Instagram,
  Facebook,
  Linkedin,
  Github,
} from "lucide-react"
import type React from "react"
import { useState, useEffect } from "react"
import { apiService } from "../../services/api"
import { ImageIcon } from "lucide-react"

// Definición de tipos para el contenido
interface CategoryContent {
  name: string
  display_name: string
}

interface ValueContent {
  icon: string
  title: string
  description: string
}

// NUEVAS INTERFACES PARA CONTACTO
interface ContactDetailContent {
  icon: string
  title: string
  details: string[]
  description?: string
}

interface SocialMediaLinkContent {
  icon: string
  name: string
  handle: string
  link: string
}

interface SiteContent {
  hero: {
    mainDescription: string
    slogan: string
    buttonText: string
    buttonLink: string
  }
  productCatalog: {
    mainTitle: string
    subtitle: string
    categories: CategoryContent[]
  }
  whyChooseJoly: {
    mainTitle: string
    description: string
    values: ValueContent[]
  }
  contact: {
    mainTitle: string
    subtitle: string
    description: string
    formTitle: string
    formDescription: string
    responseMessage: string
    responseDisclaimer: string
    contactInfo: ContactDetailContent[] // Nuevo
    socialMedia: SocialMediaLinkContent[] // Nuevo
  }
}

// Mapeo de nombres de iconos a componentes Lucide React
const iconMap: { [key: string]: React.ElementType } = {
  Truck: Truck,
  Award: Award,
  Users: Users,
  Heart: Heart,
  Star: Star,
  ShieldCheck: ShieldCheck,
  Leaf: Leaf,
  Gem: Gem,
  Sparkles: Sparkles,
  Gift: Gift,
  MessageSquare: MessageSquare,
  MapPin: MapPin,
  Phone: Phone,
  Mail: Mail,
  Clock: Clock,
  DollarSign: DollarSign,
  Package: Package,
  RefreshCw: RefreshCw,
  Zap: Zap,
  Lightbulb: Lightbulb,
  Handshake: Handshake,
  Smile: Smile,
  Palette: Palette,
  Ruler: Ruler,
  Tag: Tag,
  ShoppingCart: ShoppingCart,
  CreditCard: CreditCard,
  Lock: Lock,
  Globe: Globe,
  Camera: Camera,
  Book: Book,
  Briefcase: Briefcase,
  Calendar: Calendar,
  CheckCircle: CheckCircle,
  CircleDollarSign: CircleDollarSign,
  Cloud: Cloud,
  Code: Code,
  Coffee: Coffee,
  Compass: Compass,
  Cpu: Cpu,
  Crosshair: Crosshair,
  Database: Database,
  Diamond: Diamond,
  Dices: Dices,
  Disc: Disc,
  Droplet: Droplet,
  Feather: Feather,
  Fingerprint: Fingerprint,
  Flame: Flame,
  Folder: Folder,
  Gamepad: Gamepad,
  Gauge: Gauge,
  Gavel: Gavel,
  Ghost: Ghost,
  GraduationCap: GraduationCap,
  Grid: Grid,
  Hammer: Hammer,
  Headphones: Headphones,
  HelpCircle: HelpCircle,
  Home: Home,
  Image: Image,
  Inbox: Inbox,
  Key: Key,
  Laptop: Laptop,
  LifeBuoy: LifeBuoy,
  Link: Link,
  List: List,
  Map: Map,
  Megaphone: Megaphone,
  Microphone: Microphone,
  Monitor: Monitor,
  Moon: Moon,
  Mouse: Mouse,
  Music: Music,
  Navigation: Navigation,
  Newspaper: Newspaper,
  Package2: Package2,
  Paperclip: Paperclip,
  Percent: Percent,
  PieChart: PieChart,
  PiggyBank: PiggyBank,
  Pin: Pin,
  Plane: Plane,
  Plug: Plug,
  Pocket: Pocket,
  Power: Power,
  Printer: Printer,
  Puzzle: Puzzle,
  QrCode: QrCode,
  Quote: Quote,
  Radio: Radio,
  Receipt: Receipt,
  Rocket: Rocket,
  Rss: Rss,
  Scale: Scale,
  Scissors: Scissors,
  Search: Search,
  Send: Send,
  Server: Server,
  Settings: Settings,
  Share: Share,
  Shield: Shield,
  Ship: Ship,
  Signal: Signal,
  Sliders: Sliders,
  Speaker: Speaker,
  Square: Square,
  Sun: Sun,
  Tablet: Tablet,
  Target: Target,
  Tent: Tent,
  Terminal: Terminal,
  ThumbsUp: ThumbsUp,
  Ticket: Ticket,
  Timer: Timer,
  ToggleLeft: ToggleLeft,
  Tool: Tool,
  Train: Train,
  TrendingUp: TrendingUp,
  Trophy: Trophy,
  Umbrella: Umbrella,
  Unlock: Unlock,
  Upload: Upload,
  User: User,
  Utensils: Utensils,
  Vegan: Vegan,
  Verified: Verified,
  Video: Video,
  Voicemail: Voicemail,
  Volume: Volume,
  Wallet: Wallet,
  Wand: Wand,
  Watch: Watch,
  Waves: Waves,
  Webcam: Webcam,
  Wifi: Wifi,
  Wind: Wind,
  Wine: Wine,
  Wrench: Wrench,
  X: X,
  Youtube: Youtube,
  ZoomIn: ZoomIn,
  ZoomOut: ZoomOut,
  Info: Info, // Añadir un icono por defecto si no se encuentra
  Instagram: Instagram, // Añadido
  Facebook: Facebook, // Añadido
  Linkedin: Linkedin, // Añadido
  Github: Github, // Añadido
}

// Componente BrandValues (extraído para claridad)
function BrandValues({ content }: { content: SiteContent["whyChooseJoly"] }) {
  // Usar los valores del contenido dinámico
  const values = content.values.map((val) => ({
    icon: iconMap[val.icon] || Info, // Usar el mapeo de iconos, con Info como fallback
    title: val.title,
    description: val.description,
  }))

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--pure-white)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.3em] font-medium mb-6" style={{ color: "var(--clay)" }}>
            Por qué elegir Joly
          </p>
          <h2
            className="font-serif text-4xl lg:text-5xl font-light mb-8 tracking-wide"
            style={{ color: "var(--deep-clay)" }}
          >
            {content.mainTitle.split(" ")[0]}{" "}
            <span className="italic" style={{ color: "var(--clay)" }}>
              {content.mainTitle.split(" ").slice(1).join(" ")}
            </span>
          </h2>
          <p className="font-light leading-relaxed max-w-3xl mx-auto" style={{ color: "var(--dark-clay)" }}>
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, _index) => (
            <div
              key={value.title}
              className="text-center p-8 rounded-2xl hover:shadow-warm-lg transition-all duration-500 hover:scale-105"
              style={{ backgroundColor: "var(--creme)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-warm"
                style={{ backgroundColor: "var(--clay)" }}
              >
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-4 tracking-wide" style={{ color: "var(--deep-clay)" }}>
                {value.title}
              </h3>
              <p className="font-light leading-relaxed" style={{ color: "var(--dark-clay)" }}>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [contentError, setContentError] = useState<string | null>(null)

  useEffect(() => {
    const loadSiteContent = async () => {
      try {
        setLoadingContent(true)
        const response = await apiService.getSiteContent()
        if (response.success) {
          setSiteContent(response.content)
        } else {
          setContentError(response.error || "Error al cargar el contenido del sitio.")
        }
      } catch (err) {
        console.error("Error fetching site content:", err)
        setContentError("No se pudo cargar el contenido del sitio. Intente recargar la página.")
      } finally {
        setLoadingContent(false)
      }
    }
    loadSiteContent()
  }, [])

  if (loadingContent) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--soft-creme)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clay"></div>
        <p className="ml-3 text-clay">Cargando contenido del sitio...</p>
      </div>
    )
  }

  if (contentError || !siteContent) {
    return (
      <div className="text-center py-20" style={{ backgroundColor: "var(--soft-creme)" }}>
        <p className="text-red-500 text-lg">{contentError || "Contenido no disponible."}</p>
      </div>
    )
  }

  return (
    <>
      <HeroSection content={siteContent.hero} />
      <ProductCatalog content={siteContent.productCatalog} />
      <BrandValues content={siteContent.whyChooseJoly} />
      <ContactSection content={siteContent.contact} />
    </>
  )
}
