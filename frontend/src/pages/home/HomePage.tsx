import { FeatureListComponent } from "@components/landing/FeatureListComponent"
import { FooterComponent } from "@components/landing/FooterComponent"
import { HeroComponent } from "@components/landing/HeroComponent"
import { MainContent } from "@components/landing/MainContent"
import { NavbarComponent } from "@components/landing/NavbarComponent"
// import { PricingComponent } from "@components/landing/PricingComponent"
import { TestimonialComponent } from "@components/landing/TestimonialComponent"

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavbarComponent />

      <HeroComponent />

      <MainContent />
      
      <FeatureListComponent />
      
      <TestimonialComponent />
      
      {/* <PricingComponent /> */}
      
      <FooterComponent />
    </div>
  )
}

export default HomePage