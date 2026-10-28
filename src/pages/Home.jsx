import AnnouncementBar from '../components/AnnouncementBar.jsx'
import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import BenefitsBar from '../components/BenefitsBar.jsx'
import CategorySection from '../components/CategorySection.jsx'
import ProductSection from '../components/ProductSection.jsx'
import PromoSection from '../components/PromoSection.jsx'
import CollectionSection from '../components/CollectionSection.jsx'
import EditorialBand from '../components/EditorialBand.jsx'
import ChatWidget from '../components/ChatWidget.jsx'
import BackToTop from '../components/BackToTop.jsx'
import Footer from '../components/Footer.jsx'
import CartDrawer from '../components/CartDrawer.jsx'
import InfoModal from '../components/InfoModal.jsx'
import CheckoutModal from '../components/CheckoutModal.jsx'
import InventoryModal from '../components/InventoryModal.jsx'
import { CartProvider } from '../context/CartContext.jsx'
import { WishlistProvider } from '../context/WishlistContext.jsx'
import { ShopProvider } from '../context/ShopContext.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { InventoryProvider } from '../context/InventoryContext.jsx'
import { InfoProvider } from '../context/InfoContext.jsx'
import { CheckoutProvider } from '../context/CheckoutContext.jsx'

/**
 * Homepage composition, following the reference hierarchy in PRD §3:
 * announcement → header → hero → benefits → categories → new arrivals →
 * promos → collections → editorial band → dark footer.
 */
export default function Home() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <WishlistProvider>
          <CartProvider>
            <ShopProvider>
              <InfoProvider>
                <CheckoutProvider>
                  <a
                    href="#main"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-ink focus:px-4 focus:py-2 focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-label focus:text-white"
                  >
                    Skip to content
                  </a>

                  <AnnouncementBar />
                  <Header />

                  <main id="main">
                    <Hero />
                    <BenefitsBar />
                    <CategorySection />
                    <ProductSection />
                    <PromoSection />
                    <CollectionSection />
                    <EditorialBand />
                  </main>

                  <Footer />

                  <ChatWidget />
                  <BackToTop />
                  <CartDrawer />
                  <InfoModal />
                  <CheckoutModal />
                  <InventoryModal />
                </CheckoutProvider>
              </InfoProvider>
            </ShopProvider>
          </CartProvider>
        </WishlistProvider>
      </InventoryProvider>
    </AuthProvider>
  )
}
